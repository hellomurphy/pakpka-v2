import { eq } from 'drizzle-orm'
import { PaymentStatus, InvoiceStatus } from '@repo/db'
import { requirePropertyStaff, requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)
    const paymentId = event.context.params?.id
    if (!paymentId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Payment ID' })
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

    await db.transaction(async (tx) => {
      await tx
        .update(schema.payment)
        .set({
          status: PaymentStatus.VERIFIED,
          verifiedByUserId: session.id,
          paymentDate: new Date(),
        })
        .where(eq(schema.payment.id, paymentId))
      await tx
        .update(schema.invoice)
        .set({ status: InvoiceStatus.PAID })
        .where(eq(schema.invoice.id, payment.invoiceId))
    })

    return successResponse(null, 'ยืนยันการชำระเงินสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
