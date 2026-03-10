/**
 * Log whether client can connect to admin API on app start (client-side only).
 * Uses GET /api/health which returns { ok: true }.
 * Do not await so this plugin does not block app init (splash screen, etc.).
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl as string
  const healthUrl = `${apiBaseUrl}/health`

  $fetch<{ ok?: boolean }>(healthUrl, { credentials: 'include' })
    .then((res) => {
      if (res?.ok === true) {
        console.log('[client] Admin API connected:', healthUrl)
      } else {
        console.warn('[client] Admin API responded but ok !== true:', healthUrl, res)
      }
    })
    .catch((err) => {
      console.warn('[client] Admin API connection failed:', healthUrl, err)
    })
})
