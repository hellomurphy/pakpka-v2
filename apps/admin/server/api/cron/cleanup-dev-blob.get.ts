import { blob } from '@nuxthub/blob'

const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24h
const MAX_ERRORS = 50

/**
 * Job 3: Dev-only aggressive cleanup — ลบทุก object ใต้ slips/ ที่ uploadedAt เก่ากว่า 24h
 * ไม่เช็ค payment (อันตรายใน prod) — 403 ถ้าไม่ใช่ development
 * Query: ?secret=... | dryRun=1
 */
export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV !== 'development') {
    throw createError({ statusCode: 403, statusMessage: 'Dev cleanup only in development' })
  }

  const started = Date.now()
  const config = useRuntimeConfig()
  const secret = (config as { cronSecret?: string }).cronSecret ?? process.env.CRON_SECRET
  const query = getQuery(event) as { secret?: string; dryRun?: string }
  const provided = query.secret ?? getRequestHeader(event, 'x-cron-secret')
  if (secret && provided !== secret) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const dryRun = query.dryRun === '1' || query.dryRun === 'true'
  const cutoff = Date.now() - MAX_AGE_MS
  let deleted = 0
  const wouldDelete: string[] = []
  const errors: { pathname: string; message: string }[] = []
  let cursor: string | undefined

  do {
    const result = await blob.list({ prefix: 'slips/', cursor, limit: 100 })
    for (const b of result.blobs) {
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

  return {
    success: true,
    job: 'cleanup_dev_blob',
    timestamp: new Date().toISOString(),
    dryRun,
    deleted,
    wouldDeleteCount: dryRun ? wouldDelete.length : undefined,
    wouldDelete: dryRun ? wouldDelete.slice(0, 100) : undefined,
    durationMs: Date.now() - started,
    errors: errors.length > 0 ? errors : undefined,
  }
})
