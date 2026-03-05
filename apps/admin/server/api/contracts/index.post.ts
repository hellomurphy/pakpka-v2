import dayjs from 'dayjs'
import { eq, and, lte, gte, inArray } from 'drizzle-orm'
import { BillingType, ContractStatus, TenantStatus, RoomStatus, ReservationStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'
import { hasOverlappingDateRanges } from '~~/server/utils/date-overlap'
import { createContractSchema } from '~~/server/utils/schemas/contract'

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, data => createContractSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten()
      })
    }
    const data = body.data
    await requirePropertyStaff(event, data.propertyId)

    const newContract = await db.transaction(async (tx) => {
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

      const contractId = crypto.randomUUID()
      await tx.insert(schema.contract).values({
        id: contractId,
        propertyId: data.propertyId,
        roomId: data.roomId,
        startDate: data.startDate,
        endDate: data.endDate,
        rentAmount: String(data.rentAmount),
        status: ContractStatus.ACTIVE,
        waterBillingType: data.waterBillingType,
        waterRate: String(data.waterRate),
        waterMinimumCharge: String(data.waterMinimumCharge),
        electricityBillingType: data.electricityBillingType,
        electricityRate: String(data.electricityRate),
        electricityMinimumCharge: String(data.electricityMinimumCharge)
      })

      await tx.insert(schema.contractTenant).values({
        contractId,
        tenantId: data.tenantId,
        isPrimary: true
      })

      const newTenantStatus = dayjs(data.startDate).isAfter(dayjs(), 'day')
        ? TenantStatus.UPCOMING
        : TenantStatus.ACTIVE
      await tx
        .update(schema.tenant)
        .set({ status: newTenantStatus })
        .where(eq(schema.tenant.id, data.tenantId))

      if (room.status === RoomStatus.AVAILABLE) {
        const newRoomStatus =
          newTenantStatus === TenantStatus.UPCOMING ? RoomStatus.RESERVED : RoomStatus.OCCUPIED
        await tx
          .update(schema.room)
          .set({ status: newRoomStatus })
          .where(eq(schema.room.id, data.roomId))
      }

      if (data.depositAmount > 0) {
        await tx.insert(schema.deposit).values({
          id: crypto.randomUUID(),
          contractId,
          amount: String(data.depositAmount),
          receivedDate: new Date()
        })
      }

      const [created] = await tx
        .select()
        .from(schema.contract)
        .where(eq(schema.contract.id, contractId))
        .limit(1)
      return created!
    })

    return successResponse(newContract, 'สร้างสัญญาสำหรับผู้เช่าสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
