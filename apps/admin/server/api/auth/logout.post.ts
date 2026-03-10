import { getCookie, deleteCookie } from 'h3'
import { eq, or } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'
import { SESSION_COOKIE_ADMIN, SESSION_COOKIE_CLIENT } from '~~/server/utils/auth-provider'

export default defineEventHandler(async (event) => {
  const tokenAdmin = getCookie(event, SESSION_COOKIE_ADMIN)
  const tokenClient = getCookie(event, SESSION_COOKIE_CLIENT)
  const tokens = [tokenAdmin, tokenClient].filter(Boolean) as string[]
  if (tokens.length > 0) {
    await db
      .delete(schema.session)
      .where(or(...tokens.map((t) => eq(schema.session.sessionToken, t))))
  }
  deleteCookie(event, SESSION_COOKIE_ADMIN, { path: '/' })
  deleteCookie(event, SESSION_COOKIE_CLIENT, { path: '/' })
  await clearUserSession(event)
  return { ok: true }
})
