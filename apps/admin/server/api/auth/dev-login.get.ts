import { eq } from 'drizzle-orm'
import { setCookie, getHeader } from 'h3'
import { db, schema } from '@nuxthub/db'

const SESSION_COOKIE_ADMIN = 'session_token'
const SESSION_COOKIE_CLIENT = 'session_token_client'
const SESSION_MAX_AGE_DAYS = 30

function isClientOrigin(event: { node: { req: { headers: { origin?: string } } } }): boolean {
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

export default defineEventHandler(async (event) => {
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Dev login is only available in development',
    })
  }

  const fromClient = isClientOrigin(event)
  const cookieName = fromClient ? SESSION_COOKIE_CLIENT : SESSION_COOKIE_ADMIN

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
    if (fromClient) {
      // Client: เลือก user ที่มี tenant (ผู้เช่า)
      const [userWithTenant] = await db
        .select({
          id: schema.user.id,
          name: schema.user.name,
          email: schema.user.email,
          image: schema.user.image,
          avatarUrl: schema.user.avatarUrl,
        })
        .from(schema.user)
        .innerJoin(schema.tenant, eq(schema.tenant.userId, schema.user.id))
        .limit(1)
      userRow = userWithTenant
    } else {
      // Admin: เลือก user ที่มี property_staff (เจ้าหน้าที่/เจ้าของ) ก่อน ไม่งั้น user แรก
      const [staffUser] = await db
        .select({
          id: schema.user.id,
          name: schema.user.name,
          email: schema.user.email,
          image: schema.user.image,
          avatarUrl: schema.user.avatarUrl,
        })
        .from(schema.user)
        .innerJoin(schema.propertyStaff, eq(schema.propertyStaff.userId, schema.user.id))
        .limit(1)
      userRow = staffUser
    }
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

  setCookie(event, cookieName, sessionToken, {
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

  return { ok: true, user: userPayload }
})
