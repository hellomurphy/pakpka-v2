import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { BillingCycle } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const updateServiceSchema = z.object({
  name: z.string().min(1, 'ต้องระบุชื่อบริการ').optional(),
  defaultPrice: z.coerce.number().min(0).optional(),
  billingCycle: z.enum(Object.values(BillingCycle) as [string, ...string[]]).optional(),
  isOptional: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const serviceId = event.context.params?.id
    if (!serviceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Service ID'
      })
    }

    const body = await readValidatedBody(event, data => updateServiceSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }

    const [existing] = await db
      .select({ propertyId: schema.service.propertyId })
      .from(schema.service)
      .where(eq(schema.service.id, serviceId))
      .limit(1)
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบบริการนี้'
      })
    }
    await requirePropertyStaff(event, existing.propertyId)

    const updates: Record<string, unknown> = {}
    if (body.data.name !== undefined) updates.name = body.data.name
    if (body.data.defaultPrice !== undefined) updates.defaultPrice = String(body.data.defaultPrice)
    if (body.data.billingCycle !== undefined) updates.billingCycle = body.data.billingCycle
    if (body.data.isOptional !== undefined) updates.isOptional = body.data.isOptional

    const [updated] = await db
      .update(schema.service)
      .set(updates)
      .where(eq(schema.service.id, serviceId))
      .returning()
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบบริการนี้' })
    }

    return successResponse(updated, 'อัปเดตบริการสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
