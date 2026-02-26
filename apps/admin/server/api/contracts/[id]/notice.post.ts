import { z } from 'zod'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { TenantStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const noticeSchema = z.object({
  noticeDate: z.coerce.date().min(dayjs().startOf('day').toDate(), {
    message: 'วันที่ต้องไม่ใช่วันในอดีต'
  })
})

export default defineEventHandler(async (event) => {
  try {
    const contractId = event.context.params?.id
    if (!contractId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Contract ID'
      })
    }
    const body = await readValidatedBody(event, data => noticeSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten()
      })
    }
    const { noticeDate } = body.data

    const [contract] = await db
      .select({ propertyId: schema.contract.propertyId })
      .from(schema.contract)
      .where(eq(schema.contract.id, contractId))
      .limit(1)
    if (!contract) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบสัญญานี้' })
    }
    await requirePropertyStaff(event, contract.propertyId)

    await db.transaction(async (tx) => {
      await tx
        .update(schema.contract)
        .set({ endDate: noticeDate })
        .where(eq(schema.contract.id, contractId))

      const links = await tx
        .select({ tenantId: schema.contractTenant.tenantId })
        .from(schema.contractTenant)
        .where(eq(schema.contractTenant.contractId, contractId))
      const tenantIds = links.map(ct => ct.tenantId)
      for (const tid of tenantIds) {
        await tx
          .update(schema.tenant)
          .set({ status: TenantStatus.NOTICE_GIVEN })
          .where(eq(schema.tenant.id, tid))
      }
    })

    return successResponse(null, 'บันทึกการแจ้งย้ายออกสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
