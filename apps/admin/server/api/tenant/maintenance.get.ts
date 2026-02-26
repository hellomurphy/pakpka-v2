import { z } from 'zod'
import { eq, inArray, and, desc, sql } from 'drizzle-orm'
import { MaintenanceStatus } from '@repo/db'
import { requireSession } from '~~/server/utils/auth'

const querySchema = z.object({
  status: z.enum(Object.values(MaintenanceStatus) as [string, ...string[]]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15)
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)

    const query = await getValidatedQuery(event, data => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูล Query ไม่ถูกต้อง'
      })
    }
    const { status, page, limit } = query.data

    const [tenantRow] = await db
      .select({ id: schema.tenant.id })
      .from(schema.tenant)
      .where(eq(schema.tenant.userId, session.id))
      .limit(1)
    if (!tenantRow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบข้อมูลผู้เช่า'
      })
    }

    const links = await db
      .select({ contractId: schema.contractTenant.contractId })
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.tenantId, tenantRow.id))
    const contractIds = links.map((l: { contractId: string }) => l.contractId)
    if (contractIds.length === 0) {
      return successResponse(
        { maintenanceRequests: [], total: 0, page, limit },
        'ดึงรายการแจ้งซ่อมสำเร็จ'
      )
    }

    const whereCondition = status
      ? and(
          inArray(schema.maintenanceRequest.reportedByContractId, contractIds),
          eq(schema.maintenanceRequest.status, status)
        )
      : inArray(schema.maintenanceRequest.reportedByContractId, contractIds)

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.maintenanceRequest)
      .where(whereCondition)
    const total = Number(countRow?.count ?? 0)

    const requests = await db
      .select()
      .from(schema.maintenanceRequest)
      .where(whereCondition)
      .orderBy(desc(schema.maintenanceRequest.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const roomIds = [...new Set(requests.map(r => r.roomId))]
    const roomRows = await db.select().from(schema.room).where(inArray(schema.room.id, roomIds))
    const roomMap = Object.fromEntries(roomRows.map(r => [r.id, r]))
    const roomTypeIds = [...new Set(roomRows.map(r => r.roomTypeId))]
    const roomTypeRows = await db.select().from(schema.roomType).where(inArray(schema.roomType.id, roomTypeIds))
    const rtMap = Object.fromEntries(roomTypeRows.map(rt => [rt.id, rt]))

    const contractIdsFromRequests = [...new Set(requests.map(r => r.reportedByContractId))]
    const primaryTenants = await db
      .select()
      .from(schema.contractTenant)
      .where(
        and(
          inArray(schema.contractTenant.contractId, contractIdsFromRequests),
          eq(schema.contractTenant.isPrimary, true)
        )
      )
    const tenantIds = primaryTenants.map(pt => pt.tenantId)
    const tenantRows = tenantIds.length > 0
      ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
      : []
    const tenantMap = Object.fromEntries(tenantRows.map(t => [t.id, t]))
    const primaryByContract: Record<string, { id: string, name: string }> = {}
    for (const pt of primaryTenants) {
      const t = tenantMap[pt.tenantId]
      if (t) primaryByContract[pt.contractId] = { id: t.id, name: t.name }
    }

    const formattedRequests = requests.map(req => {
      const room = roomMap[req.roomId]
      const roomType = room ? rtMap[room.roomTypeId] : null
      const reportedBy = primaryByContract[req.reportedByContractId]
      return {
        id: req.id,
        title: req.title,
        description: req.description,
        status: req.status,
        priority: req.priority,
        dueDate: req.dueDate,
        room: room
          ? {
              id: room.id,
              roomNumber: room.roomNumber,
              roomType: roomType ? { id: roomType.id, name: roomType.name } : null
            }
          : null,
        reportedBy: reportedBy ?? null,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt
      }
    })

    return successResponse(
      { maintenanceRequests: formattedRequests, total, page, limit },
      'ดึงรายการแจ้งซ่อมสำเร็จ'
    )
  } catch (error) {
    return errorResponse(event, error)
  }
})
