import dayjs from 'dayjs'
import { eq, and, lte, inArray } from 'drizzle-orm'
import { ContractStatus, InvoiceStatus, BillingRunStatus } from '@repo/db'
import { requirePropertyStaff, requireSession } from '~~/server/utils/auth'
import { canCreateBillingRun } from '~~/server/utils/billing-run-rules'
import { createBillingRunSchema } from '~~/server/utils/schemas/billing-run'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)
    const body = await readValidatedBody(event, (data) => createBillingRunSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten(),
      })
    }
    const { propertyId, period } = body.data

    const [staff] = await db
      .select()
      .from(schema.propertyStaff)
      .where(
        and(
          eq(schema.propertyStaff.userId, session.id),
          eq(schema.propertyStaff.propertyId, propertyId),
        ),
      )
      .limit(1)
    if (!staff || !canCreateBillingRun(staff.role)) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
    await requirePropertyStaff(event, propertyId)

    const newBillingRun = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(schema.billingRun)
        .where(
          and(eq(schema.billingRun.propertyId, propertyId), eq(schema.billingRun.period, period)),
        )
        .limit(1)
      if (existing) {
        throw createError({
          statusCode: 409,
          statusMessage: `รอบบิลสำหรับ ${period} ถูกสร้างไปแล้ว`,
        })
      }

      const [property] = await tx
        .select()
        .from(schema.property)
        .where(eq(schema.property.id, propertyId))
        .limit(1)
      if (!property) {
        throw createError({ statusCode: 404, statusMessage: 'ไม่พบ Property' })
      }

      const cutoffDate = dayjs(`${period}-${property.defaultBillingCutoffDay ?? 28}`)
        .endOf('day')
        .toDate()
      const activeContracts = await tx
        .select()
        .from(schema.contract)
        .where(
          and(
            eq(schema.contract.propertyId, propertyId),
            eq(schema.contract.status, ContractStatus.ACTIVE),
            lte(schema.contract.startDate, cutoffDate),
          ),
        )
      if (activeContracts.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'ไม่พบสัญญาที่ยัง Active อยู่เพื่อสร้างรอบบิล',
        })
      }

      const dueDate = dayjs(cutoffDate)
        .add(property.defaultPaymentDueDays ?? 7, 'day')
        .toDate()

      const runId = crypto.randomUUID()
      await tx.insert(schema.billingRun).values({
        id: runId,
        propertyId,
        period,
        status: BillingRunStatus.PENDING_METER_READING,
        executedById: session.id,
        totalContracts: activeContracts.length,
        meterReadingRequired: activeContracts.length,
      })

      const roomIds = activeContracts.map((c) => c.roomId)
      const rooms = await tx.select().from(schema.room).where(inArray(schema.room.id, roomIds))
      const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]))

      for (const contract of activeContracts) {
        const room = roomMap[contract.roomId]
        const invoiceId = crypto.randomUUID()
        const itemId = crypto.randomUUID()
        await tx.insert(schema.invoice).values({
          id: invoiceId,
          propertyId,
          contractId: contract.id,
          billingRunId: runId,
          period,
          status: InvoiceStatus.DRAFT,
          dueDate,
          totalAmount: contract.rentAmount,
        })
        await tx.insert(schema.invoiceItem).values({
          id: itemId,
          invoiceId,
          description: `ค่าเช่าห้อง ${room?.roomNumber ?? '-'}`,
          amount: contract.rentAmount,
        })
      }

      const [created] = await tx
        .select()
        .from(schema.billingRun)
        .where(eq(schema.billingRun.id, runId))
        .limit(1)
      return created!
    })

    return successResponse(newBillingRun, `สร้างรอบบิล ${period} สำเร็จ`)
  } catch (error: unknown) {
    return errorResponse(event, error)
  }
})
