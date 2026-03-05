import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const addServiceSchema = z.object({
  serviceId: z.string().min(1, 'ต้องระบุ Service'),
  customPrice: z.coerce.number().optional(),
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
    const body = await readValidatedBody(event, (data) => addServiceSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }

    const [contract] = await db
      .select({ propertyId: schema.contract.propertyId })
      .from(schema.contract)
      .where(eq(schema.contract.id, contractId))
      .limit(1)
    if (!contract) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบสัญญานี้' })
    }
    await requirePropertyStaff(event, contract.propertyId)

    const id = crypto.randomUUID()
    const now = new Date()
    const [newContractService] = await db
      .insert(schema.contractService)
      .values({
        id,
        contractId,
        serviceId: body.data.serviceId,
        customPrice: body.data.customPrice != null ? String(body.data.customPrice) : null,
        startDate: now,
      })
      .returning()
    if (!newContractService) {
      throw createError({ statusCode: 500, statusMessage: 'เพิ่มบริการเสริมไม่สำเร็จ' })
    }

    return successResponse(newContractService, 'เพิ่มบริการเสริมสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
