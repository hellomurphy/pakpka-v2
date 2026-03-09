import { z } from 'zod'
import { eq, and, or, sql, like, inArray } from 'drizzle-orm'
import { TenantStatus, ContractStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const querySchema = z.object({
  propertyId: z.string().min(1, 'รหัส Property ไม่ถูกต้อง'),
  status: z.enum(Object.values(TenantStatus) as [string, ...string[]]).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(15),
})

function formatTenantRow(row: {
  id: string
  name: string
  phone: string | null
  status: string | null
  propertyId: string
  contractId: string | null
  roomId: string | null
  roomNumber: string | null
  rentAmount: string | null
  contractEndDate: Date | null
}) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    status: row.status,
    propertyId: row.propertyId,
    roomNumber: row.roomNumber ?? 'N/A',
    rentAmount: row.rentAmount,
    contractEndDate: row.contractEndDate,
    activeContract: row.contractId
      ? {
          id: row.contractId,
          rentAmount: row.rentAmount,
          endDate: row.contractEndDate,
          room: { id: row.roomId, roomNumber: row.roomNumber },
        }
      : null,
  }
}

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, (data) => querySchema.safeParse(data))
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูล Query ไม่ถูกต้อง',
      })
    }
    const { propertyId, status, q, page, limit } = query.data

    await requirePropertyStaff(event, propertyId)

    const offset = (page - 1) * limit
    const searchTerm = q ? `%${q}%` : null

    const baseConditions = [eq(schema.tenant.propertyId, propertyId)]
    if (status) baseConditions.push(eq(schema.tenant.status, status))

    const tenantsQuery = db
      .select({
        id: schema.tenant.id,
        name: schema.tenant.name,
        phone: schema.tenant.phone,
        status: schema.tenant.status,
        propertyId: schema.tenant.propertyId,
        contractId: schema.contract.id,
        roomId: schema.room.id,
        roomNumber: schema.room.roomNumber,
        rentAmount: schema.contract.rentAmount,
        contractEndDate: schema.contract.endDate,
      })
      .from(schema.tenant)
      .leftJoin(schema.contractTenant, eq(schema.contractTenant.tenantId, schema.tenant.id))
      .leftJoin(
        schema.contract,
        and(
          eq(schema.contract.id, schema.contractTenant.contractId),
          inArray(schema.contract.status, [ContractStatus.ACTIVE, ContractStatus.PENDING]),
        ),
      )
      .leftJoin(schema.room, eq(schema.room.id, schema.contract.roomId))
      .where(
        searchTerm
          ? and(
              ...baseConditions,
              or(
                like(schema.tenant.name, searchTerm),
                like(schema.tenant.phone, searchTerm),
                like(schema.room.roomNumber, searchTerm),
              ),
            )
          : and(...baseConditions),
      )
      .orderBy(schema.room.roomNumber)
      .limit(limit)
      .offset(offset)

    const [countResult, countByStatusRows, rawTenants] = await Promise.all([
      db
        .select({ count: sql<number>`COUNT(DISTINCT ${schema.tenant.id})` })
        .from(schema.tenant)
        .leftJoin(schema.contractTenant, eq(schema.contractTenant.tenantId, schema.tenant.id))
        .leftJoin(schema.contract, eq(schema.contract.id, schema.contractTenant.contractId))
        .leftJoin(schema.room, eq(schema.room.id, schema.contract.roomId))
        .where(
          searchTerm
            ? and(
                ...baseConditions,
                or(
                  like(schema.tenant.name, searchTerm),
                  like(schema.tenant.phone, searchTerm),
                  like(schema.room.roomNumber, searchTerm),
                ),
              )
            : and(...baseConditions),
        ),
      db
        .select({
          status: schema.tenant.status,
          count: sql<number>`COUNT(*)`,
        })
        .from(schema.tenant)
        .where(eq(schema.tenant.propertyId, propertyId))
        .groupBy(schema.tenant.status),
      tenantsQuery,
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const formattedCounts = Object.values(TenantStatus).reduce(
      (acc: Record<TenantStatus, number>, s) => {
        acc[s] = Number(
          countByStatusRows.find((r: { status: string | null }) => r.status === s)?.count ?? 0,
        )
        return acc
      },
      {} as Record<TenantStatus, number>,
    )

    type TenantRow = (typeof rawTenants)[number]
    const deduped = rawTenants.reduce((acc: TenantRow[], row: TenantRow) => {
      if (!acc.some((r: TenantRow) => r.id === row.id)) acc.push(row)
      return acc
    }, [] as TenantRow[])
    const formattedData = deduped.map(formatTenantRow)

    return successResponse(
      { tenants: formattedData, total, counts: formattedCounts },
      'ดึงข้อมูลผู้เช่าสำเร็จ',
    )
  } catch (error) {
    return errorResponse(event, error)
  }
})
