import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { TenantStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const tenantStatusValues = Object.values(TenantStatus) as [string, ...string[]]
const updateTenantSchema = z.object({
  name: z.string().trim().min(1, 'ต้องระบุชื่อ').optional(),
  phone: z
    .string()
    .regex(/^0[0-9]{8,9}$/, 'เบอร์โทรไม่ถูกต้อง')
    .optional()
    .or(z.literal(''))
    .optional(),
  status: z.enum(tenantStatusValues).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const tenantId = event.context.params?.id
    if (!tenantId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Tenant ID' })
    }

    const [existing] = await db
      .select({ propertyId: schema.tenant.propertyId })
      .from(schema.tenant)
      .where(eq(schema.tenant.id, tenantId))
      .limit(1)
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบผู้เช่า' })
    }
    await requirePropertyStaff(event, existing.propertyId)

    const body = await readValidatedBody(event, (data) => updateTenantSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten(),
      })
    }

    const updateData: Record<string, unknown> = {}
    if (body.data.name !== undefined) updateData.name = body.data.name
    if (body.data.phone !== undefined) updateData.phone = body.data.phone || null
    if (body.data.status !== undefined) updateData.status = body.data.status

    const [updated] = await db
      .update(schema.tenant)
      .set(updateData)
      .where(eq(schema.tenant.id, tenantId))
      .returning()

    return successResponse(updated, 'อัพเดตข้อมูลผู้เช่าสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
