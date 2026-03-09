/**
 * Shared helpers for integration and e2e tests (handler + DB).
 * Uses $fetch to hit the running server from @nuxt/test-utils/e2e setup.
 */
import { $fetch } from '@nuxt/test-utils/e2e'

/** Options for setup() from @nuxt/test-utils/e2e. When TEST_HOST is set (e.g. in CI), use existing server and skip build. */
export function getE2ESetupOptions(): { rootDir: string; setupTimeout: number; host?: string } {
  return {
    rootDir: '.',
    setupTimeout: 60_000,
    ...(process.env.TEST_HOST && { host: process.env.TEST_HOST }),
  }
}

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
