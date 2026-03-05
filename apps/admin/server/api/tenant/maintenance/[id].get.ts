import { eq, inArray } from 'drizzle-orm'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)

    const maintenanceId = event.context.params?.id
    if (!maintenanceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Maintenance ID is required',
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

    const links = await db
      .select({ contractId: schema.contractTenant.contractId })
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.tenantId, tenantRow.id))
    const contractIds = links.map((l: { contractId: string }) => l.contractId)
    if (contractIds.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบการแจ้งซ่อมนี้หรือคุณไม่มีสิทธิ์เข้าถึง',
      })
    }

    const [maintenanceRow] = await db
      .select()
      .from(schema.maintenanceRequest)
      .where(eq(schema.maintenanceRequest.id, maintenanceId))
      .limit(1)
    if (!maintenanceRow || !contractIds.includes(maintenanceRow.reportedByContractId)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบการแจ้งซ่อมนี้หรือคุณไม่มีสิทธิ์เข้าถึง',
      })
    }

    const [roomRow] = await db
      .select()
      .from(schema.room)
      .where(eq(schema.room.id, maintenanceRow.roomId))
      .limit(1)
    const roomTypeRow = roomRow
      ? await db
          .select()
          .from(schema.roomType)
          .where(eq(schema.roomType.id, roomRow.roomTypeId))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      : null
    const [floorRow] = roomRow?.floorId
      ? await db.select().from(schema.floor).where(eq(schema.floor.id, roomRow.floorId)).limit(1)
      : [null]

    const contractTenants = await db
      .select()
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.contractId, maintenanceRow.reportedByContractId))
    const tenantIds = contractTenants.map((ct) => ct.tenantId)
    const tenantRows =
      tenantIds.length > 0
        ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
        : []
    const tenantMap = Object.fromEntries(tenantRows.map((t) => [t.id, t]))

    const [contractRow] = await db
      .select()
      .from(schema.contract)
      .where(eq(schema.contract.id, maintenanceRow.reportedByContractId))
      .limit(1)

    const maintenanceRequest = {
      id: maintenanceRow.id,
      title: maintenanceRow.title,
      description: maintenanceRow.description,
      status: maintenanceRow.status,
      priority: maintenanceRow.priority,
      dueDate: maintenanceRow.dueDate,
      room: roomRow
        ? {
            id: roomRow.id,
            roomNumber: roomRow.roomNumber,
            status: roomRow.status,
            roomType: roomTypeRow ? { id: roomTypeRow.id, name: roomTypeRow.name } : null,
            floor: floorRow
              ? { id: floorRow.id, name: floorRow.name, floorNumber: floorRow.floorNumber }
              : null,
          }
        : null,
      reportedByContract: contractRow
        ? {
            id: contractRow.id,
            startDate: contractRow.startDate,
            endDate: contractRow.endDate,
            tenants: contractTenants.map((ct) => ({
              isPrimary: ct.isPrimary,
              tenant: tenantMap[ct.tenantId]
                ? {
                    id: tenantMap[ct.tenantId].id,
                    name: tenantMap[ct.tenantId].name,
                    phone: tenantMap[ct.tenantId].phone,
                  }
                : null,
            })),
          }
        : null,
      createdAt: maintenanceRow.createdAt,
      updatedAt: maintenanceRow.updatedAt,
    }

    return successResponse(maintenanceRequest, 'ดึงรายละเอียดการแจ้งซ่อมสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
