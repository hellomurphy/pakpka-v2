import { z } from 'zod'
import { eq, inArray, and, desc } from 'drizzle-orm'
import { ContractStatus, ContractServiceStatus } from '@repo/db'
import { requireSession } from '~~/server/utils/auth'
import { toDecimalNumber } from '~~/server/utils/apiResponse'

const querySchema = z.object({
  status: z.enum(Object.values(ContractStatus) as [string, ...string[]]).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)

    const query = await getValidatedQuery(event, (data) => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูล Query ไม่ถูกต้อง',
      })
    }
    const { status } = query.data

    const [tenantRow] = await db
      .select({ id: schema.tenant.id })
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
      .select()
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.tenantId, tenantRow.id))
    const contractIds = links.map((l: { contractId: string }) => l.contractId)
    if (contractIds.length === 0) {
      return successResponse({ contracts: [], total: 0 }, 'ดึงข้อมูลสัญญาสำเร็จ')
    }

    const whereClause = status
      ? and(inArray(schema.contract.id, contractIds), eq(schema.contract.status, status))
      : inArray(schema.contract.id, contractIds)

    const contractRows = await db
      .select()
      .from(schema.contract)
      .where(whereClause)
      .orderBy(desc(schema.contract.startDate))

    const roomIds = [...new Set(contractRows.map((c) => c.roomId))]
    const roomRows = await db.select().from(schema.room).where(inArray(schema.room.id, roomIds))
    const roomMap = Object.fromEntries(roomRows.map((r) => [r.id, r]))
    const roomTypeIds = [...new Set(roomRows.map((r) => r.roomTypeId))]
    const roomTypeRows = await db
      .select()
      .from(schema.roomType)
      .where(inArray(schema.roomType.id, roomTypeIds))
    const rtMap = Object.fromEntries(roomTypeRows.map((rt) => [rt.id, rt]))
    const floorIds = [...new Set(roomRows.map((r) => r.floorId).filter(Boolean))]
    const floorRows =
      floorIds.length > 0
        ? await db.select().from(schema.floor).where(inArray(schema.floor.id, floorIds))
        : []
    const floorMap = Object.fromEntries(floorRows.map((f) => [f.id, f]))

    const contractTenantRows = await db
      .select()
      .from(schema.contractTenant)
      .where(inArray(schema.contractTenant.contractId, contractIds))
    const tenantIds = [...new Set(contractTenantRows.map((ct) => ct.tenantId))]
    const tenantRows = await db
      .select()
      .from(schema.tenant)
      .where(inArray(schema.tenant.id, tenantIds))
    const tenantMap = Object.fromEntries(tenantRows.map((t) => [t.id, t]))
    const tenantsByContract: Record<
      string,
      { isPrimary: boolean; tenant: { id: string; name: string; phone: string | null } }[]
    > = {}
    for (const ct of contractTenantRows) {
      const t = tenantMap[ct.tenantId]
      if (!t) continue
      if (!tenantsByContract[ct.contractId]) tenantsByContract[ct.contractId] = []
      tenantsByContract[ct.contractId].push({
        isPrimary: ct.isPrimary,
        tenant: { id: t.id, name: t.name, phone: t.phone },
      })
    }

    const contractServiceRows = await db
      .select()
      .from(schema.contractService)
      .where(
        and(
          inArray(schema.contractService.contractId, contractIds),
          eq(schema.contractService.status, ContractServiceStatus.ACTIVE),
        ),
      )
    const serviceIds = [...new Set(contractServiceRows.map((cs) => cs.serviceId))]
    const serviceRows =
      serviceIds.length > 0
        ? await db.select().from(schema.service).where(inArray(schema.service.id, serviceIds))
        : []
    const serviceMap = Object.fromEntries(serviceRows.map((s) => [s.id, s]))
    const servicesByContract: Record<
      string,
      {
        id: string
        startDate: Date
        endDate: Date | null
        customPrice: number | null
        service: { id: string; name: string; defaultPrice: number; billingCycle: string }
      }[]
    > = {}
    for (const cs of contractServiceRows) {
      const s = serviceMap[cs.serviceId]
      if (!s) continue
      if (!servicesByContract[cs.contractId]) servicesByContract[cs.contractId] = []
      servicesByContract[cs.contractId].push({
        id: cs.id,
        startDate: cs.startDate,
        endDate: cs.endDate,
        customPrice: cs.customPrice != null ? toDecimalNumber(cs.customPrice) : null,
        service: {
          id: s.id,
          name: s.name,
          defaultPrice: toDecimalNumber(s.defaultPrice),
          billingCycle: s.billingCycle,
        },
      })
    }

    const depositRows = await db
      .select()
      .from(schema.deposit)
      .where(inArray(schema.deposit.contractId, contractIds))
    const depositByContract: Record<
      string,
      {
        id: string
        amount: number
        receivedDate: Date
        refundedDate: Date | null
        deductions: number | null
        deductionNotes: string | null
        clearanceStatus: string | null
      }
    > = {}
    for (const d of depositRows) {
      depositByContract[d.contractId] = {
        id: d.id,
        amount: toDecimalNumber(d.amount),
        receivedDate: d.receivedDate,
        refundedDate: d.refundedDate,
        deductions: d.deductions != null ? toDecimalNumber(d.deductions) : null,
        deductionNotes: d.deductionNotes,
        clearanceStatus: d.clearanceStatus,
      }
    }

    const terminationRows = await db
      .select()
      .from(schema.contractTermination)
      .where(inArray(schema.contractTermination.contractId, contractIds))
    const terminationByContract: Record<
      string,
      { id: string; reason: string; terminatedDate: Date; notes: string | null }
    > = {}
    for (const t of terminationRows) {
      terminationByContract[t.contractId] = {
        id: t.id,
        reason: t.reason,
        terminatedDate: t.terminatedDate,
        notes: t.notes,
      }
    }

    const contracts = contractRows.map((c) => {
      const room = roomMap[c.roomId]
      const roomType = room ? rtMap[room.roomTypeId] : null
      const floor = room?.floorId ? floorMap[room.floorId] : null
      return {
        id: c.id,
        startDate: c.startDate,
        endDate: c.endDate,
        status: c.status,
        rentAmount: toDecimalNumber(c.rentAmount),
        waterBillingType: c.waterBillingType,
        waterRate: toDecimalNumber(c.waterRate),
        waterMinimumCharge: toDecimalNumber(c.waterMinimumCharge),
        electricityBillingType: c.electricityBillingType,
        electricityRate: toDecimalNumber(c.electricityRate),
        electricityMinimumCharge: toDecimalNumber(c.electricityMinimumCharge),
        room: room
          ? {
              id: room.id,
              roomNumber: room.roomNumber,
              status: room.status,
              roomType: roomType
                ? {
                    id: roomType.id,
                    name: roomType.name,
                    basePrice: toDecimalNumber(roomType.basePrice),
                    deposit: toDecimalNumber(roomType.deposit),
                  }
                : null,
              floor: floor
                ? { id: floor.id, name: floor.name, floorNumber: floor.floorNumber }
                : null,
            }
          : null,
        tenants: tenantsByContract[c.id] ?? [],
        services: servicesByContract[c.id] ?? [],
        deposits: depositByContract[c.id] ? [depositByContract[c.id]] : [],
        termination: terminationByContract[c.id] ?? null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }
    })

    return successResponse({ contracts, total: contracts.length }, 'ดึงข้อมูลสัญญาสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
