import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({ propertyId: z.string().min(1) })

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, data => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid property ID'
      })
    }
    await requirePropertyStaff(event, query.data.propertyId)

    const accounts = await db
      .select()
      .from(schema.receivingAccount)
      .where(eq(schema.receivingAccount.propertyId, query.data.propertyId))
      .orderBy(schema.receivingAccount.createdAt)

    return successResponse(accounts)
  } catch (error) {
    return errorResponse(event, error)
  }
})
