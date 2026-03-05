import { setCookie } from 'h3'

const LINE_AUTH_URL = 'https://access.line.me/oauth2/v2.1/authorize'
const LINE_SCOPE = 'profile openid'
const STATE_COOKIE_NAME = 'line_oauth_state'
const STATE_MAX_AGE = 60 * 10 // 10 minutes

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const channelId = config.lineChannelId
  let callbackUrl = config.lineCallbackUrl

  if (!channelId || !config.lineChannelSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'LINE Login is not configured. Set LINE_CHANNEL_ID and LINE_CHANNEL_SECRET.',
    })
  }

  if (!callbackUrl) {
    const url = getRequestURL(event)
    callbackUrl = `${url.origin}/api/auth/line/callback`
  }

  const state = crypto.randomUUID()
  setCookie(event, STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: STATE_MAX_AGE,
    path: '/',
  })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: channelId,
    redirect_uri: callbackUrl,
    state,
    scope: LINE_SCOPE,
  })

  const target = `${LINE_AUTH_URL}?${params.toString()}`
  return sendRedirect(event, target, 302)
})
