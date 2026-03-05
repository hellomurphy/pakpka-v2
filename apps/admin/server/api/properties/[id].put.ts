import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { RoomNameFormat, BillingType, LateFeeType } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const propertySettingsSchema = z.object({
  name: z.string().min(1).optional(),
  roomNamingFormat: z.enum(Object.values(RoomNameFormat) as [string, ...string[]]).optional(),
  roomTurnoverDays: z.number().int().min(0).optional(),
  defaultWaterBillingType: z.enum(Object.values(BillingType) as [string, ...string[]]).optional(),
  defaultWaterRate: z.coerce.number().optional(),
  defaultWaterMinimumCharge: z.coerce.number().optional(),
  defaultElectricityBillingType: z
    .enum(Object.values(BillingType) as [string, ...string[]])
    .optional(),
  defaultElectricityRate: z.coerce.number().optional(),
  defaultElectricityMinimumCharge: z.coerce.number().optional(),
  lateFeeEnabled: z.boolean().optional(),
  lateFeeType: z.enum(Object.values(LateFeeType) as [string, ...string[]]).optional(),
  lateFeeValue: z.coerce.number().optional(),
  defaultBillingCutoffDay: z.number().int().min(1).max(28).optional(),
  defaultPaymentDueDays: z.number().int().min(1).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const propertyId = event.context.params?.id
    if (!propertyId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Property ID' })
    }
    const body = await readValidatedBody(event, (data) => propertySettingsSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }
    await requirePropertyStaff(event, propertyId)

    const updates: Record<string, unknown> = {}
    if (body.data.name !== undefined) updates.name = body.data.name
    if (body.data.roomNamingFormat !== undefined)
      updates.roomNamingFormat = body.data.roomNamingFormat
    if (body.data.roomTurnoverDays !== undefined)
      updates.roomTurnoverDays = body.data.roomTurnoverDays
    if (body.data.defaultWaterBillingType !== undefined)
      updates.defaultWaterBillingType = body.data.defaultWaterBillingType
    if (body.data.defaultWaterRate !== undefined)
      updates.defaultWaterRate = String(body.data.defaultWaterRate)
    if (body.data.defaultWaterMinimumCharge !== undefined)
      updates.defaultWaterMinimumCharge = String(body.data.defaultWaterMinimumCharge)
    if (body.data.defaultElectricityBillingType !== undefined)
      updates.defaultElectricityBillingType = body.data.defaultElectricityBillingType
    if (body.data.defaultElectricityRate !== undefined)
      updates.defaultElectricityRate = String(body.data.defaultElectricityRate)
    if (body.data.defaultElectricityMinimumCharge !== undefined)
      updates.defaultElectricityMinimumCharge = String(body.data.defaultElectricityMinimumCharge)
    if (body.data.lateFeeEnabled !== undefined) updates.lateFeeEnabled = body.data.lateFeeEnabled
    if (body.data.lateFeeType !== undefined) updates.lateFeeType = body.data.lateFeeType
    if (body.data.lateFeeValue !== undefined) updates.lateFeeValue = String(body.data.lateFeeValue)
    if (body.data.defaultBillingCutoffDay !== undefined)
      updates.defaultBillingCutoffDay = body.data.defaultBillingCutoffDay
    if (body.data.defaultPaymentDueDays !== undefined)
      updates.defaultPaymentDueDays = body.data.defaultPaymentDueDays

    const [updated] = await db
      .update(schema.property)
      .set(updates)
      .where(eq(schema.property.id, propertyId))
      .returning()
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบ Property' })
    }

    return successResponse(updated, 'บันทึกการตั้งค่าสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
