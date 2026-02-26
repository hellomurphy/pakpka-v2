import { z } from 'zod'
import dayjs from 'dayjs'
import { eq, and, or, lte, gte, like, inArray, sql, asc } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  propertyId: z.string().min(1, 'รหัส Property ไม่ถูกต้อง'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(),
  filter: z.enum(['active', 'ending_soon', 'expired', 'all']).optional().default('active')
})

function formatContractRow(row: {
  id: string
  roomId: string
  propertyId: string
  rentAmount: string
  startDate: Date
  endDate: Date
  status: string | null
  roomNumber: string
  tenantName: string | null
}) {
  return {
    id: row.id,
    roomId: row.roomId,
    propertyId: row.propertyId,
    rentAmount: row.rentAmount,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    room: { roomNumber: row.roomNumber },
    tenants: row.tenantName ? [{ tenant: { name: row.tenantName } }] : []
  }
}

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, data => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid query parameters'
      })
    }
    const { propertyId, page, limit, q, filter } = query.data
    await requirePropertyStaff(event, propertyId)

    const today = dayjs().startOf('day').toDate()
    const conditions = [eq(schema.contract.propertyId, propertyId)]

    if (filter === 'active') {
      conditions.push(eq(schema.contract.status, 'ACTIVE'))
      conditions.push(gte(schema.contract.endDate, today))
    } else if (filter === 'ending_soon') {
      const [prop] = await db
        .select({ contractEndingSoonDays: schema.property.contractEndingSoonDays })
        .from(schema.property)
        .where(eq(schema.property.id, propertyId))
        .limit(1)
      const days = prop?.contractEndingSoonDays ?? 60
      const endingSoonDate = dayjs().add(days, 'day').endOf('day').toDate()
      conditions.push(eq(schema.contract.status, 'ACTIVE'))
      conditions.push(gte(schema.contract.endDate, today))
      conditions.push(lte(schema.contract.endDate, endingSoonDate))
    } else if (filter === 'expired') {
      conditions.push(inArray(schema.contract.status, ['EXPIRED', 'TERMINATED']))
    }

    const baseWhere = conditions.length > 1 ? and(...conditions) : conditions[0]
    const searchTerm = q?.trim()
    const searchCondition = searchTerm
      ? and(
          baseWhere,
          or(
            like(schema.room.roomNumber, `%${searchTerm}%`),
            like(schema.tenant.name, `%${searchTerm}%`)
          )
        )
      : baseWhere

    const offset = (page - 1) * limit

    const rows = await db
      .select({
        id: schema.contract.id,
        roomId: schema.contract.roomId,
        propertyId: schema.contract.propertyId,
        rentAmount: schema.contract.rentAmount,
        startDate: schema.contract.startDate,
        endDate: schema.contract.endDate,
        status: schema.contract.status,
        roomNumber: schema.room.roomNumber,
        tenantName: schema.tenant.name
      })
      .from(schema.contract)
      .innerJoin(schema.room, eq(schema.room.id, schema.contract.roomId))
      .leftJoin(
        schema.contractTenant,
        and(
          eq(schema.contractTenant.contractId, schema.contract.id),
          eq(schema.contractTenant.isPrimary, true)
        )
      )
      .leftJoin(schema.tenant, eq(schema.tenant.id, schema.contractTenant.tenantId))
      .where(searchCondition)
      .orderBy(asc(schema.contract.endDate))
      .limit(limit)
      .offset(offset)

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.contract)
      .innerJoin(schema.room, eq(schema.room.id, schema.contract.roomId))
      .leftJoin(
        schema.contractTenant,
        and(
          eq(schema.contractTenant.contractId, schema.contract.id),
          eq(schema.contractTenant.isPrimary, true)
        )
      )
      .leftJoin(schema.tenant, eq(schema.tenant.id, schema.contractTenant.tenantId))
      .where(searchCondition)

    const contracts = rows.map(formatContractRow)
    const totalCount = Number(countRow?.count ?? 0)

    return successResponse({ contracts, total: totalCount })
  } catch (error) {
    return errorResponse(event, error)
  }
})
