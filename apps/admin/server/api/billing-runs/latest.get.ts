import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  propertyId: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, data => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid Property ID'
      })
    }
    const { propertyId } = query.data
    await requirePropertyStaff(event, propertyId)

    const [latestRun] = await db
      .select({ id: schema.billingRun.id })
      .from(schema.billingRun)
      .where(eq(schema.billingRun.propertyId, propertyId))
      .orderBy(desc(schema.billingRun.period))
      .limit(1)

    return successResponse(latestRun ?? null)
  } catch (error) {
    return errorResponse(event, error)
  }
})
