import { z } from 'zod'
import { eq, inArray, and } from 'drizzle-orm'
import dayjs from 'dayjs'
import { RoomStatus, ContractStatus, TenantStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  propertyId: z.string().min(1, 'ต้องระบุ Property ID'),
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

    const [propertyRow] = await db
      .select({ roomTurnoverDays: schema.property.roomTurnoverDays })
      .from(schema.property)
      .where(eq(schema.property.id, propertyId))
      .limit(1)
    const turnoverDays = propertyRow?.roomTurnoverDays ?? 3

    const rooms = await db
      .select()
      .from(schema.room)
      .where(
        and(
          eq(schema.room.propertyId, propertyId),
          inArray(schema.room.status, [
            RoomStatus.AVAILABLE,
            RoomStatus.CLEANING,
            RoomStatus.MAINTENANCE,
            RoomStatus.OCCUPIED,
          ]),
        ),
      )
      .orderBy(schema.room.roomNumber)

    const roomTypeIds = [...new Set(rooms.map((r) => r.roomTypeId))]
    const roomTypes = await db
      .select()
      .from(schema.roomType)
      .where(inArray(schema.roomType.id, roomTypeIds))
    const rtMap = Object.fromEntries(roomTypes.map((rt) => [rt.id, rt]))

    const roomIds = rooms.map((r) => r.id)
    const activeContracts = await db
      .select()
      .from(schema.contract)
      .where(
        and(
          inArray(schema.contract.roomId, roomIds),
          eq(schema.contract.status, ContractStatus.ACTIVE),
        ),
      )
    const contractByRoom: Record<string, { endDate: Date; tenantStatus: string | null }> = {}
    for (const c of activeContracts) {
      contractByRoom[c.roomId] = { endDate: c.endDate, tenantStatus: null }
    }
    const contractIds = activeContracts.map((c) => c.id)
    const primaryLinks =
      contractIds.length > 0
        ? await db
            .select()
            .from(schema.contractTenant)
            .where(
              and(
                inArray(schema.contractTenant.contractId, contractIds),
                eq(schema.contractTenant.isPrimary, true),
              ),
            )
        : []
    const tenantIds = primaryLinks.map((pl) => pl.tenantId)
    const tenants =
      tenantIds.length > 0
        ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
        : []
    const tenantMap = Object.fromEntries(tenants.map((t) => [t.id, t]))
    for (const pl of primaryLinks) {
      const c = activeContracts.find((c) => c.id === pl.contractId)
      const t = tenantMap[pl.tenantId]
      if (c && t) {
        contractByRoom[c.roomId] = { endDate: c.endDate, tenantStatus: t.status }
      }
    }

    const availableNow: {
      id: string
      roomType: { name: string; basePrice: string; deposit: string }
      roomNumber: string
      label: string
    }[] = []
    const availableSoon: {
      id: string
      roomType: { name: string; basePrice: string; deposit: string }
      roomNumber: string
      label: string
      availableDate: Date
    }[] = []

    for (const room of rooms) {
      const roomType = rtMap[room.roomTypeId]
      if (!roomType) continue
      const roomInfo = {
        id: room.id,
        roomType: { name: roomType.name, basePrice: roomType.basePrice, deposit: roomType.deposit },
        roomNumber: room.roomNumber,
      }

      switch (room.status) {
        case RoomStatus.AVAILABLE:
          availableNow.push({
            ...roomInfo,
            label: `${room.roomNumber} (${roomType.name})`,
          })
          break
        case RoomStatus.CLEANING:
          availableSoon.push({
            ...roomInfo,
            label: `${room.roomNumber} (${roomType.name}) - กำลังทำความสะอาด`,
            availableDate: dayjs().add(1, 'day').toDate(),
          })
          break
        case RoomStatus.MAINTENANCE:
          availableSoon.push({
            ...roomInfo,
            label: `${room.roomNumber} (${roomType.name}) - อยู่ระหว่างซ่อมแซม`,
            availableDate: dayjs().add(turnoverDays, 'day').toDate(),
          })
          break
        case RoomStatus.OCCUPIED: {
          const contractInfo = contractByRoom[room.id]
          if (contractInfo?.tenantStatus === TenantStatus.NOTICE_GIVEN) {
            const endDate = dayjs(contractInfo.endDate)
            const nextAvailableDate = endDate.add(turnoverDays, 'day')
            availableSoon.push({
              ...roomInfo,
              label: `${room.roomNumber} (${roomType.name}) - จะว่าง ${nextAvailableDate.format('D MMM YYYY')}`,
              availableDate: nextAvailableDate.toDate(),
            })
          }
          break
        }
      }
    }

    availableSoon.sort((a, b) => {
      const t = a.availableDate.getTime() - b.availableDate.getTime()
      if (t !== 0) return t
      return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
    })

    return successResponse({
      availableNow,
      availableSoon,
    })
  } catch (error) {
    return errorResponse(event, error)
  }
})
