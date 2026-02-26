import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { InvoiceStatus, BillingRunStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const bodySchema = z.object({
  invoiceIds: z.array(z.string()).optional()
})

export default defineEventHandler(async (event) => {
  try {
    const runId = event.context.params?.id
    if (!runId) {
      throw createError({ statusCode: 400, statusMessage: 'Billing Run ID is required' })
    }

    const body = await readBody(event)
    const validatedBody = bodySchema.safeParse(body)
    const invoiceIdsToSend = validatedBody.success ? validatedBody.data?.invoiceIds : undefined

    const [billingRun] = await db
      .select({ propertyId: schema.billingRun.propertyId })
      .from(schema.billingRun)
      .where(eq(schema.billingRun.id, runId))
      .limit(1)
    if (!billingRun) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบรอบบิล' })
    }
    await requirePropertyStaff(event, billingRun.propertyId)

    let invoicesToSend = await db
      .select()
      .from(schema.invoice)
      .where(
        and(
          eq(schema.invoice.billingRunId, runId),
          eq(schema.invoice.status, InvoiceStatus.DRAFT)
        )
      )
    if (invoiceIdsToSend && invoiceIdsToSend.length > 0) {
      invoicesToSend = invoicesToSend.filter(inv => invoiceIdsToSend!.includes(inv.id))
    }

    if (invoicesToSend.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ไม่มีใบแจ้งหนี้ที่พร้อมส่ง'
      })
    }

    const idsToUpdate = invoicesToSend.map(inv => inv.id)
    await db.transaction(async (tx) => {
      for (const id of idsToUpdate) {
        await tx
          .update(schema.invoice)
          .set({ status: InvoiceStatus.UNPAID })
          .where(eq(schema.invoice.id, id))
      }
      const remainingDrafts = await tx
        .select()
        .from(schema.invoice)
        .where(
          and(
            eq(schema.invoice.billingRunId, runId),
            eq(schema.invoice.status, InvoiceStatus.DRAFT)
          )
        )
      if (remainingDrafts.length === 0) {
        await tx
          .update(schema.billingRun)
          .set({ status: BillingRunStatus.COMPLETED })
          .where(eq(schema.billingRun.id, runId))
      }
    })

    const contractIds = invoicesToSend.map(i => i.contractId)
    const primaryTenants = await db
      .select()
      .from(schema.contractTenant)
      .where(
        and(
          inArray(schema.contractTenant.contractId, contractIds),
          eq(schema.contractTenant.isPrimary, true)
        )
      )
    const tenantIds = primaryTenants.map(pt => pt.tenantId)
    const tenants = tenantIds.length > 0
      ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
      : []
    const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t]))

    for (const invoice of invoicesToSend) {
      const pt = primaryTenants.find(x => {
        const inv = invoicesToSend.find(i => i.contractId === x.contractId)
        return inv?.id === invoice.id
      })
      const tenant = pt ? tenantMap[pt.tenantId] : null
      if (tenant) {
        console.log(`
          ========================================
          [SIMULATING LINE NOTIFICATION]
          To: ${tenant.name}
          Message: "ใบแจ้งหนี้รอบบิล ${invoice.period} ออกแล้ว ยอดชำระ ${invoice.totalAmount} บาท"
          Link: /invoices/${invoice.id}
          ========================================
        `)
      }
    }

    return successResponse(
      { sentCount: invoicesToSend.length },
      `ส่งใบแจ้งหนี้ ${invoicesToSend.length} ฉบับสำเร็จ`
    )
  } catch (error) {
    return errorResponse(event, error)
  }
})
