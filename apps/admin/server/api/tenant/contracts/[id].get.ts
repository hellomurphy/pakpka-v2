import { eq, inArray, and } from 'drizzle-orm'
import { requireSession } from '~~/server/utils/auth'
import { toDecimalNumber } from '~~/server/utils/apiResponse'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)
    const contractId = event.context.params?.id
    if (!contractId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Contract ID is required',
      })
    }

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

    const [link] = await db
      .select()
      .from(schema.contractTenant)
      .where(
        and(
          eq(schema.contractTenant.contractId, contractId),
          eq(schema.contractTenant.tenantId, tenantRow.id),
        ),
      )
      .limit(1)
    if (!link) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบสัญญานี้หรือคุณไม่มีสิทธิ์เข้าถึง',
      })
    }

    const [contractRow] = await db
      .select()
      .from(schema.contract)
      .where(eq(schema.contract.id, contractId))
      .limit(1)
    if (!contractRow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบข้อมูลสัญญา',
      })
    }

    const [roomRow] = await db
      .select()
      .from(schema.room)
      .where(eq(schema.room.id, contractRow.roomId))
      .limit(1)
    const [roomTypeRow] = roomRow
      ? await db
          .select()
          .from(schema.roomType)
          .where(eq(schema.roomType.id, roomRow.roomTypeId))
          .limit(1)
      : [null]
    const [propertyRow] = await db
      .select({ id: schema.property.id, name: schema.property.name })
      .from(schema.property)
      .where(eq(schema.property.id, contractRow.propertyId))
      .limit(1)

    const contractTenants = await db
      .select()
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.contractId, contractId))
    const tenantIds = contractTenants.map((ct) => ct.tenantId)
    const tenants =
      tenantIds.length > 0
        ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
        : []
    const tenantMap = Object.fromEntries(tenants.map((t) => [t.id, t]))

    const deposits = await db
      .select()
      .from(schema.deposit)
      .where(eq(schema.deposit.contractId, contractId))
    const contractServices = await db
      .select()
      .from(schema.contractService)
      .where(eq(schema.contractService.contractId, contractId))
    const serviceIds = contractServices.map((cs) => cs.serviceId)
    const services =
      serviceIds.length > 0
        ? await db.select().from(schema.service).where(inArray(schema.service.id, serviceIds))
        : []
    const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]))

    const contract = {
      id: contractRow.id,
      startDate: contractRow.startDate,
      endDate: contractRow.endDate,
      status: contractRow.status,
      rentAmount: toDecimalNumber(contractRow.rentAmount),
      propertyId: contractRow.propertyId,
      propertyName: propertyRow?.name ?? null,
      roomId: contractRow.roomId,
      room:
        roomRow && roomTypeRow
          ? {
              id: roomRow.id,
              roomNumber: roomRow.roomNumber,
              status: roomRow.status,
              roomType: {
                id: roomTypeRow.id,
                name: roomTypeRow.name,
                basePrice: toDecimalNumber(roomTypeRow.basePrice),
                deposit: toDecimalNumber(roomTypeRow.deposit),
              },
            }
          : null,
      tenants: contractTenants
        .map((ct) => ({
          isPrimary: ct.isPrimary,
          tenant: tenantMap[ct.tenantId]
            ? {
                id: tenantMap[ct.tenantId].id,
                name: tenantMap[ct.tenantId].name,
                phone: tenantMap[ct.tenantId].phone,
                status: tenantMap[ct.tenantId].status,
              }
            : null,
        }))
        .filter((t) => t.tenant),
      deposits: deposits.map((d) => ({
        id: d.id,
        amount: toDecimalNumber(d.amount),
        receivedDate: d.receivedDate,
        refundedDate: d.refundedDate,
        deductions: d.deductions != null ? toDecimalNumber(d.deductions) : null,
        deductionNotes: d.deductionNotes,
        clearanceStatus: d.clearanceStatus,
      })),
      services: contractServices
        .map((cs) => ({
          id: cs.id,
          startDate: cs.startDate,
          endDate: cs.endDate,
          status: cs.status,
          customPrice: cs.customPrice != null ? toDecimalNumber(cs.customPrice) : null,
          service: serviceMap[cs.serviceId]
            ? {
                id: serviceMap[cs.serviceId].id,
                name: serviceMap[cs.serviceId].name,
                defaultPrice: toDecimalNumber(serviceMap[cs.serviceId].defaultPrice),
                billingCycle: serviceMap[cs.serviceId].billingCycle,
              }
            : null,
        }))
        .filter((s) => s.service),
    }

    return successResponse(contract, 'ดึงข้อมูลสัญญาสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
