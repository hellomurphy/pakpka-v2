import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { Role } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'
import { canChangeStaffRole } from '~~/server/utils/staff-rules'

const updateRoleSchema = z.object({
  propertyId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum([Role.ADMIN, Role.STAFF])
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, data => updateRoleSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, data: body.error.flatten() })
    }
    const { propertyId, userId, role } = body.data

    const staff = await requirePropertyStaff(event, propertyId)
    if (!canChangeStaffRole(staff.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'เฉพาะ OWNER ของหอพักเท่านั้นที่เปลี่ยน Role ได้'
      })
    }

    const [updated] = await db
      .update(schema.propertyStaff)
      .set({ role })
      .where(
        and(
          eq(schema.propertyStaff.userId, userId),
          eq(schema.propertyStaff.propertyId, propertyId)
        )
      )
      .returning()
    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบทีมงานนี้ในหอพัก'
      })
    }

    return successResponse(updated, 'อัปเดต Role สำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
