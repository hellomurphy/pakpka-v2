import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { Role } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const removeStaffSchema = z.object({
  propertyId: z.string().min(1),
  userId: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, data => removeStaffSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, data: body.error.flatten() })
    }
    const { propertyId, userId } = body.data

    const currentStaff = await requirePropertyStaff(event, propertyId)
    if (currentStaff.userId === userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ไม่สามารถนำตัวเองออกจากทีมได้'
      })
    }

    const [target] = await db
      .select()
      .from(schema.propertyStaff)
      .where(
        and(
          eq(schema.propertyStaff.userId, userId),
          eq(schema.propertyStaff.propertyId, propertyId)
        )
      )
      .limit(1)
    if (!target) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบทีมงานนี้ในหอพัก'
      })
    }
    if (target.role === Role.OWNER) {
      const owners = await db
        .select()
        .from(schema.propertyStaff)
        .where(
          and(
            eq(schema.propertyStaff.propertyId, propertyId),
            eq(schema.propertyStaff.role, Role.OWNER)
          )
        )
      if (owners.length <= 1) {
        throw createError({
          statusCode: 400,
          statusMessage: 'ห้ามลบ OWNER คนสุดท้ายของหอพัก'
        })
      }
    }

    await db
      .delete(schema.propertyStaff)
      .where(
        and(
          eq(schema.propertyStaff.userId, userId),
          eq(schema.propertyStaff.propertyId, propertyId)
        )
      )

    return successResponse(null, 'นำทีมงานออกจากหอพักสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
