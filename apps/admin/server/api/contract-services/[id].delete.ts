import { eq, and } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const contractServiceId = event.context.params?.id
    if (!contractServiceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Contract Service ID is required'
      })
    }

    const [cs] = await db
      .select({ contractId: schema.contractService.contractId })
      .from(schema.contractService)
      .where(eq(schema.contractService.id, contractServiceId))
      .limit(1)
    if (!cs) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบบริการเสริมในสัญญานี้'
      })
    }

    const [contract] = await db
      .select({ propertyId: schema.contract.propertyId })
      .from(schema.contract)
      .where(eq(schema.contract.id, cs.contractId))
      .limit(1)
    if (!contract) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบสัญญา' })
    }
    await requirePropertyStaff(event, contract.propertyId)

    await db.transaction(async (tx) => {
      await tx.delete(schema.contractService).where(eq(schema.contractService.id, contractServiceId))

      const [draftInv] = await tx
        .select()
        .from(schema.invoice)
        .where(
          and(
            eq(schema.invoice.contractId, cs.contractId),
            eq(schema.invoice.status, 'DRAFT')
          )
        )
        .limit(1)
      if (draftInv) {
        const items = await tx
          .select()
          .from(schema.invoiceItem)
          .where(eq(schema.invoiceItem.invoiceId, draftInv.id))
        const newTotalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0)
        await tx
          .update(schema.invoice)
          .set({ totalAmount: String(newTotalAmount) })
          .where(eq(schema.invoice.id, draftInv.id))
      }
    })

    return successResponse(null, 'ลบบริการเสริมสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
