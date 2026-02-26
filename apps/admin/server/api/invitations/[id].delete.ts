import { eq } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const invitationId = event.context.params?.id
    if (!invitationId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Invitation ID' })
    }

    const [inv] = await db
      .select({ propertyId: schema.invitation.propertyId })
      .from(schema.invitation)
      .where(eq(schema.invitation.id, invitationId))
      .limit(1)
    if (!inv) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำเชิญนี้' })
    }
    await requirePropertyStaff(event, inv.propertyId)

    await db.delete(schema.invitation).where(eq(schema.invitation.id, invitationId))
    return successResponse(null, 'ยกเลิกคำเชิญสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
