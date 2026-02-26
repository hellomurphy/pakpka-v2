import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { InvoiceStatus, BillingType } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(),
  sortBy: z.string().optional().default('roomNumber_asc'),
  status: z.string().optional().default('all')
})

function checkMeterReadingReady(
  waterBillingType: string,
  electricityBillingType: string,
  hasWaterReading: boolean,
  hasElectricityReading: boolean
): boolean {
  let isReady = true
  if (electricityBillingType === BillingType.PER_UNIT && !hasElectricityReading) isReady = false
  if (waterBillingType === BillingType.PER_UNIT && !hasWaterReading) isReady = false
  return isReady
}

export default defineEventHandler(async (event) => {
  try {
    const runId = event.context.params?.id
    if (!runId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Billing Run ID is required'
      })
    }
    const query = await getValidatedQuery(event, data => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid query parameters'
      })
    }
    const { page, limit, q, sortBy } = query.data

    const [billingRun] = await db
      .select({ propertyId: schema.billingRun.propertyId })
      .from(schema.billingRun)
      .where(eq(schema.billingRun.id, runId))
      .limit(1)
    if (!billingRun) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบรอบบิลนี้' })
    }
    await requirePropertyStaff(event, billingRun.propertyId)

    const invoices = await db
      .select()
      .from(schema.invoice)
      .where(eq(schema.invoice.billingRunId, runId))
    const invIds = invoices.map(i => i.id)
    if (invIds.length === 0) {
      return successResponse({ invoices: [], total: 0 })
    }

    const contractIds = [...new Set(invoices.map(i => i.contractId))]
    const contracts = await db.select().from(schema.contract).where(inArray(schema.contract.id, contractIds))
    const contractMap = Object.fromEntries(contracts.map(c => [c.id, c]))
    const roomIds = contracts.map(c => c.roomId)
    const rooms = await db.select().from(schema.room).where(inArray(schema.room.id, roomIds))
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
    const tenants = tenantIds.length > 0
      ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
      : []
    const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t]))
    const meterReadings = await db
      .select()
      .from(schema.meterReading)
      .where(inArray(schema.meterReading.invoiceId, invIds))
    const hasWaterByInv: Record<string, boolean> = {}
    const hasElecByInv: Record<string, boolean> = {}
    for (const mr of meterReadings) {
      if (mr.utilityType === 'WATER') hasWaterByInv[mr.invoiceId] = true
      if (mr.utilityType === 'ELECTRICITY') hasElecByInv[mr.invoiceId] = true
    }

    let filtered = invoices
    if (q?.trim()) {
      const term = q.trim().toLowerCase()
      filtered = filtered.filter(inv => {
        const contract = contractMap[inv.contractId]
        const room = contract ? roomMap[contract.roomId] : null
        const pt = contract ? primaryTenants.find(x => x.contractId === contract.id) : null
        const tenant = pt ? tenantMap[pt.tenantId] : null
        const roomNum = room?.roomNumber ?? ''
        const name = tenant?.name ?? ''
        return roomNum.toLowerCase().includes(term) || name.toLowerCase().includes(term)
      })
    }
    const total = filtered.length

    const sortKey = sortBy === 'totalAmount_desc' ? 'totalAmount' : sortBy === 'totalAmount_asc' ? 'totalAmount' : 'roomNumber'
    const sortDir = sortBy === 'totalAmount_desc' || sortBy === 'roomNumber_desc' ? 'desc' : 'asc'
    filtered.sort((a, b) => {
      const contractA = contractMap[a.contractId]
      const contractB = contractMap[b.contractId]
      const roomA = contractA ? roomMap[contractA.roomId] : null
      const roomB = contractB ? roomMap[contractB.roomId] : null
      if (sortKey === 'roomNumber') {
        const cmp = (roomA?.roomNumber ?? '').localeCompare(roomB?.roomNumber ?? '', undefined, { numeric: true })
        return sortDir === 'desc' ? -cmp : cmp
      }
      const amtA = Number(a.totalAmount)
      const amtB = Number(b.totalAmount)
      return sortDir === 'desc' ? amtB - amtA : amtA - amtB
    })

    const offset = (page - 1) * limit
    const paged = filtered.slice(offset, offset + limit)

    const formattedInvoices = paged.map(inv => {
      const contract = contractMap[inv.contractId]
      const room = contract ? roomMap[contract.roomId] : null
      const pt = contract ? primaryTenants.find(x => x.contractId === contract.id) : null
      const tenant = pt ? tenantMap[pt.tenantId] : null
      const hasWater = hasWaterByInv[inv.id] ?? false
      const hasElec = hasElecByInv[inv.id] ?? false
      const isReadyToSend =
        inv.status !== InvoiceStatus.DRAFT
          ? false
          : checkMeterReadingReady(
              contract?.waterBillingType ?? '',
              contract?.electricityBillingType ?? '',
              hasWater,
              hasElec
            )
      return {
        id: inv.id,
        period: inv.period,
        totalAmount: inv.totalAmount,
        dueDate: inv.dueDate,
        status: inv.status,
        contractId: inv.contractId,
        billingRunId: inv.billingRunId,
        contract: contract && room
          ? {
              waterBillingType: contract.waterBillingType,
              electricityBillingType: contract.electricityBillingType,
              rentAmount: contract.rentAmount,
              room: { roomNumber: room.roomNumber },
              tenants: tenant ? [{ tenant: { name: tenant.name } }] : []
            }
          : null,
        isReadyToSend
      }
    })

    return successResponse({
      invoices: formattedInvoices,
      total
    })
  } catch (error) {
    return errorResponse(event, error)
  }
})
