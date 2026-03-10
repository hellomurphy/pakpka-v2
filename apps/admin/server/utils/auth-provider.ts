import type { H3Event } from 'h3'
import { getCookie, getHeader } from 'h3'
import { eq, and, gt } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

export const SESSION_COOKIE_ADMIN = 'session_token'
export const SESSION_COOKIE_CLIENT = 'session_token_client'

function isClientOrigin(event: H3Event): boolean {
  const origin = getHeader(event, 'origin')
  if (!origin) return false
  const allowedStr =
    process.env.ALLOWED_ORIGINS ??
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : '')
  const allowed = allowedStr
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  return allowed.some((o) => origin === o || origin === o.replace(/\/$/, ''))
}

/**
 * Resolve session from cookie and DB. Returns { id: userId } or null.
 * อ่าน cookie ตาม origin: ถ้า request มาจาก client (เช่น localhost:3002) ใช้ session_token_client
 * ถ้ามาจาก admin (localhost:3001) ใช้ session_token เพื่อให้ login dev แยกกันได้
 */
export async function getToken({
  event,
}: {
  event: H3Event
}): Promise<{ id: string; [key: string]: unknown } | null> {
  const fromClient = isClientOrigin(event)
  const cookieName = fromClient ? SESSION_COOKIE_CLIENT : SESSION_COOKIE_ADMIN
  const token =
    getCookie(event, cookieName) ??
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
