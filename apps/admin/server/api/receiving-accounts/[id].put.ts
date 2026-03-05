import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const updateAccountSchema = z.object({
  details: z.any().optional(),
  isActive: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const accountId = event.context.params?.id
    if (!accountId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Account ID is required',
      })
    }
    const body = await readValidatedBody(event, (data) => updateAccountSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten(),
      })
    }

    const [existing] = await db
      .select({ propertyId: schema.receivingAccount.propertyId })
      .from(schema.receivingAccount)
      .where(eq(schema.receivingAccount.id, accountId))
      .limit(1)
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบช่องทางนี้' })
    }
    await requirePropertyStaff(event, existing.propertyId)

    const updates: Record<string, unknown> = {}
    if (body.data.details !== undefined) updates.details = body.data.details
    if (body.data.isActive !== undefined) updates.isActive = body.data.isActive

    const [updated] = await db
      .update(schema.receivingAccount)
      .set(updates)
      .where(eq(schema.receivingAccount.id, accountId))
      .returning()
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบช่องทางนี้' })
    }

    return successResponse(updated, 'อัปเดตข้อมูลสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
