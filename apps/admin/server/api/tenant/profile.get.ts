import { eq } from 'drizzle-orm'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)

    const [tenantRow] = await db
      .select()
      .from(schema.tenant)
      .where(eq(schema.tenant.userId, session.id))
      .limit(1)

    if (!tenantRow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบข้อมูลผู้เช่า',
      })
    }

    const [propertyRow] = await db
      .select({ id: schema.property.id, name: schema.property.name })
      .from(schema.property)
      .where(eq(schema.property.id, tenantRow.propertyId))
      .limit(1)

    let desiredRoomTypeRow: { id: string; name: string; basePrice: string } | null = null
    if (tenantRow.desiredRoomTypeId) {
      const [rt] = await db
        .select({
          id: schema.roomType.id,
          name: schema.roomType.name,
          basePrice: schema.roomType.basePrice,
        })
        .from(schema.roomType)
        .where(eq(schema.roomType.id, tenantRow.desiredRoomTypeId))
        .limit(1)
      desiredRoomTypeRow = rt ? { id: rt.id, name: rt.name, basePrice: rt.basePrice } : null
    }

    const tenant = {
      id: tenantRow.id,
      name: tenantRow.name,
      phone: tenantRow.phone,
      status: tenantRow.status,
      propertyId: tenantRow.propertyId,
      property: propertyRow ? { id: propertyRow.id, name: propertyRow.name } : null,
      desiredRoomTypeId: tenantRow.desiredRoomTypeId,
      desiredRoomType: desiredRoomTypeRow,
      createdAt: tenantRow.createdAt,
      updatedAt: tenantRow.updatedAt,
    }

    return successResponse(tenant, 'ดึงข้อมูลโปรไฟล์สำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
