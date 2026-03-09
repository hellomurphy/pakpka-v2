import { eq } from 'drizzle-orm'
import { ContractStatus, TenantStatus, RoomStatus } from '@repo/db'
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

    const result = await db.transaction(async (tx) => {
      const links = await tx
        .select({ tenantId: schema.contractTenant.tenantId })
        .from(schema.contractTenant)
        .where(eq(schema.contractTenant.contractId, contractId))
      const tenantIds = links.map((ct) => ct.tenantId)

      await tx
        .update(schema.contract)
        .set({ status: ContractStatus.TERMINATED })
        .where(eq(schema.contract.id, contractId))

      if (tenantIds.length > 0) {
        for (const tid of tenantIds) {
          await tx
            .update(schema.tenant)
            .set({ status: TenantStatus.WAITING_LIST })
            .where(eq(schema.tenant.id, tid))
        }
      }

      await tx
        .update(schema.room)
        .set({ status: RoomStatus.AVAILABLE })
        .where(eq(schema.room.id, contract.roomId))

      await tx.delete(schema.deposit).where(eq(schema.deposit.contractId, contractId))

      const [room] = await tx
        .select({ roomNumber: schema.room.roomNumber })
        .from(schema.room)
        .where(eq(schema.room.id, contract.roomId))
        .limit(1)
      return { room: { roomNumber: room?.roomNumber ?? '' } }
    })

    return successResponse(null, `ยกเลิกสัญญาสำหรับห้อง ${result.room.roomNumber} สำเร็จ`)
  } catch (error) {
    return errorResponse(event, error)
  }
})
