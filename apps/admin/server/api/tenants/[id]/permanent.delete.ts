import { eq, inArray } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const tenantId = event.context.params?.id
    if (!tenantId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Tenant ID',
      })
    }

    const [tenant] = await db
      .select({ propertyId: schema.tenant.propertyId })
      .from(schema.tenant)
      .where(eq(schema.tenant.id, tenantId))
      .limit(1)
    if (!tenant) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบข้อมูลผู้เช่า',
      })
    }
    await requirePropertyStaff(event, tenant.propertyId)

    await db.transaction(async (tx: typeof db) => {
      const links = await tx
        .select({ contractId: schema.contractTenant.contractId })
        .from(schema.contractTenant)
        .where(eq(schema.contractTenant.tenantId, tenantId))
      const originalContractIds = links.map((l: { contractId: string }) => l.contractId)

      await tx.delete(schema.contractTenant).where(eq(schema.contractTenant.tenantId, tenantId))

      if (originalContractIds.length > 0) {
        const remaining = await tx
          .select({ contractId: schema.contractTenant.contractId })
          .from(schema.contractTenant)
          .where(inArray(schema.contractTenant.contractId, originalContractIds))
        const withTenants = new Set(remaining.map((r: { contractId: string }) => r.contractId))
        const toDelete = originalContractIds.filter((id: string) => !withTenants.has(id))

        if (toDelete.length > 0) {
          await tx
            .delete(schema.maintenanceRequest)
            .where(inArray(schema.maintenanceRequest.reportedByContractId, toDelete))
          await tx.delete(schema.deposit).where(inArray(schema.deposit.contractId, toDelete))
          await tx
            .delete(schema.contractService)
            .where(inArray(schema.contractService.contractId, toDelete))
          const invoicesToDelete = await tx
            .select({ id: schema.invoice.id })
            .from(schema.invoice)
            .where(inArray(schema.invoice.contractId, toDelete))
          const invoiceIds = invoicesToDelete.map((i: { id: string }) => i.id)
          if (invoiceIds.length > 0) {
            await tx.delete(schema.payment).where(inArray(schema.payment.invoiceId, invoiceIds))
            await tx
              .delete(schema.invoiceItem)
              .where(inArray(schema.invoiceItem.invoiceId, invoiceIds))
            const meterReadings = await tx
              .select({ id: schema.meterReading.id })
              .from(schema.meterReading)
              .where(inArray(schema.meterReading.invoiceId, invoiceIds))
            const meterReadingIds = meterReadings.map((m: { id: string }) => m.id)
            if (meterReadingIds.length > 0) {
              await tx
                .delete(schema.meterReadingPhoto)
                .where(inArray(schema.meterReadingPhoto.meterReadingId, meterReadingIds))
            }
            await tx
              .delete(schema.meterReading)
              .where(inArray(schema.meterReading.invoiceId, invoiceIds))
          }
          await tx.delete(schema.invoice).where(inArray(schema.invoice.contractId, toDelete))
          await tx
            .delete(schema.contractTermination)
            .where(inArray(schema.contractTermination.contractId, toDelete))
          await tx.delete(schema.contract).where(inArray(schema.contract.id, toDelete))
        }
      }

      await tx.delete(schema.reservation).where(eq(schema.reservation.tenantId, tenantId))
      await tx.delete(schema.tenant).where(eq(schema.tenant.id, tenantId))
    })

    return successResponse(null, 'ลบข้อมูลผู้เช่าถาวรสำเร็จ')
  } catch (error: unknown) {
    return errorResponse(event, error)
  }
})
