import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const updateRoomSchema = z.object({
  roomNumber: z.string().min(1).optional(),
  roomTypeId: z.string().min(1).optional(),
  floorId: z.string().min(1).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const roomId = event.context.params?.id
    if (!roomId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Room ID' })
    }

    const body = await readValidatedBody(event, (data) => updateRoomSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten(),
      })
    }

    const [room] = await db
      .select({
        id: schema.room.id,
        propertyId: schema.room.propertyId,
        roomNumber: schema.room.roomNumber,
      })
      .from(schema.room)
      .where(eq(schema.room.id, roomId))
      .limit(1)
    if (!room) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบห้องนี้' })
    }
    await requirePropertyStaff(event, room.propertyId)

    if (body.data.roomNumber !== undefined && body.data.roomNumber !== room.roomNumber) {
      const [existing] = await db
        .select()
        .from(schema.room)
        .where(
          and(
            eq(schema.room.propertyId, room.propertyId),
            eq(schema.room.roomNumber, body.data.roomNumber),
          ),
        )
        .limit(1)
      if (existing && existing.id !== roomId) {
        throw createError({
          statusCode: 409,
          statusMessage: `ห้อง ${body.data.roomNumber} มีอยู่ในระบบแล้ว`,
        })
      }
    }

    const updates: Record<string, unknown> = {}
    if (body.data.roomNumber !== undefined) updates.roomNumber = body.data.roomNumber
    if (body.data.roomTypeId !== undefined) updates.roomTypeId = body.data.roomTypeId
    if (body.data.floorId !== undefined) updates.floorId = body.data.floorId

    const [updated] = await db
      .update(schema.room)
      .set(updates)
      .where(eq(schema.room.id, roomId))
      .returning()
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบห้องนี้' })
    }

    const [roomType] = await db
      .select()
      .from(schema.roomType)
      .where(eq(schema.roomType.id, updated.roomTypeId))
      .limit(1)
    const updatedRoom = roomType ? { ...updated, roomType } : updated

    return successResponse(updatedRoom, `อัปเดตห้อง ${updated.roomNumber} สำเร็จ`)
  } catch (error) {
    return errorResponse(event, error)
  }
})
