import { blob } from '@nuxthub/blob'
import { isNotNull } from 'drizzle-orm'

const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24h
const MAX_ERRORS = 50

/**
 * Job 1: Orphan cleanup — ลบ slip blobs ที่ไม่มี payment.slip_key อ้างอิง และอัปโหลดเกิน 24 ชม.
 * Query: ?secret=... | dryRun=1 | devOnly=1 (ถ้า devOnly=1 ต้อง NODE_ENV=development)
 * Header: x-cron-secret
 */
export default defineEventHandler(async (event) => {
  const started = Date.now()
  const config = useRuntimeConfig()
  const secret = (config as { cronSecret?: string }).cronSecret ?? process.env.CRON_SECRET
  const query = getQuery(event) as { secret?: string; dryRun?: string; devOnly?: string }
  const provided = query.secret ?? getRequestHeader(event, 'x-cron-secret')
  if (secret && provided !== secret) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  if (query.devOnly === '1' && process.env.NODE_ENV !== 'development') {
    throw createError({ statusCode: 403, statusMessage: 'devOnly allowed in development only' })
  }

  const dryRun = query.dryRun === '1' || query.dryRun === 'true'

  const linkedKeys = new Set<string>()
  const payments = await db
    .select({ slipKey: schema.payment.slipKey })
    .from(schema.payment)
    .where(isNotNull(schema.payment.slipKey))
  for (const p of payments) {
    if (p.slipKey) linkedKeys.add(p.slipKey)
  }

  let cursor: string | undefined
  const cutoff = Date.now() - MAX_AGE_MS
  let deleted = 0
  const wouldDelete: string[] = []
  const errors: { pathname: string; message: string }[] = []

  do {
    const result = await blob.list({ prefix: 'slips/', cursor, limit: 100 })
    for (const b of result.blobs) {
      if (linkedKeys.has(b.pathname)) continue
      const uploaded = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0
      if (uploaded < cutoff) {
        if (dryRun) {
          wouldDelete.push(b.pathname)
          continue
        }
        try {
          await blob.del(b.pathname)
          deleted++
        } catch (e: unknown) {
          if (errors.length < MAX_ERRORS) {
            const msg = e instanceof Error ? e.message : String(e)
            errors.push({ pathname: b.pathname, message: msg })
          }
        }
      }
    }
    cursor = result.cursor
  } while (cursor)

  const durationMs = Date.now() - started
  return {
    success: true,
    job: 'cleanup_orphan_slips',
    timestamp: new Date().toISOString(),
    dryRun,
    deleted,
    wouldDeleteCount: dryRun ? wouldDelete.length : undefined,
    wouldDelete: dryRun ? wouldDelete.slice(0, 100) : undefined,
    durationMs,
    errors: errors.length > 0 ? errors : undefined,
  }
})
