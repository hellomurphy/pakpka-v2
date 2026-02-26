import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { RoomStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const roomSchema = z.object({
  id: z.string(),
  roomNumber: z.string(),
  roomTypeId: z.string().min(1)
})
const floorSchema = z.object({
  id: z.string().min(1),
  floorNumber: z.number(),
  rooms: z.array(roomSchema)
})
const syncRoomsSchema = z.object({
  floors: z.array(floorSchema)
})

export default defineEventHandler(async (event) => {
  try {
    const propertyId = event.context.params?.id
    if (!propertyId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Property ID' })
    }
    const body = await readValidatedBody(event, data => syncRoomsSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }
    await requirePropertyStaff(event, propertyId)

    const { floors } = body.data

    await db.transaction(async (tx) => {
      const existingRooms = await tx
        .select({ id: schema.room.id, roomNumber: schema.room.roomNumber, status: schema.room.status })
        .from(schema.room)
        .where(eq(schema.room.propertyId, propertyId))

      const newRoomsFromRequest = floors.flatMap(f => f.rooms)
      const newRoomNumbers = new Set(newRoomsFromRequest.map(r => r.roomNumber))

      const roomsToDelete = existingRooms.filter(r => !newRoomNumbers.has(r.roomNumber))

      if (roomsToDelete.length > 0) {
        const protectedRooms = roomsToDelete.filter(
          room =>
            room.status !== RoomStatus.AVAILABLE &&
            room.status !== RoomStatus.CLEANING
        )
        if (protectedRooms.length > 0) {
          const protectedRoomNumbers = protectedRooms.map(r => r.roomNumber).join(', ')
          throw createError({
            statusCode: 409,
            statusMessage: `ไม่สามารถลบได้: ห้อง ${protectedRoomNumbers} กำลังมีการใช้งาน, ถูกจอง, หรืออยู่ระหว่างซ่อมบำรุง`
          })
        }
        const roomsToDeleteIds = roomsToDelete.map(r => r.id)
        await tx.delete(schema.room).where(inArray(schema.room.id, roomsToDeleteIds))
      }

      for (const floor of floors) {
        for (const room of floor.rooms) {
          const [existing] = await tx
            .select()
            .from(schema.room)
            .where(
              and(
                eq(schema.room.propertyId, propertyId),
                eq(schema.room.roomNumber, room.roomNumber)
              )
            )
            .limit(1)
          if (existing) {
            await tx
              .update(schema.room)
              .set({
                roomTypeId: room.roomTypeId,
                floorId: floor.id
              })
              .where(eq(schema.room.id, existing.id))
          } else {
            await tx.insert(schema.room).values({
              id: crypto.randomUUID(),
              propertyId,
              floorId: floor.id,
              roomNumber: room.roomNumber,
              roomTypeId: room.roomTypeId
            })
          }
        }
      }
    })

    return successResponse(null, 'อัปเดตโครงสร้างห้องพักสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
