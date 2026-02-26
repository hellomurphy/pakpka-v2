import { z } from 'zod'
import dayjs from 'dayjs'
import { eq, and, or } from 'drizzle-orm'
import { UtilityType, BillingType } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const readingSchema = z.object({
  newElec: z.number().min(0, 'เลขมิเตอร์ต้องไม่ติดลบ'),
  newWater: z.number().min(0, 'เลขมิเตอร์ต้องไม่ติดลบ')
})

export default defineEventHandler(async (event) => {
  try {
    const invoiceId = event.context.params?.id
    if (!invoiceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invoice ID is required'
      })
    }
    const body = await readValidatedBody(event, data => readingSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten()
      })
    }
    const { newElec, newWater } = body.data

    const [invoiceRow] = await db
      .select()
      .from(schema.invoice)
      .where(eq(schema.invoice.id, invoiceId))
      .limit(1)
    if (!invoiceRow) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบใบแจ้งหนี้' })
    }
    await requirePropertyStaff(event, invoiceRow.propertyId)

    const [contractRow] = await db
      .select()
      .from(schema.contract)
      .where(eq(schema.contract.id, invoiceRow.contractId))
      .limit(1)
    if (!contractRow) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบสัญญา' })
    }

    const previousPeriod = dayjs(invoiceRow.period).subtract(1, 'month').format('YYYY-MM')
    const [prevInvoice] = await db
      .select({ id: schema.invoice.id })
      .from(schema.invoice)
      .where(
        and(
          eq(schema.invoice.contractId, contractRow.id),
          eq(schema.invoice.period, previousPeriod)
        )
      )
      .limit(1)
    let oldElec = 0
    let oldWater = 0
    if (prevInvoice) {
      const prevReadings = await db
        .select()
        .from(schema.meterReading)
        .where(eq(schema.meterReading.invoiceId, prevInvoice.id))
      for (const r of prevReadings) {
        if (r.utilityType === UtilityType.ELECTRICITY) oldElec = Number(r.readingValue)
        if (r.utilityType === UtilityType.WATER) oldWater = Number(r.readingValue)
      }
    }

    const elecUnits = newElec - oldElec
    const waterUnits = newWater - oldWater
    const elecCost =
      contractRow.electricityBillingType === BillingType.PER_UNIT
        ? Math.max(
            elecUnits * Number(contractRow.electricityRate),
            Number(contractRow.electricityMinimumCharge)
          )
        : Number(contractRow.electricityRate)
    const waterCost =
      contractRow.waterBillingType === BillingType.PER_UNIT
        ? Math.max(
            waterUnits * Number(contractRow.waterRate),
            Number(contractRow.waterMinimumCharge)
          )
        : Number(contractRow.waterRate)

    await db.transaction(async (tx) => {
      const existingElec = await tx
        .select()
        .from(schema.meterReading)
        .where(
          and(
            eq(schema.meterReading.invoiceId, invoiceId),
            eq(schema.meterReading.utilityType, UtilityType.ELECTRICITY)
          )
        )
        .limit(1)
      if (existingElec.length > 0) {
        await tx
          .update(schema.meterReading)
          .set({ readingValue: String(newElec), readingDate: new Date() })
          .where(eq(schema.meterReading.id, existingElec[0].id))
      } else {
        await tx.insert(schema.meterReading).values({
          id: crypto.randomUUID(),
          invoiceId,
          utilityType: UtilityType.ELECTRICITY,
          readingValue: String(newElec),
          readingDate: new Date()
        })
      }

      const existingWater = await tx
        .select()
        .from(schema.meterReading)
        .where(
          and(
            eq(schema.meterReading.invoiceId, invoiceId),
            eq(schema.meterReading.utilityType, UtilityType.WATER)
          )
        )
        .limit(1)
      if (existingWater.length > 0) {
        await tx
          .update(schema.meterReading)
          .set({ readingValue: String(newWater), readingDate: new Date() })
          .where(eq(schema.meterReading.id, existingWater[0].id))
      } else {
        await tx.insert(schema.meterReading).values({
          id: crypto.randomUUID(),
          invoiceId,
          utilityType: UtilityType.WATER,
          readingValue: String(newWater),
          readingDate: new Date()
        })
      }

      const utilityItemIds = await tx
        .select({ id: schema.invoiceItem.id })
        .from(schema.invoiceItem)
        .where(
          and(
            eq(schema.invoiceItem.invoiceId, invoiceId),
            or(
              eq(schema.invoiceItem.description, 'ค่าไฟฟ้า'),
              eq(schema.invoiceItem.description, 'ค่าน้ำประปา')
            )
          )
        )
      for (const it of utilityItemIds) {
        await tx.delete(schema.invoiceItem).where(eq(schema.invoiceItem.id, it.id))
      }
      await tx.insert(schema.invoiceItem).values([
        {
          id: crypto.randomUUID(),
          invoiceId,
          description: 'ค่าไฟฟ้า',
          amount: String(elecCost)
        },
        {
          id: crypto.randomUUID(),
          invoiceId,
          description: 'ค่าน้ำประปา',
          amount: String(waterCost)
        }
      ])

      const allItems = await tx
        .select()
        .from(schema.invoiceItem)
        .where(eq(schema.invoiceItem.invoiceId, invoiceId))
      const newTotalAmount = allItems.reduce((sum, item) => sum + Number(item.amount), 0)
      await tx
        .update(schema.invoice)
        .set({ totalAmount: String(newTotalAmount) })
        .where(eq(schema.invoice.id, invoiceId))
    })

    const [updated] = await db
      .select()
      .from(schema.invoice)
      .where(eq(schema.invoice.id, invoiceId))
      .limit(1)
    return successResponse(updated ?? null, 'อัปเดตมิเตอร์สำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
