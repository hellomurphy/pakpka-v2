import { z } from 'zod'
import { eq, inArray, and, desc, sql, like } from 'drizzle-orm'
import { InvoiceStatus } from '@repo/db'
import { requireSession } from '~~/server/utils/auth'

const querySchema = z.object({
  year: z.coerce.number().int().min(2020).optional(),
  status: z.enum(Object.values(InvoiceStatus) as [string, ...string[]]).optional(),
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
    const { year, status, page, limit } = query.data

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
        { invoices: [], total: 0, page, limit },
        'ดึงข้อมูลใบแจ้งหนี้สำเร็จ'
      )
    }

    const conditions = [inArray(schema.invoice.contractId, contractIds)]
    if (status) conditions.push(eq(schema.invoice.status, status))
    if (year) conditions.push(like(schema.invoice.period, `${year}-%`))
    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0]

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.invoice)
      .where(whereClause)
    const total = Number(countRow?.count ?? 0)

    const invoiceRows = await db
      .select()
      .from(schema.invoice)
      .where(whereClause)
      .orderBy(desc(schema.invoice.period))
      .limit(limit)
      .offset((page - 1) * limit)

    const contractIdsFromInv = [...new Set(invoiceRows.map(i => i.contractId))]
    const contractRows = await db.select().from(schema.contract).where(inArray(schema.contract.id, contractIdsFromInv))
    const contractMap = Object.fromEntries(contractRows.map(c => [c.id, c]))
    const roomIds = [...new Set(contractRows.map(c => c.roomId))]
    const roomRows = await db.select().from(schema.room).where(inArray(schema.room.id, roomIds))
    const roomMap = Object.fromEntries(roomRows.map(r => [r.id, r]))
    const roomTypeIds = [...new Set(roomRows.map(r => r.roomTypeId))]
    const roomTypeRows = await db.select().from(schema.roomType).where(inArray(schema.roomType.id, roomTypeIds))
    const rtMap = Object.fromEntries(roomTypeRows.map(rt => [rt.id, rt]))

    const invIds = invoiceRows.map(i => i.id)
    const itemRows = await db.select().from(schema.invoiceItem).where(inArray(schema.invoiceItem.invoiceId, invIds))
    const itemsByInv: Record<string, { id: string, description: string, amount: string }[]> = {}
    for (const it of itemRows) {
      if (!itemsByInv[it.invoiceId]) itemsByInv[it.invoiceId] = []
      itemsByInv[it.invoiceId].push({ id: it.id, description: it.description, amount: it.amount })
    }

    const meterRows = await db.select().from(schema.meterReading).where(inArray(schema.meterReading.invoiceId, invIds))
    const meterByInv: Record<string, { id: string, utilityType: string, readingValue: string, readingDate: Date }[]> = {}
    for (const m of meterRows) {
      if (!meterByInv[m.invoiceId]) meterByInv[m.invoiceId] = []
      meterByInv[m.invoiceId].push({
        id: m.id,
        utilityType: m.utilityType,
        readingValue: m.readingValue,
        readingDate: m.readingDate
      })
    }

    const paymentRows = await db.select().from(schema.payment).where(inArray(schema.payment.invoiceId, invIds))
    const paymentsByInv: Record<string, { id: string, amount: string, paymentDate: Date, status: string | null, paymentMethod: string }[]> = {}
    for (const p of paymentRows) {
      if (!paymentsByInv[p.invoiceId]) paymentsByInv[p.invoiceId] = []
      paymentsByInv[p.invoiceId].push({
        id: p.id,
        amount: p.amount,
        paymentDate: p.paymentDate,
        status: p.status,
        paymentMethod: p.paymentMethod
      })
    }

    const invoices = invoiceRows.map(inv => {
      const contract = contractMap[inv.contractId]
      const room = contract ? roomMap[contract.roomId] : null
      const roomType = room ? rtMap[room.roomTypeId] : null
      return {
        id: inv.id,
        period: inv.period,
        totalAmount: inv.totalAmount,
        dueDate: inv.dueDate,
        status: inv.status,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
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
        items: itemsByInv[inv.id] ?? [],
        meterReadings: meterByInv[inv.id] ?? [],
        payments: paymentsByInv[inv.id] ?? []
      }
    })

    return successResponse(
      { invoices, total, page, limit },
      'ดึงข้อมูลใบแจ้งหนี้สำเร็จ'
    )
  } catch (error) {
    return errorResponse(event, error)
  }
})
