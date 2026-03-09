import { eq, inArray } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const runId = event.context.params?.id
    if (!runId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ ID ของรอบบิล',
      })
    }

    const [billingRun] = await db
      .select()
      .from(schema.billingRun)
      .where(eq(schema.billingRun.id, runId))
      .limit(1)
    if (!billingRun) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบรอบบิลนี้' })
    }
    await requirePropertyStaff(event, billingRun.propertyId)

    const invoices = await db
      .select({ id: schema.invoice.id })
      .from(schema.invoice)
      .where(eq(schema.invoice.billingRunId, runId))
    const invIds = invoices.map((i) => i.id)
    const meterReadings =
      invIds.length > 0
        ? await db
            .select({ invoiceId: schema.meterReading.invoiceId })
            .from(schema.meterReading)
            .where(inArray(schema.meterReading.invoiceId, invIds))
        : []
    const invoicesWithMeterCount = new Set(meterReadings.map((mr) => mr.invoiceId)).size

    const responseData = {
      id: billingRun.id,
      period: billingRun.period,
      status: billingRun.status,
      totalContracts: billingRun.totalContracts,
      meterReadingRequired: billingRun.meterReadingRequired,
      propertyId: billingRun.propertyId,
      executedById: billingRun.executedById,
      createdAt: billingRun.createdAt,
      meterReadingCompletedCount: invoicesWithMeterCount,
      automatedInvoices: billingRun.totalContracts - billingRun.meterReadingRequired,
    }

    return successResponse(responseData)
  } catch (error) {
    return errorResponse(event, error)
  }
})
