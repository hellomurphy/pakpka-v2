/**
 * Shared helpers for integration tests (handler + DB).
 * Uses $fetch to hit the running server from @nuxt/test-utils/e2e setup.
 */
import { $fetch } from '@nuxt/test-utils/e2e'

export async function getSessionCookie(): Promise<string | null> {
  try {
    const res = await $fetch.raw<{ ok?: boolean }>('/api/auth/dev-login')
    if (res.status !== 200 || !res.ok) return null
    const setCookie = res.headers.get('set-cookie')
    if (!setCookie) return null
    const match = setCookie.match(/session_token=([^;]+)/)
    return match ? `session_token=${match[1]}` : null
  } catch {
    return null
  }
}
