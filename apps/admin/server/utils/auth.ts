import type { H3Event } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'
import { getToken } from './auth-provider'

/**
 * Get current auth session from cookie/DB. Use in server routes only.
 */
export async function getAuthSession(event: H3Event) {
  return getToken({ event })
}

/**
 * Require session; throws 401 if not logged in.
 */
export async function requireSession(event: H3Event) {
  const session = await getAuthSession(event)
  if (!session?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session
}

/**
 * Check that the current user has staff access to the given property (Drizzle).
 * Throws 403 if not. Returns the staff row for optional use.
 */
export async function requirePropertyStaff(event: H3Event, propertyId: string) {
  const session = await requireSession(event)
  const staff = await db
    .select()
    .from(schema.propertyStaff)
    .where(
      and(
        eq(schema.propertyStaff.userId, session.id),
        eq(schema.propertyStaff.propertyId, propertyId)
      )
    )
    .limit(1)
    .then(rows => rows[0] ?? null)

  if (!staff) {
    throw createError({
      statusCode: 403,
      statusMessage: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้'
    })
  }
  return staff
}
