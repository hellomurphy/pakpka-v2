import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const createRoomSchema = z.object({
  roomNumber: z.string().min(1, 'ต้องระบุเลขห้อง'),
  roomTypeId: z.string().min(1, 'ต้องระบุประเภทห้อง'),
  floorId: z.string().min(1, 'ต้องระบุชั้น'),
  propertyId: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, (data) => createRoomSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten(),
      })
    }
    const { propertyId, roomNumber } = body.data
    await requirePropertyStaff(event, propertyId)

    const [existing] = await db
      .select()
      .from(schema.room)
      .where(and(eq(schema.room.propertyId, propertyId), eq(schema.room.roomNumber, roomNumber)))
      .limit(1)
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: `ห้อง ${roomNumber} มีอยู่ในระบบแล้ว`,
      })
    }

    const id = crypto.randomUUID()
    const [inserted] = await db
      .insert(schema.room)
      .values({
        id,
        roomNumber: body.data.roomNumber,
        roomTypeId: body.data.roomTypeId,
        floorId: body.data.floorId,
        propertyId: body.data.propertyId,
      })
      .returning()
    if (!inserted) throw createError({ statusCode: 500, statusMessage: 'สร้างห้องไม่สำเร็จ' })

    const [roomType] = await db
      .select()
      .from(schema.roomType)
      .where(eq(schema.roomType.id, body.data.roomTypeId))
      .limit(1)
    const newRoomData = roomType ? { ...inserted, roomType } : inserted

    return successResponse(newRoomData, 'สร้างห้องใหม่สำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
