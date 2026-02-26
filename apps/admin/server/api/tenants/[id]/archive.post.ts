import { eq, and } from 'drizzle-orm'
import { ContractStatus, TenantStatus, RoomStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const tenantId = event.context.params?.id
    if (!tenantId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Tenant ID' })
    }

    const [tenantRow] = await db
      .select({ propertyId: schema.tenant.propertyId, name: schema.tenant.name })
      .from(schema.tenant)
      .where(eq(schema.tenant.id, tenantId))
      .limit(1)
    if (!tenantRow) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบผู้เช่า' })
    }
    await requirePropertyStaff(event, tenantRow.propertyId)

    const archivedTenant = await db.transaction(async (tx: typeof db) => {
      const activeContracts = await tx
        .select({
          contractId: schema.contract.id,
          roomId: schema.contract.roomId
        })
        .from(schema.contract)
        .innerJoin(schema.contractTenant, eq(schema.contractTenant.contractId, schema.contract.id))
        .where(
          and(
            eq(schema.contractTenant.tenantId, tenantId),
            eq(schema.contract.status, ContractStatus.ACTIVE)
          )
        )
        .limit(1)

      const contractRow = activeContracts[0]
      if (contractRow) {
        await tx
          .update(schema.contract)
          .set({
            status: ContractStatus.TERMINATED,
            endDate: new Date()
          })
          .where(eq(schema.contract.id, contractRow.contractId))

        await tx
          .update(schema.room)
          .set({ status: RoomStatus.CLEANING })
          .where(eq(schema.room.id, contractRow.roomId))
      }

      const [updated] = await tx
        .update(schema.tenant)
        .set({ status: TenantStatus.MOVED_OUT })
        .where(eq(schema.tenant.id, tenantId))
        .returning()
      return updated
    })

    const messageCompleted = `ผู้เช่า ${archivedTenant?.name ?? ''} ถูกย้ายสถานะเป็น 'ย้ายออกแล้ว'`
    return successResponse(archivedTenant, messageCompleted)
  } catch (error) {
    return errorResponse(event, error)
  }
})
