import { z } from 'zod'
import { eq, and, lte, gte, inArray } from 'drizzle-orm'
import { ReservationStatus, RoomStatus, ContractStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'
import { hasOverlappingDateRanges } from '~~/server/utils/date-overlap'

const createReservationSchema = z.object({
  propertyId: z.string().min(1),
  roomId: z.string().min(1),
  tenantId: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, data => createReservationSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }
    const data = body.data
    await requirePropertyStaff(event, data.propertyId)

    await db.transaction(async (tx) => {
      const [room] = await tx.select().from(schema.room).where(eq(schema.room.id, data.roomId)).limit(1)
      if (!room) {
        throw createError({ statusCode: 404, statusMessage: 'ไม่พบห้องพักนี้' })
      }

      const overlappingContracts = await tx
        .select()
        .from(schema.contract)
        .where(
          and(
            eq(schema.contract.roomId, data.roomId),
            inArray(schema.contract.status, [ContractStatus.ACTIVE, ContractStatus.PENDING]),
            and(
              lte(schema.contract.startDate, data.endDate),
              gte(schema.contract.endDate, data.startDate)
            )
          )
        )
      if (hasOverlappingDateRanges(data.startDate, data.endDate, overlappingContracts)) {
        throw createError({
          statusCode: 409,
          statusMessage: 'ช่วงเวลาที่เลือกทับซ้อนกับสัญญาที่มีอยู่แล้ว'
        })
      }

      const overlappingReservations = await tx
        .select()
        .from(schema.reservation)
        .where(
          and(
            eq(schema.reservation.roomId, data.roomId),
            inArray(schema.reservation.status, [ReservationStatus.PENDING, ReservationStatus.CONFIRMED]),
            and(
              lte(schema.reservation.startDate, data.endDate),
              gte(schema.reservation.endDate, data.startDate)
            )
          )
        )
      if (hasOverlappingDateRanges(data.startDate, data.endDate, overlappingReservations)) {
        throw createError({
          statusCode: 409,
          statusMessage: 'ช่วงเวลาที่เลือกทับซ้อนกับการจองห้องที่มีอยู่แล้ว'
        })
      }

      const id = crypto.randomUUID()
      await tx.insert(schema.reservation).values({
        id,
        propertyId: data.propertyId,
        roomId: data.roomId,
        tenantId: data.tenantId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: ReservationStatus.CONFIRMED
      })

      if (room.status === RoomStatus.AVAILABLE) {
        await tx
          .update(schema.room)
          .set({ status: RoomStatus.RESERVED })
          .where(eq(schema.room.id, data.roomId))
      }
    })

    return successResponse(null, 'สร้างการจองสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
