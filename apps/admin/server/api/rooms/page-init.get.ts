import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { ContractStatus, ReservationStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  propertyId: z.string().min(1, 'ต้องระบุ Property ID')
})

function formatRoomForPageInit(room: {
  id: string
  roomNumber: string
  status: string | null
  floorId: string | null
  roomTypeId: string
  roomTypeName: string
  roomTypeBasePrice: string
  roomTypeDeposit: string
  contractId: string | null
  tenantId: string | null
  tenantName: string | null
  tenantStatus: string | null
  reservationId: string | null
  reservationTenantId: string | null
  reservationTenantName: string | null
}, reservationTenantNames: Record<string, string>) {
  const activeContract = room.contractId ? {
    id: room.contractId,
    tenants: room.tenantId ? [{ tenant: { id: room.tenantId, name: room.tenantName, status: room.tenantStatus }, isPrimary: true }] : [],
    services: [] as { customPrice: string | null, service: { name: string, defaultPrice: string } }[]
  } : null
  const activeReservation = room.reservationId ? {
    id: room.reservationId,
    tenant: {
      id: room.reservationTenantId,
      name: room.reservationTenantId ? (reservationTenantNames[room.reservationTenantId] ?? '') : ''
    }
  } : null
  let tenantInfoForCard: { id: string, name: string, status: string } | null = null
  if (room.tenantId) {
    tenantInfoForCard = { id: room.tenantId, name: room.tenantName ?? '', status: room.tenantStatus ?? '' }
  } else if (activeReservation?.tenant?.id) {
    tenantInfoForCard = {
      id: activeReservation.tenant.id,
      name: activeReservation.tenant.name,
      status: 'UPCOMING'
    }
  }
  return {
    id: room.id,
    roomNumber: room.roomNumber,
    status: room.status,
    floorId: room.floorId,
    roomTypeId: room.roomTypeId,
    roomType: { name: room.roomTypeName, basePrice: room.roomTypeBasePrice },
    tenant: tenantInfoForCard,
    activeContract,
    activeReservation
  }
}

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, data => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Property ID'
      })
    }
    const { propertyId } = query.data
    await requirePropertyStaff(event, propertyId)

    const floors = await db
      .select()
      .from(schema.floor)
      .where(eq(schema.floor.propertyId, propertyId))
      .orderBy(schema.floor.floorNumber)

    const roomTypes = await db
      .select()
      .from(schema.roomType)
      .where(eq(schema.roomType.propertyId, propertyId))
      .orderBy(schema.roomType.basePrice)

    let roomsForFirstFloor: ReturnType<typeof formatRoomForPageInit>[] = []
    if (floors.length > 0) {
      const firstFloorId = floors[0].id
      const roomRows = await db
        .select()
        .from(schema.room)
        .where(eq(schema.room.floorId, firstFloorId))
        .orderBy(schema.room.roomNumber)
      if (roomRows.length === 0) {
        return successResponse({
          floors,
          roomTypes,
          rooms: [],
          initialFloorId: floors[0]?.id ?? null
        })
      }
      const roomIds = roomRows.map(r => r.id)
      const roomTypeIds = [...new Set(roomRows.map(r => r.roomTypeId))]
      const roomTypeRows = await db.select().from(schema.roomType).where(inArray(schema.roomType.id, roomTypeIds))
      const rtMap = Object.fromEntries(roomTypeRows.map(rt => [rt.id, rt]))

      const activeContracts = await db
        .select()
        .from(schema.contract)
        .where(
          and(
            inArray(schema.contract.roomId, roomIds),
            eq(schema.contract.status, ContractStatus.ACTIVE)
          )
        )
      const contractIds = activeContracts.map(c => c.id)
      const primaryTenants = contractIds.length > 0
        ? await db
            .select()
            .from(schema.contractTenant)
            .where(
              and(
                inArray(schema.contractTenant.contractId, contractIds),
                eq(schema.contractTenant.isPrimary, true)
              )
            )
        : []
      const tenantIds = primaryTenants.map(pt => pt.tenantId)
      const tenantRows = tenantIds.length > 0
        ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
        : []
      const tenantMap = Object.fromEntries(tenantRows.map(t => [t.id, t]))
      const contractServices = contractIds.length > 0
        ? await db
            .select()
            .from(schema.contractService)
            .where(
              and(
                inArray(schema.contractService.contractId, contractIds),
                eq(schema.contractService.status, 'ACTIVE')
              )
            )
        : []
      const serviceIds = [...new Set(contractServices.map(cs => cs.serviceId))]
      const serviceRows = serviceIds.length > 0
        ? await db.select().from(schema.service).where(inArray(schema.service.id, serviceIds))
        : []
      const serviceMap = Object.fromEntries(serviceRows.map(s => [s.id, s]))

      const reservations = await db
        .select()
        .from(schema.reservation)
        .where(
          and(
            inArray(schema.reservation.roomId, roomIds),
            eq(schema.reservation.status, ReservationStatus.CONFIRMED)
          )
        )
      const resTenantIds = [...new Set(reservations.map(r => r.tenantId))]
      const resTenantRows = resTenantIds.length > 0
        ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, resTenantIds))
        : []
      const reservationTenantNames: Record<string, string> = Object.fromEntries(resTenantRows.map(t => [t.id, t.name]))

      const contractByRoom: Record<string, { id: string, tenantId: string | null, tenantName: string | null, tenantStatus: string | null, services: { customPrice: string | null, service: { name: string, defaultPrice: string } }[] }> = {}
      for (const c of activeContracts) {
        const pt = primaryTenants.find(p => p.contractId === c.id)
        const t = pt ? tenantMap[pt.tenantId] : null
        const csList = contractServices.filter(cs => cs.contractId === c.id)
        const services = csList.map(cs => {
          const s = serviceMap[cs.serviceId]
          return {
            customPrice: cs.customPrice,
            service: s ? { name: s.name, defaultPrice: s.defaultPrice } : { name: '', defaultPrice: '0' }
          }
        })
        contractByRoom[c.roomId] = {
          id: c.id,
          tenantId: t?.id ?? null,
          tenantName: t?.name ?? null,
          tenantStatus: t?.status ?? null,
          services
        }
      }
      const reservationByRoom: Record<string, { id: string, tenantId: string, tenantName: string }> = {}
      for (const res of reservations) {
        const t = resTenantRows.find(t => t.id === res.tenantId)
        reservationByRoom[res.roomId] = {
          id: res.id,
          tenantId: res.tenantId,
          tenantName: t?.name ?? ''
        }
      }

      const byRoomId = new Map<string, Parameters<typeof formatRoomForPageInit>[0]>()
      for (const r of roomRows) {
        const rt = rtMap[r.roomTypeId]
        const contract = contractByRoom[r.id]
        const res = reservationByRoom[r.id]
        if (!byRoomId.has(r.id)) {
          byRoomId.set(r.id, {
            id: r.id,
            roomNumber: r.roomNumber,
            status: r.status,
            floorId: r.floorId,
            roomTypeId: r.roomTypeId,
            roomTypeName: rt?.name ?? '',
            roomTypeBasePrice: rt?.basePrice ?? '0',
            roomTypeDeposit: rt?.deposit ?? '0',
            contractId: contract?.id ?? null,
            tenantId: contract?.tenantId ?? null,
            tenantName: contract?.tenantName ?? null,
            tenantStatus: contract?.tenantStatus ?? null,
            reservationId: res?.id ?? null,
            reservationTenantId: res?.tenantId ?? null,
            reservationTenantName: res?.tenantName ?? null
          })
        }
      }
      roomsForFirstFloor = [...byRoomId.values()].map(row =>
        formatRoomForPageInit(row, reservationTenantNames)
      )
    }

    return successResponse({
      floors,
      roomTypes,
      rooms: roomsForFirstFloor,
      initialFloorId: floors[0]?.id ?? null
    })
  } catch (error) {
    return errorResponse(event, error)
  }
})
