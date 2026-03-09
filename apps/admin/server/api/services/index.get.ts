import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  propertyId: z.string().min(1, 'ต้องระบุ Property ID'),
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, (data) => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Property ID',
      })
    }
    const { propertyId } = query.data
    await requirePropertyStaff(event, propertyId)

    const services = await db
      .select()
      .from(schema.service)
      .where(eq(schema.service.propertyId, propertyId))
      .orderBy(schema.service.defaultPrice)

    return successResponse(services)
  } catch (error) {
    return errorResponse(event, error)
  }
})
