import { z } from 'zod'
import dayjs from 'dayjs'
import { Role } from '@repo/db'
import { requirePropertyStaff, requireSession } from '~~/server/utils/auth'

const inviteSchema = z.object({
  propertyId: z.string().min(1),
  nameForReference: z.string().min(1),
  role: z.enum([Role.ADMIN, Role.STAFF]),
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)
    const body = await readValidatedBody(event, (data) => inviteSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, data: body.error.flatten() })
    }
    await requirePropertyStaff(event, body.data.propertyId)

    const id = crypto.randomUUID()
    const [newInvitation] = await db
      .insert(schema.invitation)
      .values({
        id,
        propertyId: body.data.propertyId,
        nameForReference: body.data.nameForReference,
        role: body.data.role,
        invitedById: session.id,
        expiresAt: dayjs().add(7, 'day').toDate(),
      })
      .returning()
    if (!newInvitation)
      throw createError({ statusCode: 500, statusMessage: 'สร้างคำเชิญไม่สำเร็จ' })

    return successResponse(newInvitation, 'สร้างคำเชิญสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
