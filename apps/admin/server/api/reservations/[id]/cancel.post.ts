import { eq } from 'drizzle-orm'
import { ReservationStatus, RoomStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const reservationId = event.context.params?.id
    if (!reservationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Reservation ID',
      })
    }

    const [reservation] = await db
      .select({
        id: schema.reservation.id,
        status: schema.reservation.status,
        roomId: schema.reservation.roomId,
        propertyId: schema.reservation.propertyId,
      })
      .from(schema.reservation)
      .where(eq(schema.reservation.id, reservationId))
      .limit(1)
    if (!reservation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบข้อมูลการจองที่ต้องการยกเลิก',
      })
    }
    await requirePropertyStaff(event, reservation.propertyId)

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw createError({
        statusCode: 409,
        statusMessage: 'การจองนี้ถูกยกเลิกไปแล้ว',
      })
    }

    const [updated] = await db
      .update(schema.reservation)
      .set({ status: ReservationStatus.CANCELLED })
      .where(eq(schema.reservation.id, reservationId))
      .returning()
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบข้อมูลการจอง' })
    }

    await db
      .update(schema.room)
      .set({ status: RoomStatus.AVAILABLE })
      .where(eq(schema.room.id, reservation.roomId))

    return successResponse(updated, 'ยกเลิกการจองสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
