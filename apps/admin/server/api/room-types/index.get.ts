import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  propertyId: z.string().min(1, 'รหัส Property ไม่ถูกต้อง'),
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, (data) => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Property ID',
      })
    }
    const { propertyId } = query.data
    await requirePropertyStaff(event, propertyId)

    const roomTypes = await db
      .select()
      .from(schema.roomType)
      .where(eq(schema.roomType.propertyId, propertyId))
      .orderBy(schema.roomType.basePrice)

    const roomTypeIds = roomTypes.map((rt) => rt.id)
    const roomCounts =
      roomTypeIds.length > 0
        ? await db
            .select({ roomTypeId: schema.room.roomTypeId })
            .from(schema.room)
            .where(eq(schema.room.propertyId, propertyId))
        : []
    const countByRoomType: Record<string, number> = {}
    for (const id of roomTypeIds) countByRoomType[id] = 0
    for (const r of roomCounts) {
      if (countByRoomType[r.roomTypeId] !== undefined) countByRoomType[r.roomTypeId]++
    }

    const result = roomTypes.map((rt) => ({
      ...rt,
      _count: { rooms: countByRoomType[rt.id] ?? 0 },
    }))

    return successResponse(result, 'ดึงข้อมูลประเภทห้องสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
