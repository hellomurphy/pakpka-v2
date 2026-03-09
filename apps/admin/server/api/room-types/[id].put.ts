import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const updateRoomTypeSchema = z.object({
  name: z.string().trim().min(1).optional(),
  basePrice: z.number().positive().optional(),
  deposit: z.number().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const roomTypeId = event.context.params?.id
    if (!roomTypeId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Room Type ID' })
    }
    const body = await readValidatedBody(event, (data) => updateRoomTypeSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }

    const [existing] = await db
      .select({ propertyId: schema.roomType.propertyId })
      .from(schema.roomType)
      .where(eq(schema.roomType.id, roomTypeId))
      .limit(1)
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบประเภทห้องนี้' })
    }
    await requirePropertyStaff(event, existing.propertyId)

    const updates: Record<string, unknown> = {}
    if (body.data.name !== undefined) updates.name = body.data.name
    if (body.data.basePrice !== undefined) updates.basePrice = String(body.data.basePrice)
    if (body.data.deposit !== undefined) updates.deposit = String(body.data.deposit)

    const [updated] = await db
      .update(schema.roomType)
      .set(updates)
      .where(eq(schema.roomType.id, roomTypeId))
      .returning()
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบประเภทห้องนี้' })
    }

    return successResponse(updated, 'อัปเดตประเภทห้องสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
