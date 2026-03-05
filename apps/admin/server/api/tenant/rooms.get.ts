import { eq, and, inArray, desc } from 'drizzle-orm'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)

    const [tenantRow] = await db
      .select({ id: schema.tenant.id, propertyId: schema.tenant.propertyId })
      .from(schema.tenant)
      .where(eq(schema.tenant.userId, session.id))
      .limit(1)
    if (!tenantRow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบข้อมูลผู้เช่า',
      })
    }

    const links = await db
      .select({ contractId: schema.contractTenant.contractId })
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.tenantId, tenantRow.id))
    const contractIds = links.map((l: { contractId: string }) => l.contractId)
    if (contractIds.length === 0) {
      return successResponse({ rooms: [], total: 0 }, 'ดึงข้อมูลห้องสำเร็จ')
    }

    const contracts = await db
      .select()
      .from(schema.contract)
      .where(inArray(schema.contract.id, contractIds))
      .orderBy(desc(schema.contract.startDate))

    const roomIds = [...new Set(contracts.map((c) => c.roomId))]
    const rooms = await db.select().from(schema.room).where(inArray(schema.room.id, roomIds))
    const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]))

    const roomTypeIds = [...new Set(rooms.map((r) => r.roomTypeId))]
    const roomTypes = await db
      .select()
      .from(schema.roomType)
      .where(inArray(schema.roomType.id, roomTypeIds))
    const roomTypeMap = Object.fromEntries(roomTypes.map((rt) => [rt.id, rt]))

    const floorIds = [...new Set(rooms.map((r) => r.floorId).filter(Boolean))]
    const floors =
      floorIds.length > 0
        ? await db.select().from(schema.floor).where(inArray(schema.floor.id, floorIds))
        : []
    const floorMap = Object.fromEntries(floors.map((f) => [f.id, f]))

    const amenityLinks = await db
      .select()
      .from(schema.roomTypeAmenity)
      .where(inArray(schema.roomTypeAmenity.roomTypeId, roomTypeIds))
    const amenityIds = [...new Set(amenityLinks.map((a) => a.amenityId))]
    const amenities =
      amenityIds.length > 0
        ? await db.select().from(schema.amenity).where(inArray(schema.amenity.id, amenityIds))
        : []
    const amenityMap = Object.fromEntries(amenities.map((a) => [a.id, a]))
    const amenitiesByRoomType: Record<string, { id: string; name: string }[]> = {}
    for (const link of amenityLinks) {
      const a = amenityMap[link.amenityId]
      if (!a) continue
      if (!amenitiesByRoomType[link.roomTypeId]) amenitiesByRoomType[link.roomTypeId] = []
      amenitiesByRoomType[link.roomTypeId].push({ id: a.id, name: a.name })
    }

    const primaryTenants = await db
      .select()
      .from(schema.contractTenant)
      .where(
        and(
          inArray(schema.contractTenant.contractId, contractIds),
          eq(schema.contractTenant.isPrimary, true),
        ),
      )
    const tenantIds = [...new Set(primaryTenants.map((pt) => pt.tenantId))]
    const tenants =
      tenantIds.length > 0
        ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
        : []
    const tenantMap = Object.fromEntries(tenants.map((t) => [t.id, t]))
    const primaryByContract: Record<string, { id: string; name: string }> = {}
    for (const pt of primaryTenants) {
      const t = tenantMap[pt.tenantId]
      if (t) primaryByContract[pt.contractId] = { id: t.id, name: t.name }
    }

    const roomsFormatted = contracts.map((c) => {
      const room = roomMap[c.roomId]
      const roomType = room ? roomTypeMap[room.roomTypeId] : null
      const floor = room?.floorId ? floorMap[room.floorId] : null
      const isPrimary = primaryByContract[c.id]?.id === tenantRow.id
      return {
        contractId: c.id,
        contractStatus: c.status,
        startDate: c.startDate,
        endDate: c.endDate,
        rentAmount: c.rentAmount,
        isPrimary,
        room: room
          ? {
              id: room.id,
              roomNumber: room.roomNumber,
              status: room.status,
              floor: floor
                ? { id: floor.id, name: floor.name, floorNumber: floor.floorNumber }
                : null,
              roomType: roomType
                ? {
                    id: roomType.id,
                    name: roomType.name,
                    basePrice: roomType.basePrice,
                    deposit: roomType.deposit,
                    amenities: amenitiesByRoomType[roomType.id] ?? [],
                  }
                : null,
            }
          : null,
        primaryTenant: primaryByContract[c.id] ?? null,
      }
    })

    return successResponse(
      { rooms: roomsFormatted, total: roomsFormatted.length },
      'ดึงข้อมูลห้องสำเร็จ',
    )
  } catch (error) {
    return errorResponse(event, error)
  }
})
