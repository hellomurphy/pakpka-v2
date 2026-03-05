import { z } from 'zod'
import { eq, desc, inArray } from 'drizzle-orm'
import { InvoiceStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, (data) => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Property ID is required',
      })
    }
    const { propertyId } = query.data
    await requirePropertyStaff(event, propertyId)

    const runs = await db
      .select()
      .from(schema.billingRun)
      .where(eq(schema.billingRun.propertyId, propertyId))
      .orderBy(desc(schema.billingRun.period))

    const runIds = runs.map((r) => r.id)
    const invoices =
      runIds.length > 0
        ? await db.select().from(schema.invoice).where(inArray(schema.invoice.billingRunId, runIds))
        : []
    const invIds = invoices.map((i) => i.id)
    const meterCountRows =
      invIds.length > 0
        ? await db
            .select({ invoiceId: schema.meterReading.invoiceId })
            .from(schema.meterReading)
            .where(inArray(schema.meterReading.invoiceId, invIds))
        : []
    const meterCountByInv: Record<string, number> = {}
    for (const r of meterCountRows) {
      meterCountByInv[r.invoiceId] = (meterCountByInv[r.invoiceId] ?? 0) + 1
    }

    const formattedRuns = runs.map((run) => {
      const runInvoices = invoices.filter((inv) => inv.billingRunId === run.id)
      const paidInvoices = runInvoices.filter((inv) => inv.status === InvoiceStatus.PAID)
      const unpaidInvoices = runInvoices.filter(
        (inv) => inv.status === InvoiceStatus.UNPAID || inv.status === InvoiceStatus.OVERDUE,
      )
      const totalPaid = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0)
      const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0)
      const meterReadingCompletedCount = runInvoices.filter(
        (inv) => (meterCountByInv[inv.id] ?? 0) > 0,
      ).length

      return {
        id: run.id,
        period: run.period,
        status: run.status,
        totalInvoices: runInvoices.length,
        paidCount: paidInvoices.length,
        totalPaidAmount: totalPaid,
        totalUnpaidAmount: totalUnpaid,
        meterReadingRequired: run.meterReadingRequired,
        meterReadingCompletedCount,
      }
    })

    return successResponse(formattedRuns)
  } catch (error) {
    return errorResponse(event, error)
  }
})
