import { eq } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const roomTypeId = event.context.params?.id
    if (!roomTypeId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Room Type ID' })
    }

    const [existing] = await db
      .select({ id: schema.roomType.id, propertyId: schema.roomType.propertyId })
      .from(schema.roomType)
      .where(eq(schema.roomType.id, roomTypeId))
      .limit(1)
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบประเภทห้องนี้' })
    }
    await requirePropertyStaff(event, existing.propertyId)

    const roomsUsing = await db
      .select()
      .from(schema.room)
      .where(eq(schema.room.roomTypeId, roomTypeId))
      .limit(1)
    if (roomsUsing.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'ไม่สามารถลบได้ เนื่องจากยังมีห้องพักใช้ประเภทนี้อยู่',
      })
    }

    const deleted = await db
      .delete(schema.roomType)
      .where(eq(schema.roomType.id, roomTypeId))
      .returning()
    if (deleted.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบประเภทห้องนี้' })
    }

    event.node.res.statusCode = 204
    return
  } catch (error) {
    return errorResponse(event, error)
  }
})
