import { eq } from 'drizzle-orm'
import { setCookie } from 'h3'
import { db, schema } from '@nuxthub/db'

const SESSION_COOKIE_NAME = 'session_token'
const SESSION_MAX_AGE_DAYS = 30

export default defineEventHandler(async (event) => {
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Dev login is only available in development',
    })
  }

  const config = useRuntimeConfig(event)

  const devUserId = config.server?.devUserId as string | undefined
  let userRow:
    | {
        id: string
        name: string | null
        email: string | null
        image: string | null
        avatarUrl: string | null
      }
    | undefined

  if (devUserId) {
    const [u] = await db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        image: schema.user.image,
        avatarUrl: schema.user.avatarUrl,
      })
      .from(schema.user)
      .where(eq(schema.user.id, devUserId))
      .limit(1)
    userRow = u
  }

  if (!userRow) {
    const [first] = await db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        image: schema.user.image,
        avatarUrl: schema.user.avatarUrl,
      })
      .from(schema.user)
      .limit(1)
    userRow = first
  }

  if (!userRow) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No user found. Seed a user in the database first.',
    })
  }

  const sessionId = crypto.randomUUID()
  const sessionToken = crypto.randomUUID()
  const expires = new Date()
  expires.setDate(expires.getDate() + SESSION_MAX_AGE_DAYS)

  await db.insert(schema.session).values({
    id: sessionId,
    sessionToken,
    userId: userRow.id,
    expires,
  })

  setCookie(event, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    path: '/',
  })

  const userPayload = {
    id: userRow.id,
    name: userRow.name ?? undefined,
    email: userRow.email ?? undefined,
    image: userRow.image ?? userRow.avatarUrl ?? undefined,
  }
  await setUserSession(event, { user: userPayload })

  // Return JSON เหมือน credentials/LINE callback flow — client รับแล้วนำทางเอง (ใช้แค่ local dev)
  return { ok: true, user: userPayload }
})
