import { z } from 'zod'
import { eq, inArray, and, desc, sql } from 'drizzle-orm'
import { PaymentStatus } from '@repo/db'
import { requireSession } from '~~/server/utils/auth'

const querySchema = z.object({
  status: z.enum(Object.values(PaymentStatus) as [string, ...string[]]).optional(),
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
        { payments: [], total: 0, page, limit },
        'ดึงประวัติการชำระเงินสำเร็จ'
      )
    }

    const invoiceIds = await db
      .select({ id: schema.invoice.id })
      .from(schema.invoice)
      .where(inArray(schema.invoice.contractId, contractIds))
    const invIds = invoiceIds.map((r: { id: string }) => r.id)
    if (invIds.length === 0) {
      return successResponse(
        { payments: [], total: 0, page, limit },
        'ดึงประวัติการชำระเงินสำเร็จ'
      )
    }

    const wherePayment = status
      ? and(inArray(schema.payment.invoiceId, invIds), eq(schema.payment.status, status))
      : inArray(schema.payment.invoiceId, invIds)

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.payment)
      .where(wherePayment)
    const total = Number(countRow?.count ?? 0)

    const paymentsRows = await db
      .select()
      .from(schema.payment)
      .where(wherePayment)
      .orderBy(desc(schema.payment.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const receivingAccountIds = [...new Set(paymentsRows.map(p => p.receivingAccountId).filter(Boolean) as string[])]
    const receivingAccounts = receivingAccountIds.length > 0
      ? await db.select().from(schema.receivingAccount).where(inArray(schema.receivingAccount.id, receivingAccountIds))
      : []
    const raMap = Object.fromEntries(receivingAccounts.map(ra => [ra.id, ra]))

    const invRows = await db.select().from(schema.invoice).where(inArray(schema.invoice.id, invIds))
    const invMap = Object.fromEntries(invRows.map(i => [i.id, i]))
    const contractIdsFromInv = [...new Set(invRows.map(i => i.contractId))]
    const contractRows = await db.select().from(schema.contract).where(inArray(schema.contract.id, contractIdsFromInv))
    const contractMap = Object.fromEntries(contractRows.map(c => [c.id, c]))
    const roomIds = [...new Set(contractRows.map(c => c.roomId))]
    const roomRows = await db.select().from(schema.room).where(inArray(schema.room.id, roomIds))
    const roomMap = Object.fromEntries(roomRows.map(r => [r.id, r]))
    const roomTypeIds = [...new Set(roomRows.map(r => r.roomTypeId))]
    const roomTypeRows = await db.select().from(schema.roomType).where(inArray(schema.roomType.id, roomTypeIds))
    const rtMap = Object.fromEntries(roomTypeRows.map(rt => [rt.id, rt]))
    const itemRows = await db.select().from(schema.invoiceItem).where(inArray(schema.invoiceItem.invoiceId, invIds))
    const itemsByInv: Record<string, { id: string, description: string, amount: string }[]> = {}
    for (const it of itemRows) {
      if (!itemsByInv[it.invoiceId]) itemsByInv[it.invoiceId] = []
      itemsByInv[it.invoiceId].push({ id: it.id, description: it.description, amount: it.amount })
    }

    const payments = paymentsRows.map(p => {
      const inv = invMap[p.invoiceId]
      const contract = inv ? contractMap[inv.contractId] : null
      const room = contract ? roomMap[contract.roomId] : null
      const roomType = room ? rtMap[room.roomTypeId] : null
      const ra = p.receivingAccountId ? raMap[p.receivingAccountId] : null
      return {
        id: p.id,
        amount: p.amount,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        status: p.status,
        slipUrl: p.slipUrl,
        notes: p.notes,
        receivingAccount: ra
          ? { id: ra.id, type: ra.type, details: ra.details }
          : null,
        invoice: inv
          ? {
              id: inv.id,
              period: inv.period,
              totalAmount: inv.totalAmount,
              dueDate: inv.dueDate,
              status: inv.status,
              contract: contract && room && roomType
                ? {
                    id: contract.id,
                    room: {
                      id: room.id,
                      roomNumber: room.roomNumber,
                      roomType: { id: roomType.id, name: roomType.name }
                    }
                  }
                : null,
              items: itemsByInv[inv.id] ?? []
            }
          : null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }
    })

    return successResponse(
      { payments, total, page, limit },
      'ดึงประวัติการชำระเงินสำเร็จ'
    )
  } catch (error) {
    return errorResponse(event, error)
  }
})
