import { eq, and, inArray, desc } from 'drizzle-orm'
import { ContractStatus, ContractServiceStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const roomId = getRouterParam(event, 'id')
    if (!roomId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Room ID is required'
      })
    }

    const [roomRow] = await db
      .select()
      .from(schema.room)
      .where(eq(schema.room.id, roomId))
      .limit(1)
    if (!roomRow) {
      throw createError({ statusCode: 404, statusMessage: 'Room not found' })
    }
    await requirePropertyStaff(event, roomRow.propertyId)

    const [floorRow] = await db
      .select()
      .from(schema.floor)
      .where(eq(schema.floor.id, roomRow.floorId ?? ''))
      .limit(1)
    const [roomTypeRow] = await db
      .select()
      .from(schema.roomType)
      .where(eq(schema.roomType.id, roomRow.roomTypeId))
      .limit(1)
    const amenityLinks = roomTypeRow
      ? await db
          .select()
          .from(schema.roomTypeAmenity)
          .where(eq(schema.roomTypeAmenity.roomTypeId, roomTypeRow.id))
      : []
    const amenityIds = amenityLinks.map(a => a.amenityId)
    const amenities = amenityIds.length > 0
      ? await db.select().from(schema.amenity).where(inArray(schema.amenity.id, amenityIds))
      : []

    const [activeContractRow] = await db
      .select()
      .from(schema.contract)
      .where(
        and(
          eq(schema.contract.roomId, roomId),
          eq(schema.contract.status, ContractStatus.ACTIVE)
        )
      )
      .limit(1)
    let activeContract: typeof activeContractRow extends undefined ? null : NonNullable<typeof activeContractRow> & {
      tenants: { tenant: { id: string, name: string, phone: string | null, status: string | null } }[]
      deposits: { id: string, amount: string, receivedDate: Date, refundedDate: Date | null, deductions: string | null, deductionNotes: string | null, clearanceStatus: string | null }[]
      services: { id: string, startDate: Date, service: { name: string, defaultPrice: string, billingCycle: string } }[]
    } = null as any
    if (activeContractRow) {
      const primaryTenants = await db
        .select()
        .from(schema.contractTenant)
        .where(
          and(
            eq(schema.contractTenant.contractId, activeContractRow.id),
            eq(schema.contractTenant.isPrimary, true)
          )
        )
      const tenantIds = primaryTenants.map(pt => pt.tenantId)
      const tenantRows = tenantIds.length > 0
        ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
        : []
      const tenantMap = Object.fromEntries(tenantRows.map(t => [t.id, t]))
      const deposits = await db
        .select()
        .from(schema.deposit)
        .where(eq(schema.deposit.contractId, activeContractRow.id))
      const contractServices = await db
        .select()
        .from(schema.contractService)
        .where(
          and(
            eq(schema.contractService.contractId, activeContractRow.id),
            eq(schema.contractService.status, ContractServiceStatus.ACTIVE)
          )
        )
      const serviceIds = contractServices.map(cs => cs.serviceId)
      const serviceRows = serviceIds.length > 0
        ? await db.select().from(schema.service).where(inArray(schema.service.id, serviceIds))
        : []
      const serviceMap = Object.fromEntries(serviceRows.map(s => [s.id, s]))
      activeContract = {
        ...activeContractRow,
        tenants: primaryTenants.map(pt => ({
          tenant: tenantMap[pt.tenantId]
            ? {
                id: tenantMap[pt.tenantId].id,
                name: tenantMap[pt.tenantId].name,
                phone: tenantMap[pt.tenantId].phone,
                status: tenantMap[pt.tenantId].status
              }
            : null
        })).filter(t => t.tenant) as any,
        deposits: deposits.map(d => ({
          id: d.id,
          amount: d.amount,
          receivedDate: d.receivedDate,
          refundedDate: d.refundedDate,
          deductions: d.deductions,
          deductionNotes: d.deductionNotes,
          clearanceStatus: d.clearanceStatus
        })),
        services: contractServices.map(cs => {
          const s = serviceMap[cs.serviceId]
          return {
            id: cs.id,
            customPrice: cs.customPrice,
            startDate: cs.startDate,
            service: s ? { name: s.name, defaultPrice: s.defaultPrice, billingCycle: s.billingCycle } : null
          }
        }).filter(x => x.service) as any
      }
    }

    const contractsForRoom = await db
      .select({ id: schema.contract.id })
      .from(schema.contract)
      .where(eq(schema.contract.roomId, roomId))
    const contractIdsForRoom = contractsForRoom.map(c => c.id)
    const recentInvoices = contractIdsForRoom.length > 0
      ? await db
          .select()
          .from(schema.invoice)
          .where(inArray(schema.invoice.contractId, contractIdsForRoom))
          .orderBy(desc(schema.invoice.period))
          .limit(12)
      : []
    const invIds = recentInvoices.map(i => i.id)
    const items = invIds.length > 0
      ? await db.select().from(schema.invoiceItem).where(inArray(schema.invoiceItem.invoiceId, invIds))
      : []
    const meterReadings = invIds.length > 0
      ? await db.select().from(schema.meterReading).where(inArray(schema.meterReading.invoiceId, invIds))
      : []
    const payments = invIds.length > 0
      ? await db
          .select()
          .from(schema.payment)
          .where(
            and(
              inArray(schema.payment.invoiceId, invIds),
              eq(schema.payment.status, 'VERIFIED')
            )
          )
      : []
    const itemsByInv: Record<string, { id: string, description: string, amount: string }[]> = {}
    for (const it of items) {
      if (!itemsByInv[it.invoiceId]) itemsByInv[it.invoiceId] = []
      itemsByInv[it.invoiceId].push({ id: it.id, description: it.description, amount: it.amount })
    }
    const meterByInv: Record<string, { id: string, utilityType: string, readingValue: string, readingDate: Date }[]> = {}
    for (const m of meterReadings) {
      if (!meterByInv[m.invoiceId]) meterByInv[m.invoiceId] = []
      meterByInv[m.invoiceId].push({
        id: m.id,
        utilityType: m.utilityType,
        readingValue: m.readingValue,
        readingDate: m.readingDate
      })
    }
    const paymentsByInv: Record<string, { id: string, amount: string }[]> = {}
    for (const p of payments) {
      if (!paymentsByInv[p.invoiceId]) paymentsByInv[p.invoiceId] = []
      paymentsByInv[p.invoiceId].push({ id: p.id, amount: p.amount })
    }

    const pastContracts = await db
      .select()
      .from(schema.contract)
      .where(
        and(
          eq(schema.contract.roomId, roomId),
          inArray(schema.contract.status, [ContractStatus.TERMINATED, ContractStatus.EXPIRED])
        )
      )
      .orderBy(desc(schema.contract.endDate))
      .limit(10)
    const pastContractIds = pastContracts.map(c => c.id)
    const pastPrimaryTenants = pastContractIds.length > 0
      ? await db
          .select()
          .from(schema.contractTenant)
          .where(
            and(
              inArray(schema.contractTenant.contractId, pastContractIds),
              eq(schema.contractTenant.isPrimary, true)
            )
          )
      : []
    const pastTenantIds = pastPrimaryTenants.map(pt => pt.tenantId)
    const pastTenantRows = pastTenantIds.length > 0
      ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, pastTenantIds))
      : []
    const pastTenantMap = Object.fromEntries(pastTenantRows.map(t => [t.id, t]))

    const [activeReservationRow] = await db
      .select()
      .from(schema.reservation)
      .where(
        and(
          eq(schema.reservation.roomId, roomId),
          inArray(schema.reservation.status, ['PENDING', 'CONFIRMED'])
        )
      )
      .orderBy(schema.reservation.startDate)
      .limit(1)
    let reservationTenant: { id: string, name: string, phone: string | null } | null = null
    if (activeReservationRow) {
      const [t] = await db
        .select()
        .from(schema.tenant)
        .where(eq(schema.tenant.id, activeReservationRow.tenantId))
        .limit(1)
      reservationTenant = t ? { id: t.id, name: t.name, phone: t.phone } : null
    }

    const latestMeterReadings = recentInvoices[0]
      ? (meterByInv[recentInvoices[0].id] ?? [])
      : []
    const latestElecReading = latestMeterReadings.find(m => m.utilityType === 'ELECTRICITY')
    const latestWaterReading = latestMeterReadings.find(m => m.utilityType === 'WATER')
    const currentTenant = activeContract?.tenants?.[0]?.tenant ?? null
    const deposit = activeContract?.deposits?.[0] ?? null

    return {
      id: roomRow.id,
      roomNumber: roomRow.roomNumber,
      status: roomRow.status,
      floor: floorRow
        ? { id: floorRow.id, name: floorRow.name, floorNumber: floorRow.floorNumber }
        : null,
      roomType: roomTypeRow
        ? {
            id: roomTypeRow.id,
            name: roomTypeRow.name,
            basePrice: roomTypeRow.basePrice,
            deposit: roomTypeRow.deposit,
            amenities: amenities.map(a => ({ id: a.id, name: a.name }))
          }
        : null,
      currentContract: activeContract
        ? {
            id: activeContract.id,
            startDate: activeContract.startDate,
            endDate: activeContract.endDate,
            status: activeContract.status,
            rentAmount: activeContract.rentAmount,
            waterBillingType: activeContract.waterBillingType,
            waterRate: activeContract.waterRate,
            waterMinimumCharge: activeContract.waterMinimumCharge,
            electricityBillingType: activeContract.electricityBillingType,
            electricityRate: activeContract.electricityRate,
            electricityMinimumCharge: activeContract.electricityMinimumCharge,
            services: ((activeContract as any).services ?? []).map((cs: any) => ({
              id: cs.id,
              serviceName: cs.service?.name,
              price: cs.customPrice ?? cs.service?.defaultPrice,
              billingCycle: cs.service?.billingCycle,
              startDate: cs.startDate
            }))
          }
        : null,
      currentTenant: currentTenant
        ? { id: currentTenant.id, name: currentTenant.name, phone: currentTenant.phone, status: currentTenant.status }
        : null,
      deposit: deposit
        ? {
            id: deposit.id,
            amount: deposit.amount,
            receivedDate: deposit.receivedDate,
            refundedDate: deposit.refundedDate,
            deductions: deposit.deductions,
            deductionNotes: deposit.deductionNotes,
            clearanceStatus: deposit.clearanceStatus
          }
        : null,
      lastMeterReading: {
        electricity: latestElecReading ? { value: latestElecReading.readingValue, date: latestElecReading.readingDate } : null,
        water: latestWaterReading ? { value: latestWaterReading.readingValue, date: latestWaterReading.readingDate } : null
      },
      activeReservation: activeReservationRow && reservationTenant
        ? {
            id: activeReservationRow.id,
            startDate: activeReservationRow.startDate,
            endDate: activeReservationRow.endDate,
            status: activeReservationRow.status,
            tenant: reservationTenant
          }
        : null,
      invoices: recentInvoices.map(inv => {
        const elec = (meterByInv[inv.id] ?? []).find(m => m.utilityType === 'ELECTRICITY')
        const water = (meterByInv[inv.id] ?? []).find(m => m.utilityType === 'WATER')
        const paidAmount = (paymentsByInv[inv.id] ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
        return {
          id: inv.id,
          period: inv.period,
          totalAmount: inv.totalAmount,
          dueDate: inv.dueDate,
          status: inv.status,
          paidAmount,
          items: itemsByInv[inv.id] ?? [],
          meterReadings: {
            electricity: elec ? { value: elec.readingValue, date: elec.readingDate } : null,
            water: water ? { value: water.readingValue, date: water.readingDate } : null
          }
        }
      }),
      pastTenants: pastContracts.map(c => {
        const pt = pastPrimaryTenants.find(p => p.contractId === c.id)
        const t = pt ? pastTenantMap[pt.tenantId] : null
        return {
          contractId: c.id,
          tenantId: t?.id,
          name: t?.name ?? 'Unknown',
          phone: t?.phone ?? '-',
          startDate: c.startDate,
          endDate: c.endDate,
          status: c.status
        }
      })
    }
  } catch (error) {
    return errorResponse(event, error)
  }
})
