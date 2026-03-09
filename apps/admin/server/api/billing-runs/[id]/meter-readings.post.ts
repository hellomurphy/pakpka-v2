import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { InvoiceStatus, BillingRunStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const readingSchema = z.object({
  invoiceId: z.string().min(1),
  newElec: z.coerce.number().min(0),
  newWater: z.coerce.number().min(0),
  oldElec: z.coerce.number(),
  oldWater: z.coerce.number(),
})
const saveReadingsSchema = z.object({
  readings: z.array(readingSchema),
})

export default defineEventHandler(async (event) => {
  try {
    const runId = event.context.params?.id
    if (!runId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Billing Run ID' })
    }
    const body = await readValidatedBody(event, (data) => saveReadingsSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }
    const { readings } = body.data

    const [run] = await db
      .select({ propertyId: schema.billingRun.propertyId })
      .from(schema.billingRun)
      .where(eq(schema.billingRun.id, runId))
      .limit(1)
    if (!run) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบรอบบิลนี้' })
    }
    await requirePropertyStaff(event, run.propertyId)

    await db.transaction(async (tx) => {
      for (const reading of readings) {
        const [inv] = await tx
          .select()
          .from(schema.invoice)
          .where(eq(schema.invoice.id, reading.invoiceId))
          .limit(1)
        if (!inv) continue
        const [contract] = await tx
          .select()
          .from(schema.contract)
          .where(eq(schema.contract.id, inv.contractId))
          .limit(1)
        if (!contract) continue

        const existingElec = await tx
          .select()
          .from(schema.meterReading)
          .where(
            and(
              eq(schema.meterReading.invoiceId, reading.invoiceId),
              eq(schema.meterReading.utilityType, 'ELECTRICITY'),
            ),
          )
          .limit(1)
        const existingWater = await tx
          .select()
          .from(schema.meterReading)
          .where(
            and(
              eq(schema.meterReading.invoiceId, reading.invoiceId),
              eq(schema.meterReading.utilityType, 'WATER'),
            ),
          )
          .limit(1)

        if (existingElec.length === 0) {
          await tx.insert(schema.meterReading).values({
            id: crypto.randomUUID(),
            invoiceId: reading.invoiceId,
            utilityType: 'ELECTRICITY',
            readingValue: String(reading.newElec),
            readingDate: new Date(),
          })
        } else {
          await tx
            .update(schema.meterReading)
            .set({ readingValue: String(reading.newElec), readingDate: new Date() })
            .where(eq(schema.meterReading.id, existingElec[0].id))
        }
        if (existingWater.length === 0) {
          await tx.insert(schema.meterReading).values({
            id: crypto.randomUUID(),
            invoiceId: reading.invoiceId,
            utilityType: 'WATER',
            readingValue: String(reading.newWater),
            readingDate: new Date(),
          })
        } else {
          await tx
            .update(schema.meterReading)
            .set({ readingValue: String(reading.newWater), readingDate: new Date() })
            .where(eq(schema.meterReading.id, existingWater[0].id))
        }

        const elecUsage = reading.newElec - reading.oldElec
        let elecCost = elecUsage * Number(contract.electricityRate)
        if (elecCost < Number(contract.electricityMinimumCharge)) {
          elecCost = Number(contract.electricityMinimumCharge)
        }
        const waterUsage = reading.newWater - reading.oldWater
        let waterCost = waterUsage * Number(contract.waterRate)
        if (waterCost < Number(contract.waterMinimumCharge)) {
          waterCost = Number(contract.waterMinimumCharge)
        }

        await tx.insert(schema.invoiceItem).values({
          id: crypto.randomUUID(),
          invoiceId: reading.invoiceId,
          description: `ค่าไฟฟ้า (${elecUsage} หน่วย)`,
          amount: String(elecCost),
        })
        await tx.insert(schema.invoiceItem).values({
          id: crypto.randomUUID(),
          invoiceId: reading.invoiceId,
          description: `ค่าน้ำ (${waterUsage} หน่วย)`,
          amount: String(waterCost),
        })

        const allItems = await tx
          .select()
          .from(schema.invoiceItem)
          .where(eq(schema.invoiceItem.invoiceId, reading.invoiceId))
        const totalAmount = allItems.reduce((sum, item) => sum + Number(item.amount), 0)
        await tx
          .update(schema.invoice)
          .set({
            totalAmount: String(totalAmount),
            status: InvoiceStatus.UNPAID,
          })
          .where(eq(schema.invoice.id, reading.invoiceId))
      }

      const remainingDrafts = await tx
        .select()
        .from(schema.invoice)
        .where(
          and(
            eq(schema.invoice.billingRunId, runId),
            eq(schema.invoice.status, InvoiceStatus.DRAFT),
          ),
        )
      if (remainingDrafts.length === 0) {
        await tx
          .update(schema.billingRun)
          .set({ status: BillingRunStatus.PENDING_REVIEW })
          .where(eq(schema.billingRun.id, runId))
      }
    })

    return successResponse(null, 'บันทึกข้อมูลมิเตอร์และคำนวณบิลสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
