import { z } from 'zod'
import { eq, and, inArray, asc, sql } from 'drizzle-orm'
import { PaymentStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  propertyId: z.string().min(1),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('15')
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, data => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid query' })
    }
    const { propertyId, page, limit } = query.data
    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)
    await requirePropertyStaff(event, propertyId)

    const invIds = await db
      .select({ id: schema.invoice.id })
      .from(schema.invoice)
      .where(eq(schema.invoice.propertyId, propertyId))
    const ids = invIds.map(i => i.id)
    if (ids.length === 0) {
      return successResponse({ payments: [], total: 0 })
    }

    const whereClause = and(
      inArray(schema.payment.invoiceId, ids),
      eq(schema.payment.status, PaymentStatus.PENDING)
    )

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.payment)
      .where(whereClause)
    const total = Number(countRow?.count ?? 0)

    const paymentsRows = await db
      .select()
      .from(schema.payment)
      .where(whereClause)
      .orderBy(asc(schema.payment.createdAt))
      .limit(limitNum)
      .offset((pageNum - 1) * limitNum)

    const invoiceIdsFromPayments = [...new Set(paymentsRows.map(p => p.invoiceId))]
    const invoices = await db.select().from(schema.invoice).where(inArray(schema.invoice.id, invoiceIdsFromPayments))
    const invMap = Object.fromEntries(invoices.map(i => [i.id, i]))
    const contractIds = [...new Set(invoices.map(i => i.contractId))]
    const contracts = await db.select().from(schema.contract).where(inArray(schema.contract.id, contractIds))
    const contractMap = Object.fromEntries(contracts.map(c => [c.id, c]))
    const rooms = await db.select().from(schema.room).where(inArray(schema.room.id, contracts.map(c => c.roomId)))
    const roomMap = Object.fromEntries(rooms.map(r => [r.id, r]))
    const primaryTenants = await db
      .select()
      .from(schema.contractTenant)
      .where(
        and(
          inArray(schema.contractTenant.contractId, contractIds),
          eq(schema.contractTenant.isPrimary, true)
        )
      )
    const tenantIds = primaryTenants.map(pt => pt.tenantId)
    const tenants = await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
    const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t]))
    const items = await db.select().from(schema.invoiceItem).where(inArray(schema.invoiceItem.invoiceId, invoiceIdsFromPayments))
    const itemsByInv: Record<string, { id: string, description: string, amount: string }[]> = {}
    for (const it of items) {
      if (!itemsByInv[it.invoiceId]) itemsByInv[it.invoiceId] = []
      itemsByInv[it.invoiceId].push({ id: it.id, description: it.description, amount: it.amount })
    }

    const formattedPayments = paymentsRows.map(p => {
      const inv = invMap[p.invoiceId]
      const contract = inv ? contractMap[inv.contractId] : null
      const room = contract ? roomMap[contract.roomId] : null
      const pt = contract ? primaryTenants.find(x => x.contractId === contract.id) : null
      const tenant = pt ? tenantMap[pt.tenantId] : null
      return {
        id: p.id,
        amount: p.amount,
        paymentDate: p.paymentDate,
        slipUrl: p.slipUrl,
        submittedAt: p.createdAt,
        tenantName: tenant?.name ?? 'N/A',
        roomNumber: room?.roomNumber ?? null,
        invoice: inv
          ? {
              id: inv.id,
              period: inv.period,
              dueDate: inv.dueDate,
              totalAmount: inv.totalAmount,
              items: itemsByInv[inv.id] ?? []
            }
          : null
      }
    })

    return successResponse({ payments: formattedPayments, total })
  } catch (error) {
    return errorResponse(event, error)
  }
})
