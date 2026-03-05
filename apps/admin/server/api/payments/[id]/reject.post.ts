import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { PaymentStatus } from '@repo/db'
import { requirePropertyStaff, requireSession } from '~~/server/utils/auth'

const rejectSchema = z.object({
  reason: z.string().min(1, 'ต้องระบุเหตุผล').optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)
    const paymentId = event.context.params?.id
    if (!paymentId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Payment ID' })
    }
    const body = await readValidatedBody(event, (data) => rejectSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }

    const [payment] = await db
      .select()
      .from(schema.payment)
      .where(eq(schema.payment.id, paymentId))
      .limit(1)
    if (!payment) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบการชำระเงินนี้' })
    }

    const [inv] = await db
      .select({ propertyId: schema.invoice.propertyId })
      .from(schema.invoice)
      .where(eq(schema.invoice.id, payment.invoiceId))
      .limit(1)
    if (!inv) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบใบแจ้งหนี้' })
    }
    await requirePropertyStaff(event, inv.propertyId)

    await db
      .update(schema.payment)
      .set({
        status: PaymentStatus.REJECTED,
        notes: body.data.reason ?? null,
        verifiedByUserId: session.id,
      })
      .where(eq(schema.payment.id, paymentId))

    return successResponse(null, 'ปฏิเสธการชำระเงินสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
