import { blob } from '@nuxthub/blob'
import { and, eq, isNotNull, lt } from 'drizzle-orm'

const RETENTION_YEARS = 5
const MAX_ERRORS = 50

/**
 * Job 2: Retention cleanup — ลบ slip ใน storage สำหรับ payment ที่เก่ากว่า retention (DB เป็น source)
 * หลังลบ object จะ set slip_key = NULL (ไม่ลบแถว payment — ปรับตามนโยบายกฎหมายภายหลัง)
 * Query: ?secret=... | dryRun=1
 */
export default defineEventHandler(async (event) => {
  const started = Date.now()
  const config = useRuntimeConfig()
  const secret = (config as { cronSecret?: string }).cronSecret ?? process.env.CRON_SECRET
  const query = getQuery(event) as { secret?: string; dryRun?: string }
  const provided = query.secret ?? getRequestHeader(event, 'x-cron-secret')
  if (secret && provided !== secret) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const dryRun = query.dryRun === '1' || query.dryRun === 'true'
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - RETENTION_YEARS)

  const rows = await db
    .select({ id: schema.payment.id, slipKey: schema.payment.slipKey })
    .from(schema.payment)
    .where(and(isNotNull(schema.payment.slipKey), lt(schema.payment.createdAt, cutoff)))

  let deleted = 0
  const errors: { paymentId: string; slipKey: string; message: string }[] = []

  for (const row of rows) {
    if (!row.slipKey) continue
    if (dryRun) {
      deleted++
      continue
    }
    try {
      await blob.del(row.slipKey)
      await db
        .update(schema.payment)
        .set({ slipKey: null, updatedAt: new Date() })
        .where(eq(schema.payment.id, row.id))
      deleted++
    } catch (e: unknown) {
      if (errors.length < MAX_ERRORS) {
        const msg = e instanceof Error ? e.message : String(e)
        errors.push({ paymentId: row.id, slipKey: row.slipKey, message: msg })
      }
    }
  }

  const durationMs = Date.now() - started
  return {
    success: true,
    job: 'cleanup_retention_slips',
    timestamp: new Date().toISOString(),
    retentionYears: RETENTION_YEARS,
    cutoffDate: cutoff.toISOString(),
    dryRun,
    processed: rows.length,
    deletedOrWouldDelete: deleted,
    durationMs,
    errors: errors.length > 0 ? errors : undefined,
  }
})
