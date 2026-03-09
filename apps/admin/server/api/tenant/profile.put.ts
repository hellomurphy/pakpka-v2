import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { requireSession } from '~~/server/utils/auth'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'ชื่อต้องไม่เป็นค่าว่าง').optional(),
  phone: z.string().optional(),
  desiredRoomTypeId: z.string().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)

    const body = await readValidatedBody(event, (data) => updateProfileSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.errors,
      })
    }
    const { name, phone, desiredRoomTypeId } = body.data

    const [existing] = await db
      .select()
      .from(schema.tenant)
      .where(eq(schema.tenant.userId, session.id))
      .limit(1)
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบข้อมูลผู้เช่า',
      })
    }

    const updates: Record<string, unknown> = {}
    if (name !== undefined) updates.name = name
    if (phone !== undefined) updates.phone = phone ?? null
    if (desiredRoomTypeId !== undefined) updates.desiredRoomTypeId = desiredRoomTypeId ?? null

    const [updated] = await db
      .update(schema.tenant)
      .set(updates)
      .where(eq(schema.tenant.userId, session.id))
      .returning()
    if (!updated) {
      throw createError({
        statusCode: 500,
        statusMessage: 'อัปเดตไม่สำเร็จ',
      })
    }

    const [propertyRow] = await db
      .select({ id: schema.property.id, name: schema.property.name })
      .from(schema.property)
      .where(eq(schema.property.id, updated.propertyId))
      .limit(1)
    let desiredRoomTypeRow: { id: string; name: string; basePrice: string } | null = null
    if (updated.desiredRoomTypeId) {
      const [rt] = await db
        .select({
          id: schema.roomType.id,
          name: schema.roomType.name,
          basePrice: schema.roomType.basePrice,
        })
        .from(schema.roomType)
        .where(eq(schema.roomType.id, updated.desiredRoomTypeId))
        .limit(1)
      desiredRoomTypeRow = rt ?? null
    }

    const result = {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      status: updated.status,
      propertyId: updated.propertyId,
      property: propertyRow ? { id: propertyRow.id, name: propertyRow.name } : null,
      desiredRoomTypeId: updated.desiredRoomTypeId,
      desiredRoomType: desiredRoomTypeRow,
      updatedAt: updated.updatedAt,
    }

    return successResponse(result, 'อัปเดตโปรไฟล์สำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
