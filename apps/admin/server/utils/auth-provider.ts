import type { H3Event } from 'h3'
import { getCookie } from 'h3'
import { eq, and, gt } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

const SESSION_COOKIE_NAME = 'session_token'

/**
 * Resolve session from cookie and DB. Returns { id: userId } or null.
 * Used by getAuthSession in auth.ts so we don't depend on unresolved #auth.
 */
export async function getToken({
  event,
}: {
  event: H3Event
}): Promise<{ id: string; [key: string]: unknown } | null> {
  const token =
    getCookie(event, SESSION_COOKIE_NAME) ??
    getHeader(event, 'authorization')
      ?.replace(/^Bearer\s+/i, '')
      .trim()
  if (!token) return null

  const [row] = await db
    .select({ userId: schema.session.userId, expires: schema.session.expires })
    .from(schema.session)
    .where(and(eq(schema.session.sessionToken, token), gt(schema.session.expires, new Date())))
    .limit(1)

  if (!row) return null
  return { id: row.userId }
}
