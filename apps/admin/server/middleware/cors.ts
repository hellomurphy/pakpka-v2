/**
 * CORS middleware: allow cross-origin requests only from allowlist.
 * Required when client/landing (different origin) call admin API with credentials.
 * Configure via ALLOWED_ORIGINS (comma-separated) or runtimeConfig.server.allowedOrigins.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const raw =
    (config.server?.allowedOrigins as string | undefined) ?? process.env.ALLOWED_ORIGINS ?? ''
  const allowlist = raw
    ? raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : []

  if (allowlist.length === 0) return

  const origin = getHeader(event, 'origin')
  if (!origin) return

  const allowed = allowlist.includes(origin)
  if (!allowed) return

  setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
  setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')
  setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
  setResponseHeader(event, 'Access-Control-Max-Age', '86400')

  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
