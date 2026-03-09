import dayjs from 'dayjs'
import { eq, and, inArray } from 'drizzle-orm'
import { InvoiceStatus, PaymentStatus, PaymentMethod } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    if (config.public.appMode !== 'demo') {
      throw createError({
        statusCode: 403,
        statusMessage: 'ฟีเจอร์นี้ใช้งานได้เฉพาะใน Demo Mode เท่านั้น',
      })
    }

    const body = await readBody(event)
    const propertyId = body?.propertyId
    if (!propertyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Property ID is required',
      })
    }
    await requirePropertyStaff(event, propertyId)

    const activeContracts = await db
      .select()
      .from(schema.contract)
      .where(and(eq(schema.contract.propertyId, propertyId), eq(schema.contract.status, 'ACTIVE')))
    if (activeContracts.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบสัญญาที่ Active อยู่เพื่อสร้างข้อมูลทดสอบ',
      })
    }

    const contractIds = activeContracts.map((c) => c.id)
    const primaryTenants = await db
      .select()
      .from(schema.contractTenant)
      .where(
        and(
          inArray(schema.contractTenant.contractId, contractIds),
          eq(schema.contractTenant.isPrimary, true),
        ),
      )
    const tenantIds = primaryTenants.map((pt) => pt.tenantId)
    const tenants = await db
      .select()
      .from(schema.tenant)
      .where(inArray(schema.tenant.id, tenantIds))
    const tenantMap = Object.fromEntries(tenants.map((t) => [t.id, t]))
    const tenantNameByContract: Record<string, string> = {}
    for (const pt of primaryTenants) {
      const t = tenantMap[pt.tenantId]
      tenantNameByContract[pt.contractId] = t?.name ?? 'ผู้เช่า'
    }

    const newPaymentsCount = Math.min(activeContracts.length, 3)
    let createdCount = 0

    for (let i = 0; i < newPaymentsCount; i++) {
      const randomContract = activeContracts[Math.floor(Math.random() * activeContracts.length)]
      const tenantName = tenantNameByContract[randomContract.id] ?? 'ผู้เช่า'
      const totalAmount = Number(randomContract.rentAmount) + Math.floor(Math.random() * 500 + 100)

      const invoiceId = crypto.randomUUID()
      const itemId = crypto.randomUUID()
      await db.insert(schema.invoice).values({
        id: invoiceId,
        propertyId,
        contractId: randomContract.id,
        period: dayjs().format('YYYY-MM'),
        dueDate: dayjs().add(5, 'day').toDate(),
        status: InvoiceStatus.UNPAID,
        totalAmount: String(totalAmount),
      })
      await db.insert(schema.invoiceItem).values({
        id: itemId,
        invoiceId,
        description: 'ค่าเช่าและบริการ (ทดสอบ)',
        amount: String(totalAmount),
      })

      const paymentAmount = totalAmount + (Math.random() > 0.7 ? 50 : 0)
      await db.insert(schema.payment).values({
        id: crypto.randomUUID(),
        invoiceId,
        amount: String(paymentAmount),
        status: PaymentStatus.PENDING,
        paymentDate: new Date(),
        paymentMethod: PaymentMethod.QR_PROMPTAY,
        slipUrl: `https://placehold.co/600x800/E2E8F0/475569?text=DEMO%5Cn${paymentAmount.toFixed(2)}%5Cn${encodeURIComponent(tenantName)}`,
      })
      createdCount++
    }

    return successResponse(null, `สร้างข้อมูลทดสอบ ${createdCount} รายการสำเร็จ`)
  } catch (error) {
    return errorResponse(event, error)
  }
})
