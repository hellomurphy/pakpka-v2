import { eq, and } from 'drizzle-orm'
import { getCookie, setCookie, deleteCookie } from 'h3'
import { db, schema } from '@nuxthub/db'

const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token'
const LINE_PROFILE_URL = 'https://api.line.me/v2/profile'
const STATE_COOKIE_NAME = 'line_oauth_state'
const SESSION_COOKIE_NAME = 'session_token'
const SESSION_MAX_AGE_DAYS = 30
const LINE_PROVIDER = 'line'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const errorCode = query.error as string | undefined
  const errorDesc = query.error_description as string | undefined

  if (errorCode) {
    deleteCookie(event, STATE_COOKIE_NAME, { path: '/' })
    throw createError({
      statusCode: 400,
      statusMessage: errorDesc ?? errorCode ?? 'LINE login failed',
    })
  }

  const code = query.code as string | undefined
  const state = query.state as string | undefined
  if (!code || !state) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing code or state from LINE callback',
    })
  }

  const savedState = getCookie(event, STATE_COOKIE_NAME)
  deleteCookie(event, STATE_COOKIE_NAME, { path: '/' })
  if (!savedState || savedState !== state) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid state; possible CSRF. Try logging in again.',
    })
  }

  const channelId = config.lineChannelId
  const channelSecret = config.lineChannelSecret
  let callbackUrl = config.lineCallbackUrl
  if (!callbackUrl) {
    const url = getRequestURL(event)
    callbackUrl = `${url.origin}/api/auth/line/callback`
  }

  if (!channelId || !channelSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'LINE Login is not configured.',
    })
  }

  const tokenBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: callbackUrl,
    client_id: channelId,
    client_secret: channelSecret,
  })

  const tokenRes = await $fetch<{
    access_token?: string
    id_token?: string
    refresh_token?: string
    expires_in?: number
    scope?: string
  }>(LINE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenBody.toString(),
  }).catch((err: { data?: { error_description?: string } }) => {
    throw createError({
      statusCode: 502,
      statusMessage: err?.data?.error_description ?? 'LINE token exchange failed',
    })
  })

  const accessToken = tokenRes.access_token
  if (!accessToken) {
    throw createError({
      statusCode: 502,
      statusMessage: 'LINE did not return an access token',
    })
  }

  const profile = await $fetch<{
    userId: string
    displayName?: string
    pictureUrl?: string
    statusMessage?: string
  }>(LINE_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch LINE profile',
    })
  })

  const providerAccountId = profile.userId
  const [existingAccount] = await db
    .select({ userId: schema.account.userId })
    .from(schema.account)
    .where(
      and(
        eq(schema.account.provider, LINE_PROVIDER),
        eq(schema.account.providerAccountId, providerAccountId),
      ),
    )
    .limit(1)

  let userId: string

  if (existingAccount) {
    userId = existingAccount.userId
    const expiresAt = tokenRes.expires_in
      ? Math.floor(Date.now() / 1000) + tokenRes.expires_in
      : null
    await db
      .update(schema.account)
      .set({
        accessToken: tokenRes.access_token ?? null,
        refreshToken: tokenRes.refresh_token ?? null,
        expiresAt,
      })
      .where(
        and(
          eq(schema.account.provider, LINE_PROVIDER),
          eq(schema.account.providerAccountId, providerAccountId),
        ),
      )
  } else {
    userId = crypto.randomUUID()
    const now = new Date()
    await db.insert(schema.user).values({
      id: userId,
      name: profile.displayName ?? null,
      image: profile.pictureUrl ?? null,
      createdAt: now,
      updatedAt: now,
    })
    const accountExpiresAt = tokenRes.expires_in
      ? Math.floor(Date.now() / 1000) + tokenRes.expires_in
      : null
    await db.insert(schema.account).values({
      id: crypto.randomUUID(),
      userId,
      type: 'oauth',
      provider: LINE_PROVIDER,
      providerAccountId,
      accessToken: tokenRes.access_token ?? null,
      refreshToken: tokenRes.refresh_token ?? null,
      expiresAt: accountExpiresAt,
      tokenType: 'Bearer',
      scope: tokenRes.scope ?? null,
    })
  }

  const sessionId = crypto.randomUUID()
  const sessionToken = crypto.randomUUID()
  const expires = new Date()
  expires.setDate(expires.getDate() + SESSION_MAX_AGE_DAYS)

  await db.insert(schema.session).values({
    id: sessionId,
    sessionToken,
    userId,
    expires,
  })

  setCookie(event, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    path: '/',
  })

  const [userRow] = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      image: schema.user.image,
      avatarUrl: schema.user.avatarUrl,
    })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1)

  if (userRow) {
    await setUserSession(event, {
      user: {
        id: userRow.id,
        name: userRow.name ?? undefined,
        email: userRow.email ?? undefined,
        image: userRow.image ?? userRow.avatarUrl ?? undefined,
      },
    })
  }

  return sendRedirect(event, '/', 302)
})
