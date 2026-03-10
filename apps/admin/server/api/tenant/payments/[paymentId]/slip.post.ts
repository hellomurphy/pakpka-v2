import { eq } from 'drizzle-orm'
import { SlipStatus } from '@repo/db'
import { requireSession } from '~~/server/utils/auth'
import { blob, ensureBlob } from '@nuxthub/blob'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const RATE_LIMIT_UPLOADS_PER_MINUTE = 10

const rateLimitMap = new Map<string, { count: number; minute: number }>()

function getRateLimitKey(tenantId: string, ip: string): string {
  const minute = Math.floor(Date.now() / 60_000)
  return `${tenantId}:${ip}:${minute}`
}

function checkRateLimit(tenantId: string, ip: string): void {
  const key = getRateLimitKey(tenantId, ip)
  const nowMinute = Math.floor(Date.now() / 60_000)
  const cur = rateLimitMap.get(key)
  if (cur) {
    if (cur.minute !== nowMinute) {
      rateLimitMap.set(key, { count: 1, minute: nowMinute })
      return
    }
    if (cur.count >= RATE_LIMIT_UPLOADS_PER_MINUTE) {
      throw createError({
        statusCode: 429,
        statusMessage: 'อัปโหลดบ่อยเกินไป กรุณารอสักครู่',
      })
    }
    cur.count += 1
  } else {
    rateLimitMap.set(key, { count: 1, minute: nowMinute })
  }
}

function extFromMime(type: string): string {
  if (type === 'image/jpeg') return 'jpg'
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  return 'jpg'
}

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)
    const paymentId = event.context.params?.paymentId
    if (!paymentId) {
      throw createError({ statusCode: 400, statusMessage: 'ไม่พบรหัสการชำระเงิน' })
    }

    const [tenantRow] = await db
      .select({ id: schema.tenant.id })
      .from(schema.tenant)
      .where(eq(schema.tenant.userId, session.id))
      .limit(1)
    if (!tenantRow) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบข้อมูลผู้เช่า' })
    }

    const [paymentRow] = await db
      .select()
      .from(schema.payment)
      .where(eq(schema.payment.id, paymentId))
      .limit(1)
    if (!paymentRow) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการชำระเงิน' })
    }

    const contractIdsForTenant = await db
      .select({ contractId: schema.contractTenant.contractId })
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.tenantId, tenantRow.id))
    const cIds = contractIdsForTenant.map((r: { contractId: string }) => r.contractId)

    const [invoiceRow] = await db
      .select({ contractId: schema.invoice.contractId })
      .from(schema.invoice)
      .where(eq(schema.invoice.id, paymentRow.invoiceId))
      .limit(1)
    if (!invoiceRow || !cIds.includes(invoiceRow.contractId)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'คุณไม่มีสิทธิ์เข้าถึงรายการชำระเงินนี้',
      })
    }

    const ip =
      getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ??
      getRequestHeader(event, 'x-real-ip') ??
      'unknown'
    checkRateLimit(tenantRow.id, ip)

    const form = await readMultipartFormData(event)
    if (!form?.length) {
      throw createError({ statusCode: 400, statusMessage: 'ไม่มีไฟล์สลิป' })
    }
    const fileField = form.find((f) => f.name === 'file' && f.data)
    if (!fileField || !fileField.data) {
      throw createError({ statusCode: 400, statusMessage: 'ไม่พบไฟล์ใน field "file"' })
    }

    const type = (fileField.type ?? 'application/octet-stream').split(';')[0].trim()
    if (!ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
      throw createError({
        statusCode: 400,
        statusMessage: 'รองรับเฉพาะไฟล์รูปภาพ JPG, PNG, WebP',
      })
    }
    const fileBlob = new Blob([fileField.data], { type })
    ensureBlob(fileBlob, {
      maxSize: '5MB',
      types: [...ALLOWED_TYPES],
    })

    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    const ext = extFromMime(type)
    const pathname = `slips/${tenantRow.id}/${y}/${m}/${uuid}.${ext}`

    if (paymentRow.slipKey) {
      try {
        await blob.del(paymentRow.slipKey)
      } catch {
        // ignore delete error
      }
    }

    await blob.put(pathname, fileBlob, {
      addRandomSuffix: false,
      customMetadata: {
        tenantId: tenantRow.id,
        paymentId,
        uploadedAt: now.toISOString(),
      },
    })

    await db
      .update(schema.payment)
      .set({
        slipKey: pathname,
        slipStatus: SlipStatus.UPLOADED,
        updatedAt: now,
      })
      .where(eq(schema.payment.id, paymentId))

    const baseUrl = getRequestURL(event).origin
    const slipUrl = `${baseUrl}/api/slips/${encodeURIComponent(pathname)}`

    return {
      success: true,
      message: 'อัปโหลดสลิปสำเร็จ',
      data: { slipKey: pathname, slipUrl },
    }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    return errorResponse(event, err)
  }
})
