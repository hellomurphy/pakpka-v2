import { z } from 'zod'
import { requirePropertyStaff } from '~~/server/utils/auth'

const createRoomTypeSchema = z.object({
  name: z.string().trim().min(1, 'ต้องระบุชื่อประเภทห้อง'),
  basePrice: z.number().positive('ค่าเช่าต้องมากกว่า 0'),
  deposit: z.number().min(0, 'ค่ามัดจำต้องไม่ติดลบ'),
  propertyId: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, (data) => createRoomTypeSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten(),
      })
    }
    await requirePropertyStaff(event, body.data.propertyId)

    const id = crypto.randomUUID()
    const [newRoomType] = await db
      .insert(schema.roomType)
      .values({
        id,
        name: body.data.name,
        basePrice: String(body.data.basePrice),
        deposit: String(body.data.deposit),
        propertyId: body.data.propertyId,
      })
      .returning()
    if (!newRoomType)
      throw createError({ statusCode: 500, statusMessage: 'สร้างประเภทห้องไม่สำเร็จ' })

    return successResponse(newRoomType, 'สร้างประเภทห้องใหม่สำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
