import { getCookie, deleteCookie } from 'h3'
import { eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

const SESSION_COOKIE_NAME = 'session_token'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE_NAME)
  if (token) {
    await db
      .delete(schema.session)
      .where(eq(schema.session.sessionToken, token))
    deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
  }
  await clearUserSession(event)
  return { ok: true }
})
