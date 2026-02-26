import { eq, and, inArray } from 'drizzle-orm'
import { InvoiceStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const tenantId = event.context.params?.id
    if (!tenantId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tenant ID is required'
      })
    }

    const [tenantRow] = await db
      .select({ propertyId: schema.tenant.propertyId })
      .from(schema.tenant)
      .where(eq(schema.tenant.id, tenantId))
      .limit(1)
    if (!tenantRow) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบผู้เช่า' })
    }
    await requirePropertyStaff(event, tenantRow.propertyId)

    const contractTenants = await db
      .select({ contractId: schema.contractTenant.contractId })
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.tenantId, tenantId))

    const contractIds = contractTenants.map(ct => ct.contractId)
    if (contractIds.length === 0) {
      return successResponse({
        id: tenantId,
        contracts: []
      })
    }

    const contracts = await db
      .select()
      .from(schema.contract)
      .where(inArray(schema.contract.id, contractIds))
      .orderBy(schema.contract.startDate)

    const roomIds = [...new Set(contracts.map(c => c.roomId))]
    const rooms = roomIds.length > 0
      ? await db.select().from(schema.room).where(inArray(schema.room.id, roomIds))
      : []
    const roomMap = Object.fromEntries(rooms.map(r => [r.id, r]))

    const invoicesByContract = await db
      .select()
      .from(schema.invoice)
      .where(
        and(
          inArray(schema.invoice.contractId, contractIds),
          inArray(schema.invoice.status, [InvoiceStatus.PAID, InvoiceStatus.OVERDUE])
        )
      )
      .orderBy(schema.invoice.period)

    const deposits = await db
      .select()
      .from(schema.deposit)
      .where(inArray(schema.deposit.contractId, contractIds))

    const terminations = await db
      .select()
      .from(schema.contractTermination)
      .where(inArray(schema.contractTermination.contractId, contractIds))

    const tenant = {
      id: tenantId,
      contracts: contracts.map(c => ({
        contract: {
          ...c,
          room: roomMap[c.roomId] ? { roomNumber: roomMap[c.roomId].roomNumber } : null,
          invoices: invoicesByContract.filter(inv => inv.contractId === c.id),
          deposits: deposits.filter(d => d.contractId === c.id),
          termination: terminations.find(t => t.contractId === c.id) ?? null
        }
      }))
    }

    return successResponse(tenant)
  } catch (error) {
    return errorResponse(event, error)
  }
})
