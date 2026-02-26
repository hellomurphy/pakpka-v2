import dayjs from 'dayjs'
import { eq, and, gte, lte, inArray, sql } from 'drizzle-orm'
import { TenantStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const propertyId = event.context.params?.id
    if (!propertyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Property ID'
      })
    }
    await requirePropertyStaff(event, propertyId)

    const startOfMonth = dayjs().startOf('month').toDate()
    const endOfMonth = dayjs().endOf('month').toDate()

    const invoiceIdsForProperty = await db
      .select({ id: schema.invoice.id })
      .from(schema.invoice)
      .where(eq(schema.invoice.propertyId, propertyId))
    const invIds = invoiceIdsForProperty.map(i => i.id)

    const [incomeRow] =
      invIds.length > 0
        ? await db
            .select({ total: sql<string>`COALESCE(SUM(CAST(${schema.payment.amount} AS REAL)), 0)` })
            .from(schema.payment)
            .where(
              and(
                inArray(schema.payment.invoiceId, invIds),
                eq(schema.payment.status, 'VERIFIED'),
                gte(schema.payment.paymentDate, startOfMonth),
                lte(schema.payment.paymentDate, endOfMonth)
              )
            )
        : [{ total: '0' }]
    const monthlyIncome = Number(incomeRow?.total ?? 0)

    const [overdueRow] = await db
      .select({ total: sql<string>`COALESCE(SUM(CAST(${schema.invoice.totalAmount} AS REAL)), 0)` })
      .from(schema.invoice)
      .where(and(eq(schema.invoice.propertyId, propertyId), eq(schema.invoice.status, 'OVERDUE')))
    const overdueBalance = Number(overdueRow?.total ?? 0)

    const availableRooms = await db
      .select()
      .from(schema.room)
      .where(and(eq(schema.room.propertyId, propertyId), eq(schema.room.status, 'AVAILABLE')))
    const availableRoomsCount = availableRooms.length

    const roomIds = await db.select({ id: schema.room.id }).from(schema.room).where(eq(schema.room.propertyId, propertyId))
    const rIds = roomIds.map(r => r.id)
    const maintenanceCount =
      rIds.length > 0
        ? (await db
            .select()
            .from(schema.maintenanceRequest)
            .innerJoin(schema.room, eq(schema.room.id, schema.maintenanceRequest.roomId))
            .where(
              and(eq(schema.room.propertyId, propertyId), eq(schema.maintenanceRequest.status, 'PENDING'))
            )).length
        : 0

    const roomStatusRows = await db
      .select({ status: schema.room.status })
      .from(schema.room)
      .where(eq(schema.room.propertyId, propertyId))
    const statusCounts: Record<string, number> = {}
    for (const r of roomStatusRows) {
      const s = r.status ?? 'UNKNOWN'
      statusCounts[s] = (statusCounts[s] ?? 0) + 1
    }
    const totalRoomCount = roomStatusRows.length
    const occupied = statusCounts['OCCUPIED'] ?? 0
    const available = statusCounts['AVAILABLE'] ?? 0

    const invoicesThisMonth = await db
      .select({ status: schema.invoice.status })
      .from(schema.invoice)
      .where(
        and(
          eq(schema.invoice.propertyId, propertyId),
          gte(schema.invoice.createdAt, startOfMonth)
        )
      )
    const billingCounts: Record<string, number> = {}
    for (const inv of invoicesThisMonth) {
      const s = inv.status ?? 'UNKNOWN'
      billingCounts[s] = (billingCounts[s] ?? 0) + 1
    }
    const paid = billingCounts['PAID'] ?? 0
    const unpaid = (billingCounts['UNPAID'] ?? 0) + (billingCounts['OVERDUE'] ?? 0)

    const todoTenants = await db
      .select()
      .from(schema.tenant)
      .where(
        and(
          eq(schema.tenant.propertyId, propertyId),
          inArray(schema.tenant.status, [TenantStatus.UPCOMING, TenantStatus.NOTICE_GIVEN])
        )
      )
    const tenantIds = todoTenants.map(t => t.id)
    const links =
      tenantIds.length > 0
        ? await db
            .select()
            .from(schema.contractTenant)
            .where(inArray(schema.contractTenant.tenantId, tenantIds))
        : []
    const contractIds = [...new Set(links.map(l => l.contractId))]
    const contracts =
      contractIds.length > 0
        ? await db
            .select()
            .from(schema.contract)
            .where(inArray(schema.contract.id, contractIds))
        : []
    const contractByTenant: Record<string, { startDate: Date, endDate: Date }> = {}
    for (const link of links) {
      const c = contracts.find(x => x.id === link.contractId)
      if (c) contractByTenant[link.tenantId] = { startDate: c.startDate, endDate: c.endDate }
    }
    const todoList = todoTenants.map(t => ({
      name: t.name,
      status: t.status,
      contract: contractByTenant[t.id] ?? null
    }))

    const metrics = {
      monthlyIncome,
      overdueBalance,
      availableRooms: availableRoomsCount,
      maintenanceRequests: maintenanceCount
    }
    const occupancy = {
      total: totalRoomCount,
      occupied,
      available,
      other: totalRoomCount - occupied - available
    }
    const billing = { paid, unpaid }

    return successResponse({ metrics, occupancy, billing, todoList })
  } catch (error) {
    return errorResponse(event, error)
  }
})
