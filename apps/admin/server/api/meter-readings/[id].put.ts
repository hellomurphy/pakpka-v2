import { z } from 'zod'
import dayjs from 'dayjs'
import { eq, and, like } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const updateReadingSchema = z.object({
  readingValue: z.coerce.number().min(0),
})

export default defineEventHandler(async (event) => {
  try {
    const meterReadingId = event.context.params?.id
    if (!meterReadingId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Meter Reading ID' })
    }
    const body = await readValidatedBody(event, (data) => updateReadingSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }
    const newReadingValue = body.data.readingValue

    const [currentReading] = await db
      .select()
      .from(schema.meterReading)
      .where(eq(schema.meterReading.id, meterReadingId))
      .limit(1)
    if (!currentReading) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบข้อมูลมิเตอร์นี้' })
    }

    const [invoiceRow] = await db
      .select()
      .from(schema.invoice)
      .where(eq(schema.invoice.id, currentReading.invoiceId))
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
    const prevInvoices = await db
      .select({ id: schema.invoice.id })
      .from(schema.invoice)
      .where(
        and(
          eq(schema.invoice.contractId, contractRow.id),
          eq(schema.invoice.period, previousPeriod),
        ),
      )
    let oldValue = 0
    if (prevInvoices.length > 0) {
      const [prevReading] = await db
        .select()
        .from(schema.meterReading)
        .where(
          and(
            eq(schema.meterReading.invoiceId, prevInvoices[0].id),
            eq(schema.meterReading.utilityType, currentReading.utilityType),
          ),
        )
        .limit(1)
      if (prevReading) oldValue = Number(prevReading.readingValue)
    }

    if (newReadingValue < oldValue) {
      throw createError({
        statusCode: 400,
        statusMessage: `เลขมิเตอร์ใหม่ต้องไม่น้อยกว่าครั้งก่อน (${oldValue})`,
      })
    }

    await db.transaction(async (tx) => {
      await tx
        .update(schema.meterReading)
        .set({ readingValue: String(newReadingValue) })
        .where(eq(schema.meterReading.id, meterReadingId))

      const usage = newReadingValue - oldValue
      const rate =
        currentReading.utilityType === 'WATER'
          ? Number(contractRow.waterRate)
          : Number(contractRow.electricityRate)
      const minCharge =
        currentReading.utilityType === 'WATER'
          ? Number(contractRow.waterMinimumCharge)
          : Number(contractRow.electricityMinimumCharge)
      let cost = usage * rate
      if (cost < minCharge) cost = minCharge

      const descriptionPrefix = currentReading.utilityType === 'WATER' ? 'ค่าน้ำ' : 'ค่าไฟฟ้า'
      const prefixPattern = `${descriptionPrefix}%`
      const itemsToUpdate = await tx
        .select()
        .from(schema.invoiceItem)
        .where(
          and(
            eq(schema.invoiceItem.invoiceId, invoiceRow.id),
            like(schema.invoiceItem.description, prefixPattern),
          ),
        )
      for (const item of itemsToUpdate) {
        await tx
          .update(schema.invoiceItem)
          .set({
            description: `${descriptionPrefix} (${usage} หน่วย)`,
            amount: String(cost),
          })
          .where(eq(schema.invoiceItem.id, item.id))
      }

      const allItems = await tx
        .select()
        .from(schema.invoiceItem)
        .where(eq(schema.invoiceItem.invoiceId, invoiceRow.id))
      const newTotalAmount = allItems.reduce((sum, item) => sum + Number(item.amount), 0)
      await tx
        .update(schema.invoice)
        .set({ totalAmount: String(newTotalAmount) })
        .where(eq(schema.invoice.id, invoiceRow.id))
    })

    return successResponse(null, 'อัปเดตข้อมูลมิเตอร์สำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
