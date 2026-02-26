import { eq } from 'drizzle-orm'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireSession(event)
    const userId = session.id

    const [user] = await db
      .select({
        id: schema.user.id,
        email: schema.user.email,
        username: schema.user.username,
        name: schema.user.name,
        image: schema.user.image
      })
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1)

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const properties = await db
      .select({
        id: schema.property.id,
        name: schema.property.name,
        roomNamingFormat: schema.property.roomNamingFormat,
        roomTurnoverDays: schema.property.roomTurnoverDays,
        contractEndingSoonDays: schema.property.contractEndingSoonDays,
        defaultWaterBillingType: schema.property.defaultWaterBillingType,
        defaultWaterRate: schema.property.defaultWaterRate,
        defaultWaterMinimumCharge: schema.property.defaultWaterMinimumCharge,
        defaultElectricityBillingType: schema.property.defaultElectricityBillingType,
        defaultElectricityRate: schema.property.defaultElectricityRate,
        defaultElectricityMinimumCharge: schema.property.defaultElectricityMinimumCharge,
        defaultBillingCutoffDay: schema.property.defaultBillingCutoffDay,
        defaultPaymentDueDays: schema.property.defaultPaymentDueDays,
        lateFeeEnabled: schema.property.lateFeeEnabled,
        lateFeeType: schema.property.lateFeeType,
        lateFeeValue: schema.property.lateFeeValue
      })
      .from(schema.property)
      .innerJoin(schema.propertyStaff, eq(schema.propertyStaff.propertyId, schema.property.id))
      .where(eq(schema.propertyStaff.userId, userId))

    return {
      properties,
      hasProperties: properties.length > 0
    }
  } catch (error) {
    return errorResponse(event, error)
  }
})
