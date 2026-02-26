import { eq, and, inArray } from 'drizzle-orm'
import { ContractStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const roomId = event.context.params?.id
    if (!roomId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Room ID' })
    }

    const [room] = await db
      .select({ id: schema.room.id, propertyId: schema.room.propertyId })
      .from(schema.room)
      .where(eq(schema.room.id, roomId))
      .limit(1)
    if (!room) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบข้อมูลห้องพัก' })
    }
    await requirePropertyStaff(event, room.propertyId)

    const activeContracts = await db
      .select()
      .from(schema.contract)
      .where(
        and(
          eq(schema.contract.roomId, roomId),
          inArray(schema.contract.status, [ContractStatus.ACTIVE, ContractStatus.PENDING])
        )
      )
    if (activeContracts.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'ไม่สามารถลบห้องได้ เนื่องจากยังมีสัญญาที่กำลังใช้งานอยู่'
      })
    }

    const deleted = await db
      .delete(schema.room)
      .where(eq(schema.room.id, roomId))
      .returning()
    if (deleted.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบข้อมูลห้องพัก' })
    }

    event.node.res.statusCode = 204
    return
  } catch (error) {
    return errorResponse(event, error)
  }
})
