import { eq, and } from 'drizzle-orm'
import { InvoiceStatus, BillingRunStatus, UtilityType } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'
import { isInvoiceMeterReady } from '~~/server/utils/invoice-meter-ready'

export default defineEventHandler(async (event) => {
  try {
    const invoiceId = event.context.params?.id
    if (!invoiceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Invoice ID',
      })
    }

    const [invoiceRow] = await db
      .select()
      .from(schema.invoice)
      .where(eq(schema.invoice.id, invoiceId))
      .limit(1)
    if (!invoiceRow) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบใบแจ้งหนี้' })
    }
    await requirePropertyStaff(event, invoiceRow.propertyId)

    if (invoiceRow.status !== InvoiceStatus.DRAFT) {
      throw createError({
        statusCode: 409,
        statusMessage: 'ใบแจ้งหนี้นี้ไม่ได้อยู่ในสถานะฉบับร่าง',
      })
    }

    const [contractRow] = await db
      .select()
      .from(schema.contract)
      .where(eq(schema.contract.id, invoiceRow.contractId))
      .limit(1)
    if (!contractRow) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบสัญญา' })
    }

    const meterReadings = await db
      .select({ utilityType: schema.meterReading.utilityType })
      .from(schema.meterReading)
      .where(eq(schema.meterReading.invoiceId, invoiceId))
    const hasElec = meterReadings.some((r) => r.utilityType === UtilityType.ELECTRICITY)
    const hasWater = meterReadings.some((r) => r.utilityType === UtilityType.WATER)
    if (
      !isInvoiceMeterReady(
        contractRow.electricityBillingType,
        contractRow.waterBillingType,
        hasElec,
        hasWater,
      )
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลมิเตอร์ไม่ครบถ้วน ไม่สามารถส่งใบแจ้งหนี้ได้',
      })
    }

    const primaryTenants = await db
      .select()
      .from(schema.contractTenant)
      .where(
        and(
          eq(schema.contractTenant.contractId, invoiceRow.contractId),
          eq(schema.contractTenant.isPrimary, true),
        ),
      )
    const tenantIds = primaryTenants.map((pt) => pt.tenantId)
    const [primaryTenant] =
      tenantIds.length > 0
        ? await db.select().from(schema.tenant).where(eq(schema.tenant.id, tenantIds[0])).limit(1)
        : [null]
    const [roomRow] = await db
      .select({ roomNumber: schema.room.roomNumber })
      .from(schema.room)
      .where(eq(schema.room.id, contractRow.roomId))
      .limit(1)

    await db.transaction(async (tx) => {
      await tx
        .update(schema.invoice)
        .set({ status: InvoiceStatus.UNPAID })
        .where(eq(schema.invoice.id, invoiceId))

      if (invoiceRow.billingRunId) {
        const remainingDrafts = await tx
          .select()
          .from(schema.invoice)
          .where(
            and(
              eq(schema.invoice.billingRunId, invoiceRow.billingRunId),
              eq(schema.invoice.status, InvoiceStatus.DRAFT),
            ),
          )
        const count = remainingDrafts.filter((inv) => inv.id !== invoiceId).length
        if (count === 0) {
          await tx
            .update(schema.billingRun)
            .set({ status: BillingRunStatus.COMPLETED })
            .where(eq(schema.billingRun.id, invoiceRow.billingRunId))
        }
      }
    })

    if (primaryTenant) {
      console.log(`
        ========================================
        [SIMULATING LINE NOTIFICATION]
        To: ${primaryTenant.name}
        Message: "ใบแจ้งหนี้รอบบิล ${invoiceRow.period} ออกแล้ว ยอดชำระ ${invoiceRow.totalAmount} บาท"
        Link: /invoices/${invoiceRow.id}
        ========================================
      `)
    }

    return successResponse(null, `ส่งใบแจ้งหนี้สำหรับห้อง ${roomRow?.roomNumber ?? '-'} สำเร็จ`)
  } catch (error) {
    return errorResponse(event, error)
  }
})
