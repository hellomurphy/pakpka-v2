import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { ContractStatus, TenantStatus, RoomStatus, DepositClearanceStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const finalizeSchema = z.object({
  deductions: z.number().min(0, 'ยอดหักต้องไม่ติดลบ').default(0),
  deductionNotes: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const contractId = event.context.params?.id
    if (!contractId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Contract ID',
      })
    }
    const body = await readValidatedBody(event, (data) => finalizeSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }
    const { deductions, deductionNotes } = body.data

    const [contractRow] = await db
      .select()
      .from(schema.contract)
      .where(eq(schema.contract.id, contractId))
      .limit(1)
    if (!contractRow) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบสัญญานี้' })
    }
    await requirePropertyStaff(event, contractRow.propertyId)

    const result = await db.transaction(async (tx) => {
      const primaryLinks = await tx
        .select({ tenantId: schema.contractTenant.tenantId })
        .from(schema.contractTenant)
        .where(
          and(
            eq(schema.contractTenant.contractId, contractId),
            eq(schema.contractTenant.isPrimary, true),
          ),
        )
      const primaryTenantId = primaryLinks[0]?.tenantId
      if (!primaryTenantId) {
        throw createError({ statusCode: 400, statusMessage: 'ไม่พบผู้เช่าหลักในสัญญานี้' })
      }

      await tx
        .update(schema.tenant)
        .set({ status: TenantStatus.MOVED_OUT })
        .where(eq(schema.tenant.id, primaryTenantId))

      await tx
        .update(schema.contract)
        .set({ status: ContractStatus.TERMINATED })
        .where(eq(schema.contract.id, contractId))

      await tx
        .update(schema.room)
        .set({ status: RoomStatus.CLEANING })
        .where(eq(schema.room.id, contractRow.roomId))

      const [existingDeposit] = await tx
        .select()
        .from(schema.deposit)
        .where(eq(schema.deposit.contractId, contractId))
        .limit(1)
      if (existingDeposit) {
        await tx
          .update(schema.deposit)
          .set({
            deductions: String(deductions),
            deductionNotes: deductionNotes ?? null,
            refundedDate: new Date(),
            clearanceStatus: DepositClearanceStatus.REFUNDED,
          })
          .where(eq(schema.deposit.id, existingDeposit.id))
      } else {
        await tx.insert(schema.deposit).values({
          id: crypto.randomUUID(),
          contractId,
          amount: '0',
          receivedDate: new Date(),
          refundedDate: new Date(),
          deductions: String(deductions),
          deductionNotes: deductionNotes ?? null,
          clearanceStatus: DepositClearanceStatus.REFUNDED,
        })
      }

      const [room] = await tx
        .select({ roomNumber: schema.room.roomNumber })
        .from(schema.room)
        .where(eq(schema.room.id, contractRow.roomId))
        .limit(1)
      return { roomNumber: room?.roomNumber ?? '' }
    })

    return successResponse(result, `ยืนยันการย้ายออกของห้อง ${result.roomNumber} สำเร็จ`)
  } catch (error) {
    return errorResponse(event, error)
  }
})
