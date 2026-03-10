import { eq, and, inArray } from 'drizzle-orm'
import { InvoiceStatus, PaymentStatus } from '@repo/db'
import { requireSession } from '~~/server/utils/auth'
import { toDecimalNumber } from '~~/server/utils/apiResponse'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)

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

    const contractLinks = await db
      .select({ contractId: schema.contractTenant.contractId })
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.tenantId, tenantRow.id))
    const contractIds = contractLinks.map((c) => c.contractId)
    if (contractIds.length === 0) {
      return successResponse(
        { invoices: [], total: 0, totalUnpaid: 0 },
        'ดึงข้อมูลใบแจ้งหนี้ปัจจุบันสำเร็จ',
      )
    }

    const invoices = await db
      .select()
      .from(schema.invoice)
      .where(
        and(
          inArray(schema.invoice.contractId, contractIds),
          inArray(schema.invoice.status, [InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE]),
        ),
      )
      .orderBy(schema.invoice.dueDate)

    const contractIdsFromInvoices = [...new Set(invoices.map((i) => i.contractId))]
    const contracts = await db
      .select()
      .from(schema.contract)
      .where(inArray(schema.contract.id, contractIdsFromInvoices))
    const contractMap = Object.fromEntries(contracts.map((c) => [c.id, c]))

    const roomIds = [...new Set(contracts.map((c) => c.roomId))]
    const rooms =
      roomIds.length > 0
        ? await db.select().from(schema.room).where(inArray(schema.room.id, roomIds))
        : []
    const roomTypeIds = [...new Set(rooms.map((r) => r.roomTypeId))]
    const roomTypes =
      roomTypeIds.length > 0
        ? await db.select().from(schema.roomType).where(inArray(schema.roomType.id, roomTypeIds))
        : []
    const roomTypeMap = Object.fromEntries(roomTypes.map((rt) => [rt.id, rt]))
    const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]))

    const invoiceIds = invoices.map((i) => i.id)
    const items =
      invoiceIds.length > 0
        ? await db
            .select()
            .from(schema.invoiceItem)
            .where(inArray(schema.invoiceItem.invoiceId, invoiceIds))
        : []
    const meterReadings =
      invoiceIds.length > 0
        ? await db
            .select()
            .from(schema.meterReading)
            .where(inArray(schema.meterReading.invoiceId, invoiceIds))
        : []
    const payments =
      invoiceIds.length > 0
        ? await db
            .select()
            .from(schema.payment)
            .where(inArray(schema.payment.invoiceId, invoiceIds))
        : []

    const propertyIds = [
      ...new Set(invoices.map((i) => contractMap[i.contractId]?.propertyId).filter(Boolean)),
    ]
    const properties =
      propertyIds.length > 0
        ? await db.select().from(schema.property).where(inArray(schema.property.id, propertyIds))
        : []
    const receivingAccounts =
      propertyIds.length > 0
        ? await db
            .select()
            .from(schema.receivingAccount)
            .where(
              and(
                inArray(schema.receivingAccount.propertyId, propertyIds),
                eq(schema.receivingAccount.isActive, true),
              ),
            )
        : []

    const baseUrl = getRequestURL(event).origin
    const currentInvoices = invoices.map((inv) => {
      const contract = contractMap[inv.contractId]
      const room = contract ? roomMap[contract.roomId] : null
      const roomType = room ? roomTypeMap[room.roomTypeId] : null
      const invPayments = payments.filter(
        (p) => p.invoiceId === inv.id && p.status === PaymentStatus.PENDING,
      )
      const prop = properties.find((p) => p.id === contract?.propertyId)
      const accounts = prop ? receivingAccounts.filter((ra) => ra.propertyId === prop.id) : []
      return {
        id: inv.id,
        period: inv.period,
        totalAmount: toDecimalNumber(inv.totalAmount),
        dueDate: inv.dueDate,
        status: inv.status,
        createdAt: inv.createdAt,
        contract: contract
          ? {
              id: contract.id,
              room: room
                ? {
                    id: room.id,
                    roomNumber: room.roomNumber,
                    roomType: roomType ? { id: roomType.id, name: roomType.name } : null,
                  }
                : null,
            }
          : null,
        items: items
          .filter((it) => it.invoiceId === inv.id)
          .map((it) => ({
            id: it.id,
            invoiceId: it.invoiceId,
            description: it.description,
            amount: toDecimalNumber(it.amount),
          })),
        meterReadings: meterReadings.filter((mr) => mr.invoiceId === inv.id),
        payments: invPayments.map((p) => {
          const slipUrl = p.slipKey
            ? `${baseUrl}/api/slips/${encodeURIComponent(p.slipKey)}`
            : p.slipUrl
          return {
            id: p.id,
            invoiceId: p.invoiceId,
            amount: toDecimalNumber(p.amount),
            paymentDate: p.paymentDate,
            status: p.status,
            paymentMethod: p.paymentMethod,
            slipKey: p.slipKey ?? null,
            slipStatus: p.slipStatus ?? null,
            slipUrl,
            notes: p.notes,
            receivingAccountId: p.receivingAccountId,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          }
        }),
        property: prop ? { id: prop.id, name: prop.name, receivingAccounts: accounts } : null,
      }
    })

    const totalUnpaid = currentInvoices.reduce(
      (sum: number, inv: { totalAmount: number }) => sum + inv.totalAmount,
      0,
    )

    return successResponse(
      {
        invoices: currentInvoices,
        total: currentInvoices.length,
        totalUnpaid,
      },
      'ดึงข้อมูลใบแจ้งหนี้ปัจจุบันสำเร็จ',
    )
  } catch (error) {
    return errorResponse(event, error)
  }
})
