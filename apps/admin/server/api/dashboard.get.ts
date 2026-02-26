import { z } from 'zod'
import dayjs from 'dayjs'
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm'
import {
  PaymentStatus,
  InvoiceStatus,
  RoomStatus,
  BillingRunStatus,
  ContractStatus
} from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required')
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, data =>
      querySchema.safeParse(data)
    )
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Property ID is required'
      })
    }
    const { propertyId } = query.data

    await requirePropertyStaff(event, propertyId)

    const monthStart = dayjs().startOf('month').toDate()
    const monthEnd = dayjs().endOf('month').toDate()

    // Monthly income: sum payments via invoice.propertyId
    const [monthlyIncomeRow] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${schema.payment.amount} AS REAL)), 0)`
      })
      .from(schema.payment)
      .innerJoin(schema.invoice, eq(schema.payment.invoiceId, schema.invoice.id))
      .where(
        and(
          eq(schema.invoice.propertyId, propertyId),
          eq(schema.payment.status, PaymentStatus.VERIFIED),
          gte(schema.payment.paymentDate, monthStart),
          lte(schema.payment.paymentDate, monthEnd)
        )
      )

    const overdueRows = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${schema.invoice.totalAmount} AS REAL)), 0)`
      })
      .from(schema.invoice)
      .where(
        and(
          eq(schema.invoice.propertyId, propertyId),
          eq(schema.invoice.status, InvoiceStatus.OVERDUE)
        )
      )

    const [availableRoomsRow] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.room)
      .where(
        and(
          eq(schema.room.propertyId, propertyId),
          eq(schema.room.status, RoomStatus.AVAILABLE)
        )
      )

    const metrics = {
      monthlyIncome: Number(monthlyIncomeRow?.total ?? 0),
      overdueBalance: Number(overdueRows[0]?.total ?? 0),
      availableRooms: Number(availableRoomsRow?.count ?? 0),
      maintenanceRequests: 0
    }

    // Occupancy: group by status
    const roomStats = await db
      .select({
        status: schema.room.status,
        count: sql<number>`COUNT(*)`
      })
      .from(schema.room)
      .where(eq(schema.room.propertyId, propertyId))
      .groupBy(schema.room.status)

    const [totalRoomsRow] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.room)
      .where(eq(schema.room.propertyId, propertyId))

    const totalRooms = Number(totalRoomsRow?.count ?? 0)
    const byStatus = Object.fromEntries(
      roomStats.map((r: { status: string | null, count: number }) => [r.status, Number(r.count)])
    )

    const occupancy = {
      total: totalRooms,
      occupied: byStatus[RoomStatus.OCCUPIED] ?? 0,
      available: byStatus[RoomStatus.AVAILABLE] ?? 0,
      other:
        (byStatus[RoomStatus.CLEANING] ?? 0)
        + (byStatus[RoomStatus.MAINTENANCE] ?? 0)
        + (byStatus[RoomStatus.RESERVED] ?? 0)
    }

    // Latest billing run
    const [latestBillingRun] = await db
      .select()
      .from(schema.billingRun)
      .where(
        and(
          eq(schema.billingRun.propertyId, propertyId),
          eq(schema.billingRun.status, BillingRunStatus.COMPLETED)
        )
      )
      .orderBy(desc(schema.billingRun.createdAt))
      .limit(1)

    let billing = { paid: 0, unpaid: 0 }
    if (latestBillingRun) {
      const billingStats = await db
        .select({
          status: schema.invoice.status,
          count: sql<number>`COUNT(*)`
        })
        .from(schema.invoice)
        .where(eq(schema.invoice.billingRunId, latestBillingRun.id))
        .groupBy(schema.invoice.status)
      const byInvStatus = Object.fromEntries(
        billingStats.map((r: { status: string | null, count: number }) => [r.status, Number(r.count)])
      )
      billing = {
        paid: byInvStatus[InvoiceStatus.PAID] ?? 0,
        unpaid:
          (byInvStatus[InvoiceStatus.UNPAID] ?? 0)
          + (byInvStatus[InvoiceStatus.OVERDUE] ?? 0)
      }
    }

    const todos: Array<{
      type: string
      text: string
      urgent: boolean
      to: string
      relatedId: string
    }> = []

    // Pending payments (limit 3)
    const pendingPayments = await db
      .select({
        paymentId: schema.payment.id,
        roomNumber: schema.room.roomNumber
      })
      .from(schema.payment)
      .innerJoin(schema.invoice, eq(schema.payment.invoiceId, schema.invoice.id))
      .innerJoin(schema.contract, eq(schema.invoice.contractId, schema.contract.id))
      .innerJoin(schema.room, eq(schema.contract.roomId, schema.room.id))
      .where(
        and(
          eq(schema.invoice.propertyId, propertyId),
          eq(schema.payment.status, PaymentStatus.PENDING)
        )
      )
      .orderBy(schema.payment.createdAt)
      .limit(3)

    for (const p of pendingPayments) {
      todos.push({
        type: 'PAYMENT',
        text: `[ห้อง ${p.roomNumber ?? '-'}] ยืนยันการชำระเงิน`,
        urgent: true,
        to: '/payments?status=PENDING',
        relatedId: p.paymentId
      })
    }

    const today = dayjs().startOf('day').toDate()
    const todayEnd = dayjs().endOf('day').toDate()

    const checkInsToday = await db
      .select({
        contractId: schema.contract.id,
        tenantName: schema.tenant.name
      })
      .from(schema.contract)
      .innerJoin(
        schema.contractTenant,
        and(
          eq(schema.contractTenant.contractId, schema.contract.id),
          eq(schema.contractTenant.isPrimary, true)
        )
      )
      .innerJoin(schema.tenant, eq(schema.contractTenant.tenantId, schema.tenant.id))
      .where(
        and(
          eq(schema.contract.propertyId, propertyId),
          eq(schema.contract.status, ContractStatus.ACTIVE),
          gte(schema.contract.startDate, today),
          lte(schema.contract.startDate, todayEnd)
        )
      )
      .limit(3)

    for (const c of checkInsToday) {
      todos.push({
        type: 'CHECK_IN',
        text: `[${c.tenantName}] มีกำหนดเข้าพักวันนี้`,
        urgent: false,
        to: '/tenants?tab=UPCOMING',
        relatedId: c.contractId
      })
    }

    // Notice given: contracts with termination
    const noticeGiven = await db
      .select({
        contractId: schema.contract.id,
        tenantName: schema.tenant.name,
        terminatedDate: schema.contractTermination.terminatedDate
      })
      .from(schema.contract)
      .innerJoin(
        schema.contractTermination,
        eq(schema.contractTermination.contractId, schema.contract.id)
      )
      .innerJoin(
        schema.contractTenant,
        and(
          eq(schema.contractTenant.contractId, schema.contract.id),
          eq(schema.contractTenant.isPrimary, true)
        )
      )
      .innerJoin(schema.tenant, eq(schema.contractTenant.tenantId, schema.tenant.id))
      .where(eq(schema.contract.propertyId, propertyId))
      .orderBy(schema.contract.endDate)
      .limit(3)

    for (const c of noticeGiven) {
      const termDate = c.terminatedDate instanceof Date ? c.terminatedDate : new Date(c.terminatedDate)
      const daysUntil = dayjs(termDate).diff(dayjs(), 'day')
      todos.push({
        type: 'CHECK_OUT',
        text: `[${c.tenantName}] จะย้ายออกในอีก ${daysUntil} วัน`,
        urgent: daysUntil <= 3,
        to: '/tenants?tab=NOTICE_GIVEN',
        relatedId: c.contractId
      })
    }

    const [propRow] = await db
      .select({ contractEndingSoonDays: schema.property.contractEndingSoonDays })
      .from(schema.property)
      .where(eq(schema.property.id, propertyId))

    const endingSoonDays = propRow?.contractEndingSoonDays ?? 30
    const endingSoonDate = dayjs().add(endingSoonDays, 'day').toDate()

    const endingContracts = await db
      .select({
        contractId: schema.contract.id,
        endDate: schema.contract.endDate,
        tenantName: schema.tenant.name
      })
      .from(schema.contract)
      .innerJoin(
        schema.contractTenant,
        and(
          eq(schema.contractTenant.contractId, schema.contract.id),
          eq(schema.contractTenant.isPrimary, true)
        )
      )
      .innerJoin(schema.tenant, eq(schema.contractTenant.tenantId, schema.tenant.id))
      .where(
        and(
          eq(schema.contract.propertyId, propertyId),
          eq(schema.contract.status, ContractStatus.ACTIVE),
          lte(schema.contract.endDate, endingSoonDate)
        )
      )
      .orderBy(schema.contract.endDate)
      .limit(3)

    for (const c of endingContracts) {
      const endDate = c.endDate instanceof Date ? c.endDate : new Date(c.endDate)
      const daysUntil = dayjs(endDate).diff(dayjs(), 'day')
      todos.push({
        type: 'CONTRACT_ENDING',
        text: `[${c.tenantName}] สัญญาจะหมดอายุในอีก ${daysUntil} วัน`,
        urgent: daysUntil <= 7,
        to: `/contracts/${c.contractId}`,
        relatedId: c.contractId
      })
    }

    todos.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0))
    const limitedTodos = todos.slice(0, 10)

    return successResponse({
      metrics,
      occupancy,
      billing,
      todos: limitedTodos
    })
  } catch (error) {
    return errorResponse(event, error)
  }
})
