import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { ContractStatus, ReservationStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  floorId: z.string().min(1, 'ต้องระบุ Floor ID')
})

function formatRoomRow(
  row: {
    id: string
    roomNumber: string
    status: string | null
    floorId: string | null
    propertyId: string
    roomTypeId: string
    roomTypeName: string
    roomTypeBasePrice: string
    roomTypeDeposit: string
    contractId: string | null
    contractStartDate: Date | null
    contractEndDate: Date | null
    contractRentAmount: string | null
    tenantId: string | null
    tenantName: string | null
    tenantStatus: string | null
    tenantPhone: string | null
    reservationId: string | null
    reservationStartDate: Date | null
    reservationTenantId: string | null
  },
  reservationTenantNames: Record<string, string>
) {
  return {
    id: row.id,
    roomNumber: row.roomNumber,
    status: row.status,
    floorId: row.floorId,
    propertyId: row.propertyId,
    roomTypeId: row.roomTypeId,
    roomType: {
      name: row.roomTypeName,
      basePrice: row.roomTypeBasePrice,
      deposit: row.roomTypeDeposit
    },
    activeContract: row.contractId
      ? {
          id: row.contractId,
          startDate: row.contractStartDate,
          endDate: row.contractEndDate,
          rentAmount: row.contractRentAmount
        }
      : null,
    tenant: row.tenantId
      ? {
          id: row.tenantId,
          name: row.tenantName,
          status: row.tenantStatus,
          phone: row.tenantPhone
        }
      : null,
    activeReservation: row.reservationId
      ? {
          id: row.reservationId,
          startDate: row.reservationStartDate,
          tenant: {
            id: row.reservationTenantId,
            name: row.reservationTenantId ? (reservationTenantNames[row.reservationTenantId] ?? '') : ''
          }
        }
      : null
  }
}

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, data => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Floor ID'
      })
    }
    const { floorId } = query.data

    const [floor] = await db
      .select({ propertyId: schema.floor.propertyId })
      .from(schema.floor)
      .where(eq(schema.floor.id, floorId))
      .limit(1)
    if (!floor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบชั้นนี้'
      })
    }
    await requirePropertyStaff(event, floor.propertyId)

    const rows = await db
      .select({
        id: schema.room.id,
        roomNumber: schema.room.roomNumber,
        status: schema.room.status,
        floorId: schema.room.floorId,
        propertyId: schema.room.propertyId,
        roomTypeId: schema.room.roomTypeId,
        roomTypeName: schema.roomType.name,
        roomTypeBasePrice: schema.roomType.basePrice,
        roomTypeDeposit: schema.roomType.deposit,
        contractId: schema.contract.id,
        contractStartDate: schema.contract.startDate,
        contractEndDate: schema.contract.endDate,
        contractRentAmount: schema.contract.rentAmount,
        tenantId: schema.tenant.id,
        tenantName: schema.tenant.name,
        tenantStatus: schema.tenant.status,
        tenantPhone: schema.tenant.phone,
        reservationId: schema.reservation.id,
        reservationStartDate: schema.reservation.startDate,
        reservationTenantId: schema.reservation.tenantId
      })
      .from(schema.room)
      .innerJoin(schema.roomType, eq(schema.room.roomTypeId, schema.roomType.id))
      .leftJoin(
        schema.contract,
        and(eq(schema.contract.roomId, schema.room.id), eq(schema.contract.status, ContractStatus.ACTIVE))
      )
      .leftJoin(
        schema.contractTenant,
        and(
          eq(schema.contractTenant.contractId, schema.contract.id),
          eq(schema.contractTenant.isPrimary, true)
        )
      )
      .leftJoin(schema.tenant, eq(schema.tenant.id, schema.contractTenant.tenantId))
      .leftJoin(
        schema.reservation,
        and(
          eq(schema.reservation.roomId, schema.room.id),
          eq(schema.reservation.status, ReservationStatus.CONFIRMED)
        )
      )
      .where(eq(schema.room.floorId, floorId))
      .orderBy(schema.room.roomNumber)

    const resTenantIds = [...new Set(rows.map(r => r.reservationTenantId).filter(Boolean) as string[])]
    const resTenantRows = resTenantIds.length > 0
      ? await db.select({ id: schema.tenant.id, name: schema.tenant.name }).from(schema.tenant).where(inArray(schema.tenant.id, resTenantIds))
      : []
    const reservationTenantNames: Record<string, string> = Object.fromEntries(resTenantRows.map(t => [t.id, t.name]))

    const byRoomId = new Map<string, ReturnType<typeof formatRoomRow>>()
    for (const r of rows) {
      const roomId = r.id
      if (!byRoomId.has(roomId)) {
        byRoomId.set(roomId, formatRoomRow({
          id: r.id,
          roomNumber: r.roomNumber,
          status: r.status,
          floorId: r.floorId,
          propertyId: r.propertyId,
          roomTypeId: r.roomTypeId,
          roomTypeName: r.roomTypeName,
          roomTypeBasePrice: r.roomTypeBasePrice,
          roomTypeDeposit: r.roomTypeDeposit,
          contractId: r.contractId,
          contractStartDate: r.contractStartDate,
          contractEndDate: r.contractEndDate,
          contractRentAmount: r.contractRentAmount,
          tenantId: r.tenantId,
          tenantName: r.tenantName,
          tenantStatus: r.tenantStatus,
          tenantPhone: r.tenantPhone,
          reservationId: r.reservationId,
          reservationStartDate: r.reservationStartDate,
          reservationTenantId: r.reservationTenantId
        }, reservationTenantNames))
      }
    }
    const formattedRooms = [...byRoomId.values()]

    return successResponse(formattedRooms)
  } catch (error) {
    return errorResponse(event, error)
  }
})
