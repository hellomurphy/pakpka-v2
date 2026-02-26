import { eq, or } from 'drizzle-orm'
import { setCookie } from 'h3'
import { db, schema } from '@nuxthub/db'
import { readValidatedBody } from 'h3'
import { z } from 'zod'

const SESSION_COOKIE_NAME = 'session_token'
const SESSION_MAX_AGE_DAYS = 30

const bodySchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1)
})

/**
 * Demo/credentials login. Validates username or email + password and creates session.
 * For production, use proper password hashing (e.g. bcrypt).
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const isDemo = (config.public as { appMode?: string })?.appMode === 'demo'
  if (!isDemo && !config.dev) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Credentials login is only available in demo or development'
    })
  }

  const body = await readValidatedBody(event, bodySchema)
  const login = body.login.trim().toLowerCase()

  const [userRow] = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      image: schema.user.image,
      avatarUrl: schema.user.avatarUrl,
      password: schema.user.password
    })
    .from(schema.user)
    .where(
      or(
        eq(schema.user.username, login),
        eq(schema.user.email, login)
      )
    )
    .limit(1)

  if (!userRow) {
    throw createError({
      statusCode: 401,
      statusMessage: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    })
  }

  const storedPassword = userRow.password ?? ''
  if (!storedPassword || storedPassword !== body.password) {
    throw createError({
      statusCode: 401,
      statusMessage: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
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
    expires
  })

  setCookie(event, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: !config.dev,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    path: '/'
  })

  await setUserSession(event, {
    user: {
      id: userRow.id,
      name: userRow.name ?? undefined,
      email: userRow.email ?? undefined,
      image: userRow.image ?? userRow.avatarUrl ?? undefined
    }
  })

  return { ok: true }
})
