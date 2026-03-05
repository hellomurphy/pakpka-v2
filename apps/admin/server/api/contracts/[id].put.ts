import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { ContractStatus, TenantStatus } from '@repo/db'
import { requirePropertyStaff } from '~~/server/utils/auth'

const updateContractSchema = z.object({
  endDate: z.coerce.date().optional(),
  rentAmount: z.coerce.number().positive().optional(),
  status: z.enum(Object.values(ContractStatus) as [string, ...string[]]).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const contractId = event.context.params?.id
    if (!contractId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ต้องระบุ Contract ID',
      })
    }
    const body = await readValidatedBody(event, (data) => updateContractSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten(),
      })
    }

    const [existing] = await db
      .select({ propertyId: schema.contract.propertyId })
      .from(schema.contract)
      .where(eq(schema.contract.id, contractId))
      .limit(1)
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบสัญญานี้' })
    }
    await requirePropertyStaff(event, existing.propertyId)

    const updates: Record<string, unknown> = {}
    if (body.data.endDate !== undefined) updates.endDate = body.data.endDate
    if (body.data.rentAmount !== undefined) updates.rentAmount = String(body.data.rentAmount)
    if (body.data.status !== undefined) updates.status = body.data.status

    const [updated] = await db
      .update(schema.contract)
      .set(updates)
      .where(eq(schema.contract.id, contractId))
      .returning()
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบสัญญานี้' })
    }

    const primaryTenants = await db
      .select()
      .from(schema.contractTenant)
      .where(
        and(
          eq(schema.contractTenant.contractId, contractId),
          eq(schema.contractTenant.isPrimary, true),
        ),
      )
    const primaryTenantId = primaryTenants[0]?.tenantId
    if (primaryTenantId && body.data.status === ContractStatus.ACTIVE) {
      const [tenant] = await db
        .select({ status: schema.tenant.status })
        .from(schema.tenant)
        .where(eq(schema.tenant.id, primaryTenantId))
        .limit(1)
      if (tenant?.status === TenantStatus.NOTICE_GIVEN) {
        await db
          .update(schema.tenant)
          .set({ status: TenantStatus.ACTIVE })
          .where(eq(schema.tenant.id, primaryTenantId))
      }
    }

    const tenantRows = await db
      .select()
      .from(schema.contractTenant)
      .where(eq(schema.contractTenant.contractId, contractId))
    const tenantIds = tenantRows.map((ct) => ct.tenantId)
    const tenants =
      tenantIds.length > 0
        ? await db.select().from(schema.tenant).where(inArray(schema.tenant.id, tenantIds))
        : []
    const updatedContract = {
      ...updated,
      tenants: tenantRows
        .map((ct) => ({
          isPrimary: ct.isPrimary,
          tenant: tenants.find((t) => t.id === ct.tenantId) ?? null,
        }))
        .filter((t) => t.tenant),
    }

    return successResponse(updatedContract, 'อัปเดตสัญญาสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
