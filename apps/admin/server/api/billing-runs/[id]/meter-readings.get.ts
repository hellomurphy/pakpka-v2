import dayjs from 'dayjs'
import { eq, and, inArray } from 'drizzle-orm'
import { BillingType } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const runId = event.context.params?.id
    if (!runId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Billing Run ID is required',
      })
    }

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
    const invIds = invoices.map((i) => i.id)
    if (invIds.length === 0) {
      return successResponse([])
    }

    const contractIds = [...new Set(invoices.map((i) => i.contractId))]
    const contracts = await db
      .select()
      .from(schema.contract)
      .where(inArray(schema.contract.id, contractIds))
    const needMeterContractIds = contracts
      .filter(
        (c) =>
          c.waterBillingType === BillingType.PER_UNIT ||
          c.electricityBillingType === BillingType.PER_UNIT,
      )
      .map((c) => c.id)
    const invoicesNeedingReading = invoices.filter((inv) =>
      needMeterContractIds.includes(inv.contractId),
    )
    if (invoicesNeedingReading.length === 0) {
      return successResponse([])
    }

    const currentPeriod = invoicesNeedingReading[0].period
    const previousPeriod = dayjs(currentPeriod).subtract(1, 'month').format('YYYY-MM')
    const prevInvoices = await db
      .select({ id: schema.invoice.id, contractId: schema.invoice.contractId })
      .from(schema.invoice)
      .where(
        and(
          eq(schema.invoice.period, previousPeriod),
          inArray(schema.invoice.contractId, contractIds),
        ),
      )
    const prevInvIds = prevInvoices.map((i) => i.id)
    const previousReadings =
      prevInvIds.length > 0
        ? await db
            .select()
            .from(schema.meterReading)
            .where(inArray(schema.meterReading.invoiceId, prevInvIds))
        : []
    const prevInvMap = Object.fromEntries(prevInvoices.map((i) => [i.id, i]))
    const previousReadingsMap = new Map<string, { oldElec: number; oldWater: number }>()
    for (const r of previousReadings) {
      const contractId = prevInvMap[r.invoiceId]?.contractId
      if (!contractId) continue
      if (!previousReadingsMap.has(contractId)) {
        previousReadingsMap.set(contractId, { oldElec: 0, oldWater: 0 })
      }
      const v = previousReadingsMap.get(contractId)!
      if (r.utilityType === 'ELECTRICITY') v.oldElec = Number(r.readingValue)
      if (r.utilityType === 'WATER') v.oldWater = Number(r.readingValue)
    }

    const needReadingInvIds = invoicesNeedingReading.map((i) => i.id)
    const currentReadings =
      needReadingInvIds.length > 0
        ? await db
            .select()
            .from(schema.meterReading)
            .where(inArray(schema.meterReading.invoiceId, needReadingInvIds))
        : []
    const currentReadingsMap = new Map<
      string,
      { newElec: number | null; newWater: number | null }
    >()
    for (const r of currentReadings) {
      if (!currentReadingsMap.has(r.invoiceId)) {
        currentReadingsMap.set(r.invoiceId, { newElec: null, newWater: null })
      }
      const v = currentReadingsMap.get(r.invoiceId)!
      if (r.utilityType === 'ELECTRICITY') v.newElec = Number(r.readingValue)
      if (r.utilityType === 'WATER') v.newWater = Number(r.readingValue)
    }

    const contractMap = Object.fromEntries(contracts.map((c) => [c.id, c]))
    const roomIds = contracts.map((c) => c.roomId)
    const rooms = await db.select().from(schema.room).where(inArray(schema.room.id, roomIds))
    const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]))
    const floorIds = rooms.map((r) => r.floorId).filter(Boolean)
    const floors =
      floorIds.length > 0
        ? await db.select().from(schema.floor).where(inArray(schema.floor.id, floorIds))
        : []
    const floorMap = Object.fromEntries(floors.map((f) => [f.id, f]))
    const primaryTenants = await db
      .select()
      .from(schema.contractTenant)
      .where(
        and(
          inArray(schema.contractTenant.contractId, contractIds),
          eq(schema.contractTenant.isPrimary, true),
        ),
      )
    const tenantIds = primaryTenants.map((pt) => pt.tenantId)
    const tenants =
      tenantIds.length > 0
        ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
        : []
    const tenantMap = Object.fromEntries(tenants.map((t) => [t.id, t]))

    const responseList = invoicesNeedingReading.map((inv) => {
      const contract = contractMap[inv.contractId]
      const room = contract ? roomMap[contract.roomId] : null
      const floor = room?.floorId ? floorMap[room.floorId] : null
      const pt = contract ? primaryTenants.find((x) => x.contractId === contract.id) : null
      const tenant = pt ? tenantMap[pt.tenantId] : null
      const prev = previousReadingsMap.get(inv.contractId) ?? { oldElec: 0, oldWater: 0 }
      const curr = currentReadingsMap.get(inv.id) ?? { newElec: null, newWater: null }
      return {
        invoiceId: inv.id,
        roomNumber: room?.roomNumber ?? '',
        tenantName: tenant?.name ?? null,
        floor: floor ? { name: floor.name, floorNumber: floor.floorNumber } : null,
        oldElec: prev.oldElec,
        newElec: curr.newElec,
        oldWater: prev.oldWater,
        newWater: curr.newWater,
      }
    })

    responseList.sort((a, b) =>
      a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }),
    )
    return successResponse(responseList)
  } catch (error) {
    return errorResponse(event, error)
  }
})
