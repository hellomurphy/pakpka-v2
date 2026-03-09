import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { PaymentMethod } from '@repo/db'
import { requireSession } from '~~/server/utils/auth'

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'รหัสใบแจ้งหนี้ไม่ถูกต้อง'),
  amount: z.number().positive('จำนวนเงินต้องมากกว่า 0'),
  paymentDate: z.iso.datetime({ message: 'รูปแบบวันที่ไม่ถูกต้อง' }),
  paymentMethod: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
  receivingAccountId: z.string().optional(),
  slipUrl: z.string().url('URL ของสลิปไม่ถูกต้อง').optional(),
  notes: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)

    const body = await readValidatedBody(event, (data) => paymentSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.errors,
      })
    }
    const { invoiceId, amount, paymentDate, paymentMethod, receivingAccountId, slipUrl, notes } =
      body.data

    const [tenantRow] = await db
      .select({ id: schema.tenant.id })
      .from(schema.tenant)
      .where(eq(schema.tenant.userId, session.id))
      .limit(1)
    if (!tenantRow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบข้อมูลผู้เช่า',
      })
    }

    const contractIdsForTenant = await db
      .select({ contractId: schema.contractTenant.contractId })
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.tenantId, tenantRow.id))
    const cIds = contractIdsForTenant.map((r: { contractId: string }) => r.contractId)

    const [invoiceRow] = await db
      .select({
        id: schema.invoice.id,
        status: schema.invoice.status,
        totalAmount: schema.invoice.totalAmount,
        propertyId: schema.invoice.propertyId,
        period: schema.invoice.period,
        dueDate: schema.invoice.dueDate,
        contractId: schema.invoice.contractId,
      })
      .from(schema.invoice)
      .where(eq(schema.invoice.id, invoiceId))
      .limit(1)
    if (!invoiceRow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบใบแจ้งหนี้นี้หรือคุณไม่มีสิทธิ์เข้าถึง',
      })
    }
    if (!cIds.includes(invoiceRow.contractId)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบใบแจ้งหนี้นี้หรือคุณไม่มีสิทธิ์เข้าถึง',
      })
    }
    if (invoiceRow.status === 'PAID') {
      throw createError({
        statusCode: 400,
        statusMessage: 'ใบแจ้งหนี้นี้ชำระเงินแล้ว',
      })
    }
    if (invoiceRow.status === 'CANCELLED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'ใบแจ้งหนี้นี้ถูกยกเลิกแล้ว',
      })
    }

    if (receivingAccountId) {
      const [ra] = await db
        .select()
        .from(schema.receivingAccount)
        .where(
          and(
            eq(schema.receivingAccount.id, receivingAccountId),
            eq(schema.receivingAccount.propertyId, invoiceRow.propertyId),
            eq(schema.receivingAccount.isActive, true),
          ),
        )
        .limit(1)
      if (!ra) {
        throw createError({
          statusCode: 404,
          statusMessage: 'ไม่พบบัญชีรับเงินนี้หรือบัญชีไม่ใช้งานอยู่',
        })
      }
    }

    const paymentId = crypto.randomUUID()
    await db.insert(schema.payment).values({
      id: paymentId,
      invoiceId,
      amount: String(amount),
      paymentDate: new Date(paymentDate),
      paymentMethod,
      receivingAccountId: receivingAccountId ?? null,
      slipUrl: slipUrl ?? null,
      notes: notes ?? null,
      status: 'PENDING',
    })

    const [roomRow] = await db
      .select({ roomNumber: schema.room.roomNumber })
      .from(schema.room)
      .innerJoin(schema.contract, eq(schema.contract.roomId, schema.room.id))
      .where(eq(schema.contract.id, invoiceRow.contractId))
      .limit(1)

    const payment = {
      id: paymentId,
      amount,
      paymentDate: new Date(paymentDate),
      paymentMethod,
      status: 'PENDING',
      slipUrl: slipUrl ?? null,
      notes: notes ?? null,
      createdAt: new Date(),
      invoice: {
        id: invoiceRow.id,
        period: invoiceRow.period,
        totalAmount: invoiceRow.totalAmount,
        dueDate: invoiceRow.dueDate,
        status: invoiceRow.status,
        contract: {
          room: roomRow ? { roomNumber: roomRow.roomNumber } : null,
        },
      },
    }

    return successResponse(payment, 'ส่งหลักฐานการชำระเงินสำเร็จ รอการตรวจสอบ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
