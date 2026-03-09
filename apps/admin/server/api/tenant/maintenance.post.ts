import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { Priority } from '@repo/db'
import { requireSession } from '~~/server/utils/auth'

const maintenanceSchema = z.object({
  contractId: z.string().min(1, 'รหัสสัญญาไม่ถูกต้อง'),
  roomId: z.string().min(1, 'รหัสห้องไม่ถูกต้อง'),
  title: z.string().min(1, 'หัวข้อต้องไม่เป็นค่าว่าง'),
  description: z.string().optional(),
  priority: z.enum(Object.values(Priority) as [string, ...string[]]).optional(),
  dueDate: z.iso.datetime({ message: 'รูปแบบวันที่ไม่ถูกต้อง' }).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)

    const body = await readValidatedBody(event, (data) => maintenanceSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.errors,
      })
    }
    const { contractId, roomId, title, description, priority, dueDate } = body.data

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

    const links = await db
      .select()
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.tenantId, tenantRow.id))
    const allowedContractIds = links.map((l: { contractId: string }) => l.contractId)
    if (!allowedContractIds.includes(contractId)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบสัญญานี้หรือคุณไม่มีสิทธิ์เข้าถึง',
      })
    }

    const [contractRow] = await db
      .select({
        id: schema.contract.id,
        status: schema.contract.status,
        roomId: schema.contract.roomId,
      })
      .from(schema.contract)
      .where(eq(schema.contract.id, contractId))
      .limit(1)
    if (!contractRow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบสัญญานี้หรือคุณไม่มีสิทธิ์เข้าถึง',
      })
    }
    if (contractRow.status !== 'ACTIVE') {
      throw createError({
        statusCode: 400,
        statusMessage: 'สัญญานี้ไม่ได้ใช้งานอยู่',
      })
    }
    if (contractRow.roomId !== roomId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ห้องนี้ไม่ตรงกับสัญญาของคุณ',
      })
    }

    const id = crypto.randomUUID()
    await db.insert(schema.maintenanceRequest).values({
      id,
      title,
      description: description ?? null,
      status: 'PENDING',
      priority: priority ?? 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      roomId,
      reportedByContractId: contractId,
    })

    const [roomRow] = await db
      .select({
        id: schema.room.id,
        roomNumber: schema.room.roomNumber,
        roomTypeId: schema.room.roomTypeId,
      })
      .from(schema.room)
      .where(eq(schema.room.id, roomId))
      .limit(1)
    const roomTypeRow = roomRow
      ? await db
          .select({ id: schema.roomType.id, name: schema.roomType.name })
          .from(schema.roomType)
          .where(eq(schema.roomType.id, roomRow.roomTypeId))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      : null
    const primaryLinks = await db
      .select({ tenantId: schema.contractTenant.tenantId })
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.contractId, contractId))
      .limit(1)
    const primaryTenantId = primaryLinks[0]?.tenantId
    const primaryTenant = primaryTenantId
      ? await db
          .select({ id: schema.tenant.id, name: schema.tenant.name })
          .from(schema.tenant)
          .where(eq(schema.tenant.id, primaryTenantId))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      : null

    const maintenanceRequest = {
      id,
      title,
      description: description ?? null,
      status: 'PENDING',
      priority: priority ?? 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      room: roomRow
        ? {
            id: roomRow.id,
            roomNumber: roomRow.roomNumber,
            roomType: roomTypeRow ? { id: roomTypeRow.id, name: roomTypeRow.name } : null,
          }
        : null,
      reportedByContract: {
        id: contractId,
        tenants: primaryTenant
          ? [{ tenant: { id: primaryTenant.id, name: primaryTenant.name } }]
          : [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return successResponse(maintenanceRequest, 'สร้างคำขอแจ้งซ่อมสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
