import { eq, inArray } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const propertyId = event.context.params?.id
    if (!propertyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Property ID',
      })
    }
    await requirePropertyStaff(event, propertyId)

    const [prop] = await db
      .select()
      .from(schema.property)
      .where(eq(schema.property.id, propertyId))
      .limit(1)
    if (!prop) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบ Property' })
    }

    const floors = await db
      .select()
      .from(schema.floor)
      .where(eq(schema.floor.propertyId, propertyId))
      .orderBy(schema.floor.floorNumber)
    const floorIds = floors.map((f) => f.id)
    const rooms =
      floorIds.length > 0
        ? await db
            .select()
            .from(schema.room)
            .where(inArray(schema.room.floorId, floorIds))
            .orderBy(schema.room.roomNumber)
        : []
    const roomsByFloor: Record<string, typeof rooms> = {}
    for (const f of floors) roomsByFloor[f.id] = []
    for (const r of rooms) {
      if (r.floorId && roomsByFloor[r.floorId]) roomsByFloor[r.floorId].push(r)
    }
    const floorsWithRooms = floors.map((f) => ({ ...f, rooms: roomsByFloor[f.id] ?? [] }))

    const roomTypes = await db
      .select()
      .from(schema.roomType)
      .where(eq(schema.roomType.propertyId, propertyId))
      .orderBy(schema.roomType.basePrice)

    const staffRows = await db
      .select()
      .from(schema.propertyStaff)
      .where(eq(schema.propertyStaff.propertyId, propertyId))
    const userIds = staffRows.map((s) => s.userId)
    const users =
      userIds.length > 0
        ? await db.select().from(schema.user).where(inArray(schema.user.id, userIds))
        : []
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))
    const staff = staffRows.map((s) => ({
      ...s,
      user: userMap[s.userId]
        ? {
            id: userMap[s.userId].id,
            name: userMap[s.userId].name,
            avatarUrl: userMap[s.userId].avatarUrl,
          }
        : null,
    }))

    const receivingAccounts = await db
      .select()
      .from(schema.receivingAccount)
      .where(eq(schema.receivingAccount.propertyId, propertyId))

    const services = await db
      .select()
      .from(schema.service)
      .where(eq(schema.service.propertyId, propertyId))
      .orderBy(schema.service.defaultPrice)

    const settings = {
      name: prop.name,
      roomNamingFormat: prop.roomNamingFormat,
      roomTurnoverDays: prop.roomTurnoverDays,
      contractEndingSoonDays: prop.contractEndingSoonDays,
      totalFloors: floors.length,
      floors: floorsWithRooms,
      roomTypes,
      staff,
      finance: {
        utilities: {
          water: {
            type: prop.defaultWaterBillingType,
            rate: prop.defaultWaterRate,
            minimumCharge: prop.defaultWaterMinimumCharge,
          },
          electricity: {
            type: prop.defaultElectricityBillingType,
            rate: prop.defaultElectricityRate,
            minimumCharge: prop.defaultElectricityMinimumCharge,
          },
        },
        lateFee: {
          enabled: prop.lateFeeEnabled,
          type: prop.lateFeeType,
          value: prop.lateFeeValue,
        },
        billingCycle: {
          cutoffDay: prop.defaultBillingCutoffDay,
          dueDays: prop.defaultPaymentDueDays,
        },
        services,
      },
      payment: {
        receivingAccounts,
      },
    }

    return successResponse(settings, 'ดึงข้อมูลการตั้งค่าสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
