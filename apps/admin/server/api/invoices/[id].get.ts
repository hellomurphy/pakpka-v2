import { eq, and, inArray } from 'drizzle-orm'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const invoiceId = event.context.params?.id
    if (!invoiceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invoice ID is required'
      })
    }

    const [invoiceRow] = await db
      .select()
      .from(schema.invoice)
      .where(eq(schema.invoice.id, invoiceId))
      .limit(1)
    if (!invoiceRow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบใบแจ้งหนี้นี้'
      })
    }

    const session = await requireSession(event)
    const [staff] = await db
      .select()
      .from(schema.propertyStaff)
      .where(
        and(
          eq(schema.propertyStaff.userId, session.id),
          eq(schema.propertyStaff.propertyId, invoiceRow.propertyId)
        )
      )
      .limit(1)
    let isTenantOwner = false
    if (!staff) {
      const [tenantRow] = await db
        .select({ id: schema.tenant.id })
        .from(schema.tenant)
        .where(eq(schema.tenant.userId, session.id))
        .limit(1)
      if (tenantRow) {
        const [link] = await db
          .select()
          .from(schema.contractTenant)
          .where(
            and(
              eq(schema.contractTenant.contractId, invoiceRow.contractId),
              eq(schema.contractTenant.tenantId, tenantRow.id)
            )
          )
          .limit(1)
        isTenantOwner = !!link
      }
    }
    if (!staff && !isTenantOwner) {
      throw createError({
        statusCode: 403,
        statusMessage: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้'
      })
    }

    const items = await db
      .select()
      .from(schema.invoiceItem)
      .where(eq(schema.invoiceItem.invoiceId, invoiceId))
    const [contractRow] = await db
      .select()
      .from(schema.contract)
      .where(eq(schema.contract.id, invoiceRow.contractId))
      .limit(1)
    const [roomRow] = contractRow
      ? await db.select().from(schema.room).where(eq(schema.room.id, contractRow.roomId)).limit(1)
      : [null]
    const primaryTenants = contractRow
      ? await db
          .select()
          .from(schema.contractTenant)
          .where(
            and(
              eq(schema.contractTenant.contractId, contractRow.id),
              eq(schema.contractTenant.isPrimary, true)
            )
          )
      : []
    const tenantIds = primaryTenants.map(pt => pt.tenantId)
    const tenants = tenantIds.length > 0
      ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
      : []
    const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t]))

    const invoice = {
      id: invoiceRow.id,
      period: invoiceRow.period,
      totalAmount: invoiceRow.totalAmount,
      dueDate: invoiceRow.dueDate,
      status: invoiceRow.status,
      contractId: invoiceRow.contractId,
      billingRunId: invoiceRow.billingRunId,
      propertyId: invoiceRow.propertyId,
      items: items.map(it => ({ id: it.id, description: it.description, amount: it.amount })),
      contract: contractRow && roomRow
        ? {
            id: contractRow.id,
            rentAmount: contractRow.rentAmount,
            waterBillingType: contractRow.waterBillingType,
            electricityBillingType: contractRow.electricityBillingType,
            room: { id: roomRow.id, roomNumber: roomRow.roomNumber },
            tenants: primaryTenants.map(pt => ({
              isPrimary: true,
              tenant: tenantMap[pt.tenantId]
                ? { id: tenantMap[pt.tenantId].id, name: tenantMap[pt.tenantId].name, phone: tenantMap[pt.tenantId].phone }
                : null
            })).filter(t => t.tenant)
          }
        : null
    }

    return successResponse(invoice)
  } catch (error) {
    return errorResponse(event, error)
  }
})
