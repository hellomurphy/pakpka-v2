import { z } from 'zod'
import { BillingCycle } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const createServiceSchema = z.object({
  name: z.string().min(1, 'ต้องระบุชื่อบริการ'),
  defaultPrice: z.coerce.number().min(0),
  billingCycle: z.enum(Object.values(BillingCycle) as [string, ...string[]]),
  isOptional: z.boolean().default(true),
  propertyId: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, data => createServiceSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง', data: body.error.errors })
    }
    await requirePropertyStaff(event, body.data.propertyId)

    const id = crypto.randomUUID()
    const [newService] = await db
      .insert(schema.service)
      .values({
        id,
        name: body.data.name,
        defaultPrice: String(body.data.defaultPrice),
        billingCycle: body.data.billingCycle,
        isOptional: body.data.isOptional,
        propertyId: body.data.propertyId
      })
      .returning()
    if (!newService) throw createError({ statusCode: 500, statusMessage: 'สร้างบริการไม่สำเร็จ' })

    return successResponse(newService, 'สร้างบริการใหม่สำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
