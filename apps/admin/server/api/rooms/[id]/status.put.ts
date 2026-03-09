import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { RoomStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const updateStatusSchema = z.object({
  status: z.enum(Object.values(RoomStatus) as [string, ...string[]]),
})

export default defineEventHandler(async (event) => {
  try {
    const roomId = event.context.params?.id
    if (!roomId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Room ID' })
    }
    const body = await readValidatedBody(event, (data) => updateStatusSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }

    const [room] = await db
      .select({ id: schema.room.id, propertyId: schema.room.propertyId })
      .from(schema.room)
      .where(eq(schema.room.id, roomId))
      .limit(1)
    if (!room) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบห้องนี้' })
    }
    await requirePropertyStaff(event, room.propertyId)

    const [updated] = await db
      .update(schema.room)
      .set({ status: body.data.status })
      .where(eq(schema.room.id, roomId))
      .returning()
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบห้องนี้' })
    }

    const historyId = crypto.randomUUID()
    await db.insert(schema.roomStatusHistory).values({
      id: historyId,
      roomId: updated.id,
      status: updated.status ?? body.data.status,
      startDate: new Date(),
    })

    return successResponse(updated)
  } catch (error) {
    return errorResponse(event, error)
  }
})
