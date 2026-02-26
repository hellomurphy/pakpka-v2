import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { ContractStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const updateFloorsSchema = z.object({
  totalFloors: z.number().int().min(1)
})

export default defineEventHandler(async (event) => {
  try {
    const propertyId = event.context.params?.id
    if (!propertyId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Property ID' })
    }
    const body = await readValidatedBody(event, data => updateFloorsSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }
    await requirePropertyStaff(event, propertyId)

    const { totalFloors } = body.data

    const currentFloors = await db
      .select()
      .from(schema.floor)
      .where(eq(schema.floor.propertyId, propertyId))
      .orderBy(schema.floor.floorNumber)
    const currentFloorCount = currentFloors.length

    if (totalFloors > currentFloorCount) {
      for (let i = 0; i < totalFloors - currentFloorCount; i++) {
        const floorNumber = currentFloorCount + i + 1
        await db.insert(schema.floor).values({
          id: crypto.randomUUID(),
          name: `ชั้น ${floorNumber}`,
          floorNumber,
          propertyId
        })
      }
    } else if (totalFloors < currentFloorCount) {
      const floorsToRemove = currentFloors.filter(f => f.floorNumber > totalFloors)
      const floorIdsToRemove = floorsToRemove.map(f => f.id)
      if (floorIdsToRemove.length > 0) {
        const roomsOnFloors = await db
          .select()
          .from(schema.room)
          .where(inArray(schema.room.floorId, floorIdsToRemove))
        const roomIdsOnFloors = roomsOnFloors.map(r => r.id)
        const activeOnFloors =
          roomIdsOnFloors.length > 0
            ? await db
                .select()
                .from(schema.contract)
                .where(
                  and(
                    inArray(schema.contract.roomId, roomIdsOnFloors),
                    eq(schema.contract.status, ContractStatus.ACTIVE)
                  )
                )
                .limit(1)
            : []
        if (activeOnFloors.length > 0) {
          throw createError({
            statusCode: 409,
            statusMessage: 'ไม่สามารถลดจำนวนชั้นได้'
          })
        }
        await db.delete(schema.floor).where(inArray(schema.floor.id, floorIdsToRemove))
      }
    }

    return successResponse(null, 'อัปเดตโครงสร้างชั้นสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
