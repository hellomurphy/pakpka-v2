import { eq, and } from 'drizzle-orm'
import { ContractServiceStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const serviceId = event.context.params?.id
    if (!serviceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Service ID'
      })
    }

    const [existing] = await db
      .select({ id: schema.service.id, propertyId: schema.service.propertyId })
      .from(schema.service)
      .where(eq(schema.service.id, serviceId))
      .limit(1)
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบบริการที่ต้องการลบ'
      })
    }
    await requirePropertyStaff(event, existing.propertyId)

    const activeContractServices = await db
      .select()
      .from(schema.contractService)
      .where(
        and(
          eq(schema.contractService.serviceId, serviceId),
          eq(schema.contractService.status, ContractServiceStatus.ACTIVE)
        )
      )
    if (activeContractServices.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `ไม่สามารถลบได้ เนื่องจากยังมี ${activeContractServices.length} สัญญาที่ใช้บริการนี้อยู่`
      })
    }

    const deleted = await db
      .delete(schema.service)
      .where(eq(schema.service.id, serviceId))
      .returning()
    if (deleted.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบบริการที่ต้องการลบ'
      })
    }

    event.node.res.statusCode = 204
    return
  } catch (error) {
    return errorResponse(event, error)
  }
})
