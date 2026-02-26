import { z } from 'zod'
import { eq, and, lte, gte, inArray } from 'drizzle-orm'
import {
  TenantStatus,
  ContractStatus,
  BillingType,
  RoomStatus,
  ReservationStatus
} from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const waitingListSchema = z.object({
  status: z.literal(TenantStatus.WAITING_LIST),
  propertyId: z.string().min(1),
  tenantName: z.string().trim().min(1, 'ต้องระบุชื่อผู้เช่า'),
  tenantPhone: z
    .string()
    .regex(/^0[0-9]{8,9}$/, 'เบอร์โทรไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
  desiredRoomTypeId: z.string().optional()
})

const createContractSchema = z.object({
  status: z.union([
    z.literal(TenantStatus.ACTIVE),
    z.literal(TenantStatus.UPCOMING)
  ]),
  propertyId: z.string().min(1),
  tenantName: z.string().min(1, 'ต้องระบุชื่อผู้เช่า'),
  tenantPhone: z
    .string()
    .regex(/^0[0-9]{8,9}$/, 'เบอร์โทรไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
  roomId: z.string().min(1, 'ต้องระบุห้อง'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  rentAmount: z.coerce.number().positive('ค่าเช่าต้องเป็นตัวเลขบวก'),
  depositAmount: z.coerce.number().min(0, 'ค่ามัดจำต้องไม่ติดลบ'),
  waterBillingType: z.enum(Object.values(BillingType) as [string, ...string[]]),
  waterRate: z.coerce.number().min(0),
  waterMinimumCharge: z.coerce.number().min(0).default(0),
  electricityBillingType: z.enum(Object.values(BillingType) as [string, ...string[]]),
  electricityRate: z.coerce.number().min(0),
  electricityMinimumCharge: z.coerce.number().min(0).default(0),
  services: z
    .array(
      z.object({
        serviceId: z.string().min(1),
        price: z.coerce.number().min(0),
        name: z.string(),
        isOptional: z.boolean()
      })
    )
    .optional()
})

const tenantCreationSchema = z.union([waitingListSchema, createContractSchema])

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, data =>
      tenantCreationSchema.safeParse(data)
    )
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten()
      })
    }
    const data = body.data

    await requirePropertyStaff(event, data.propertyId)

    if (data.status === TenantStatus.WAITING_LIST) {
      const id = crypto.randomUUID()
      const [newTenant] = await db
        .insert(schema.tenant)
        .values({
          id,
          name: data.tenantName,
          phone: data.tenantPhone || null,
          status: data.status,
          propertyId: data.propertyId
        })
        .returning()
      return successResponse(newTenant, 'เพิ่มผู้เช่าใน Waiting List สำเร็จ')
    }

    const newTenantInContract = await db.transaction(async (tx: typeof db) => {
      const [room] = await tx
        .select()
        .from(schema.room)
        .where(eq(schema.room.id, data.roomId))
        .limit(1)
      if (!room) {
        throw createError({
          statusCode: 404,
          statusMessage: 'ไม่พบห้องพักนี้'
        })
      }

      const overlappingContracts = await tx
        .select()
        .from(schema.contract)
        .where(
          and(
            eq(schema.contract.roomId, data.roomId),
            inArray(schema.contract.status, [
              ContractStatus.ACTIVE,
              ContractStatus.PENDING
            ]),
            and(
              lte(schema.contract.startDate, data.endDate),
              gte(schema.contract.endDate, data.startDate)
            )
          )
        )
      if (overlappingContracts.length > 0) {
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
            inArray(schema.reservation.status, [
              ReservationStatus.PENDING,
              ReservationStatus.CONFIRMED
            ]),
            and(
              lte(schema.reservation.startDate, data.endDate),
              gte(schema.reservation.endDate, data.startDate)
            )
          )
        )
      if (overlappingReservations.length > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: 'ช่วงเวลาที่เลือกทับซ้อนกับการจองห้องที่มีอยู่แล้ว'
        })
      }

      const tenantId = crypto.randomUUID()
      await tx.insert(schema.tenant).values({
        id: tenantId,
        name: data.tenantName,
        phone: data.tenantPhone || null,
        status: data.status,
        propertyId: data.propertyId
      })

      const contractId = crypto.randomUUID()
      const rentAmountStr = String(data.rentAmount)
      await tx.insert(schema.contract).values({
        id: contractId,
        startDate: data.startDate,
        endDate: data.endDate,
        rentAmount: rentAmountStr,
        status: ContractStatus.ACTIVE,
        roomId: data.roomId,
        propertyId: data.propertyId,
        waterBillingType: data.waterBillingType,
        waterRate: String(data.waterRate),
        waterMinimumCharge: String(data.waterMinimumCharge),
        electricityBillingType: data.electricityBillingType,
        electricityRate: String(data.electricityRate),
        electricityMinimumCharge: String(data.electricityMinimumCharge)
      })

      if (data.services?.length) {
        for (const svc of data.services) {
          await tx.insert(schema.contractService).values({
            id: crypto.randomUUID(),
            contractId,
            serviceId: svc.serviceId,
            startDate: data.startDate,
            customPrice: String(svc.price)
          })
        }
      }

      await tx.insert(schema.contractTenant).values({
        contractId,
        tenantId,
        isPrimary: true
      })

      if (data.depositAmount > 0) {
        await tx.insert(schema.deposit).values({
          id: crypto.randomUUID(),
          contractId,
          amount: String(data.depositAmount),
          receivedDate: new Date()
        })
      }

      if (room.status === RoomStatus.AVAILABLE) {
        const newRoomStatus
          = data.status === TenantStatus.UPCOMING
            ? RoomStatus.RESERVED
            : RoomStatus.OCCUPIED
        await tx
          .update(schema.room)
          .set({ status: newRoomStatus })
          .where(eq(schema.room.id, data.roomId))
      }

      const [tenant] = await tx
        .select()
        .from(schema.tenant)
        .where(eq(schema.tenant.id, tenantId))
        .limit(1)
      return tenant
    })

    return successResponse(
      newTenantInContract,
      'สร้างสัญญาและเพิ่มผู้เช่าใหม่สำเร็จ'
    )
  } catch (error) {
    return errorResponse(event, error)
  }
})
