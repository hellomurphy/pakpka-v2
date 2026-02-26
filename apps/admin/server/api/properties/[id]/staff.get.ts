import { eq, and, inArray, desc } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const propertyId = event.context.params?.id
    if (!propertyId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Property ID' })
    }
    await requirePropertyStaff(event, propertyId)

    const staffRows = await db
      .select()
      .from(schema.propertyStaff)
      .where(eq(schema.propertyStaff.propertyId, propertyId))
      .orderBy(schema.propertyStaff.role)
    const userIds = staffRows.map(s => s.userId)
    const users =
      userIds.length > 0
        ? await db.select().from(schema.user).where(inArray(schema.user.id, userIds))
        : []
    const userMap = Object.fromEntries(users.map(u => [u.id, u]))

    const staff = staffRows.map(s => ({
      ...s,
      user: userMap[s.userId]
        ? {
            name: userMap[s.userId].name,
            avatarUrl: userMap[s.userId].avatarUrl,
            email: userMap[s.userId].email
          }
        : null
    }))

    const invitations = await db
      .select()
      .from(schema.invitation)
      .where(and(eq(schema.invitation.propertyId, propertyId), eq(schema.invitation.status, 'PENDING')))
      .orderBy(desc(schema.invitation.createdAt))

    return successResponse({ staff, invitations })
  } catch (error) {
    return errorResponse(event, error)
  }
})
