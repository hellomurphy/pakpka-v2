import { eq } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const accountId = event.context.params?.id
    if (!accountId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Account ID is required',
      })
    }

    const [existing] = await db
      .select({ propertyId: schema.receivingAccount.propertyId })
      .from(schema.receivingAccount)
      .where(eq(schema.receivingAccount.id, accountId))
      .limit(1)
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบช่องทางนี้' })
    }
    await requirePropertyStaff(event, existing.propertyId)

    await db.delete(schema.receivingAccount).where(eq(schema.receivingAccount.id, accountId))

    return successResponse(null, 'ลบช่องทางการชำระเงินสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
