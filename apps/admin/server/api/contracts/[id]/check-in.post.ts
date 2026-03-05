import { eq } from 'drizzle-orm'
import { TenantStatus, RoomStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const contractId = event.context.params?.id
    if (!contractId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Contract ID',
      })
    }

    const [contract] = await db
      .select({ roomId: schema.contract.roomId, propertyId: schema.contract.propertyId })
      .from(schema.contract)
      .where(eq(schema.contract.id, contractId))
      .limit(1)
    if (!contract) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบสัญญานี้' })
    }
    await requirePropertyStaff(event, contract.propertyId)

    await db.transaction(async (tx) => {
      const links = await tx
        .select({ tenantId: schema.contractTenant.tenantId })
        .from(schema.contractTenant)
        .where(eq(schema.contractTenant.contractId, contractId))
      const tenantIds = links.map((ct) => ct.tenantId)
      for (const tid of tenantIds) {
        await tx
          .update(schema.tenant)
          .set({ status: TenantStatus.ACTIVE })
          .where(eq(schema.tenant.id, tid))
      }
      await tx
        .update(schema.room)
        .set({ status: RoomStatus.OCCUPIED })
        .where(eq(schema.room.id, contract.roomId))
    })

    return successResponse(null, 'ยืนยันการย้ายเข้าสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
