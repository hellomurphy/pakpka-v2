import { z } from 'zod'
import { eq, inArray, and, lte, gte, desc } from 'drizzle-orm'
import { InvoiceStatus, MaintenanceStatus, ContractStatus } from '@repo/db'
import { requireSession } from '~~/server/utils/auth'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)

    const query = await getValidatedQuery(event, data => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูล Query ไม่ถูกต้อง'
      })
    }
    const { page, limit } = query.data

    const [tenantRow] = await db
      .select({ id: schema.tenant.id })
      .from(schema.tenant)
      .where(eq(schema.tenant.userId, session.id))
      .limit(1)
    if (!tenantRow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบข้อมูลผู้เช่า'
      })
    }

    const links = await db
      .select({ contractId: schema.contractTenant.contractId })
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.tenantId, tenantRow.id))
    const contractIds = links.map((l: { contractId: string }) => l.contractId)
    if (contractIds.length === 0) {
      return successResponse(
        {
          notifications: [],
          total: 0,
          page,
          limit,
          unreadCount: 0
        },
        'ดึงข้อมูลการแจ้งเตือนสำเร็จ'
      )
    }

    const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    const now = new Date()

    const [unpaidInvoices, overdueInvoices, pendingPayments, maintenanceRows, upcomingContracts] = await Promise.all([
      db
        .select({
          id: schema.invoice.id,
          period: schema.invoice.period,
          totalAmount: schema.invoice.totalAmount,
          dueDate: schema.invoice.dueDate,
          createdAt: schema.invoice.createdAt,
          contractId: schema.invoice.contractId
        })
        .from(schema.invoice)
        .where(
          and(
            inArray(schema.invoice.contractId, contractIds),
            eq(schema.invoice.status, InvoiceStatus.UNPAID)
          )
        )
        .orderBy(schema.invoice.dueDate)
        .limit(10),
      db
        .select({
          id: schema.invoice.id,
          period: schema.invoice.period,
          totalAmount: schema.invoice.totalAmount,
          dueDate: schema.invoice.dueDate,
          createdAt: schema.invoice.createdAt,
          contractId: schema.invoice.contractId
        })
        .from(schema.invoice)
        .where(
          and(
            inArray(schema.invoice.contractId, contractIds),
            eq(schema.invoice.status, InvoiceStatus.OVERDUE)
          )
        )
        .orderBy(schema.invoice.dueDate)
        .limit(10),
      db
        .select({
          id: schema.payment.id,
          amount: schema.payment.amount,
          createdAt: schema.payment.createdAt,
          invoiceId: schema.payment.invoiceId
        })
        .from(schema.payment)
        .innerJoin(schema.invoice, eq(schema.invoice.id, schema.payment.invoiceId))
        .where(
          and(
            inArray(schema.invoice.contractId, contractIds),
            eq(schema.payment.status, 'PENDING')
          )
        )
        .orderBy(desc(schema.payment.createdAt))
        .limit(10),
      db
        .select({
          id: schema.maintenanceRequest.id,
          title: schema.maintenanceRequest.title,
          status: schema.maintenanceRequest.status,
          priority: schema.maintenanceRequest.priority,
          updatedAt: schema.maintenanceRequest.updatedAt,
          roomId: schema.maintenanceRequest.roomId
        })
        .from(schema.maintenanceRequest)
        .where(
          and(
            inArray(schema.maintenanceRequest.reportedByContractId, contractIds),
            inArray(schema.maintenanceRequest.status, [MaintenanceStatus.PENDING, MaintenanceStatus.IN_PROGRESS])
          )
        )
        .orderBy(desc(schema.maintenanceRequest.updatedAt))
        .limit(10),
      db
        .select({
          id: schema.contract.id,
          endDate: schema.contract.endDate,
          roomId: schema.contract.roomId
        })
        .from(schema.contract)
        .where(
          and(
            inArray(schema.contract.id, contractIds),
            eq(schema.contract.status, ContractStatus.ACTIVE),
            lte(schema.contract.endDate, sixtyDaysFromNow),
            gte(schema.contract.endDate, now)
          )
        )
        .orderBy(schema.contract.endDate)
        .limit(5)
    ])

    const contractRoomRows = await db
      .select({ id: schema.contract.id, roomId: schema.contract.roomId })
      .from(schema.contract)
      .where(inArray(schema.contract.id, contractIds))
    const contractToRoomId: Record<string, string> = Object.fromEntries(contractRoomRows.map(c => [c.id, c.roomId]))
    const roomIds = [
      ...new Set([
        ...Object.values(contractToRoomId),
        ...maintenanceRows.map(m => m.roomId),
        ...upcomingContracts.map(c => c.roomId)
      ])
    ]
    const roomRows = roomIds.length > 0
      ? await db.select({ id: schema.room.id, roomNumber: schema.room.roomNumber }).from(schema.room).where(inArray(schema.room.id, roomIds))
      : []
    const roomMap: Record<string, { roomNumber: string }> = Object.fromEntries(roomRows.map(r => [r.id, r]))

    const invIdsForPayments = pendingPayments.map(p => p.invoiceId)
    const invForPayment = invIdsForPayments.length > 0
      ? await db.select({ id: schema.invoice.id, period: schema.invoice.period, contractId: schema.invoice.contractId }).from(schema.invoice).where(inArray(schema.invoice.id, invIdsForPayments))
      : []
    const invPaymentMap = Object.fromEntries(invForPayment.map(i => [i.id, i]))

    const notifications: {
      id: string
      type: string
      title: string
      message: string
      data: Record<string, unknown>
      createdAt: Date
      isRead: boolean
      priority?: string
    }[] = []

    for (const inv of unpaidInvoices) {
      const roomId = contractToRoomId[inv.contractId]
      const roomNumber = roomId ? (roomMap[roomId]?.roomNumber ?? '') : ''
      notifications.push({
        id: `invoice-unpaid-${inv.id}`,
        type: 'INVOICE_UNPAID',
        title: 'ใบแจ้งหนี้ค้างชำระ',
        message: `มีใบแจ้งหนี้ห้อง ${roomNumber} ประจำเดือน ${inv.period} ยังไม่ได้ชำระ`,
        data: {
          invoiceId: inv.id,
          period: inv.period,
          amount: inv.totalAmount,
          dueDate: inv.dueDate,
          roomNumber
        },
        createdAt: inv.createdAt,
        isRead: false
      })
    }
    for (const inv of overdueInvoices) {
      const roomId = contractToRoomId[inv.contractId]
      const roomNumber = roomId ? (roomMap[roomId]?.roomNumber ?? '') : ''
      notifications.push({
        id: `invoice-overdue-${inv.id}`,
        type: 'INVOICE_OVERDUE',
        title: '⚠️ ใบแจ้งหนี้เลยกำหนดชำระ',
        message: `ใบแจ้งหนี้ห้อง ${roomNumber} ประจำเดือน ${inv.period} เลยกำหนดชำระแล้ว`,
        data: {
          invoiceId: inv.id,
          period: inv.period,
          amount: inv.totalAmount,
          dueDate: inv.dueDate,
          roomNumber
        },
        createdAt: inv.createdAt,
        isRead: false,
        priority: 'HIGH'
      })
    }
    for (const p of pendingPayments) {
      const inv = invPaymentMap[p.invoiceId]
      const roomId = inv ? contractToRoomId[inv.contractId] : null
      const roomNumber = roomId ? (roomMap[roomId]?.roomNumber ?? '') : ''
      const period = inv?.period ?? ''
      notifications.push({
        id: `payment-pending-${p.id}`,
        type: 'PAYMENT_PENDING',
        title: 'รอการตรวจสอบการชำระเงิน',
        message: `การชำระเงินห้อง ${roomNumber} ประจำเดือน ${period} อยู่ระหว่างการตรวจสอบ`,
        data: {
          paymentId: p.id,
          amount: p.amount,
          period,
          roomNumber
        },
        createdAt: p.createdAt,
        isRead: false
      })
    }
    for (const m of maintenanceRows) {
      const room = roomMap[m.roomId]
      const roomNumber = room?.roomNumber ?? ''
      notifications.push({
        id: `maintenance-${m.id}`,
        type: 'MAINTENANCE_UPDATE',
        title: 'อัปเดตการแจ้งซ่อม',
        message: `การแจ้งซ่อม "${m.title}" ห้อง ${roomNumber} สถานะ: ${m.status}`,
        data: {
          maintenanceId: m.id,
          title: m.title,
          status: m.status,
          priority: m.priority,
          roomNumber
        },
        createdAt: m.updatedAt,
        isRead: false,
        priority: (m.priority as string) || 'MEDIUM'
      })
    }
    for (const c of upcomingContracts) {
      const room = roomMap[c.roomId]
      const roomNumber = room?.roomNumber ?? ''
      const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      notifications.push({
        id: `contract-ending-${c.id}`,
        type: 'CONTRACT_ENDING_SOON',
        title: 'สัญญาใกล้หมดอายุ',
        message: `สัญญาเช่าห้อง ${roomNumber} จะสิ้นสุดในอีก ${daysLeft} วัน`,
        data: {
          contractId: c.id,
          endDate: c.endDate,
          daysLeft,
          roomNumber
        },
        createdAt: now,
        isRead: false,
        priority: daysLeft <= 30 ? 'HIGH' : 'MEDIUM'
      })
    }

    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const startIndex = (page - 1) * limit
    const paginatedNotifications = notifications.slice(startIndex, startIndex + limit)

    return successResponse(
      {
        notifications: paginatedNotifications,
        total: notifications.length,
        page,
        limit,
        unreadCount: notifications.filter(n => !n.isRead).length
      },
      'ดึงข้อมูลการแจ้งเตือนสำเร็จ'
    )
  } catch (error) {
    return errorResponse(event, error)
  }
})
