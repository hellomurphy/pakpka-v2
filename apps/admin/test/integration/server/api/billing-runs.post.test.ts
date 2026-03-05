/**
 * Integration: POST /api/billing-runs (handler + DB).
 * See test/TESTING_STRATEGY.md.
 */
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { getSessionCookie } from '../../helpers'

describe('Integration – POST /api/billing-runs', async () => {
  await setup({
    rootDir: '.',
    setupTimeout: 60000,
  })

  it('returns 401 when not authenticated', async () => {
    try {
      await $fetch('/api/billing-runs', {
        method: 'POST',
        body: { propertyId: 'any', period: '2025-01' },
      })
      expect.fail('Expected 401')
    } catch (err: unknown) {
      const e = err as { statusCode?: number }
      expect(e.statusCode).toBe(401)
    }
  })

  it('returns 400 when body is invalid (authenticated)', async () => {
    const cookie = await getSessionCookie()
    if (!cookie) return
    try {
      await $fetch('/api/billing-runs', {
        method: 'POST',
        headers: { Cookie: cookie },
        body: {},
      })
      expect.fail('Expected 400')
    } catch (err: unknown) {
      const e = err as { statusCode?: number }
      expect(e.statusCode).toBe(400)
    }
  })

  it('returns 400 when period format is invalid (authenticated)', async () => {
    const cookie = await getSessionCookie()
    if (!cookie) return
    try {
      await $fetch('/api/billing-runs', {
        method: 'POST',
        headers: { Cookie: cookie },
        body: { propertyId: crypto.randomUUID(), period: 'invalid' },
      })
      expect.fail('Expected 400')
    } catch (err: unknown) {
      const e = err as { statusCode?: number }
      expect(e.statusCode).toBe(400)
    }
  })

  it('returns 403 when not staff of property (authenticated)', async () => {
    const cookie = await getSessionCookie()
    if (!cookie) return
    try {
      await $fetch('/api/billing-runs', {
        method: 'POST',
        headers: { Cookie: cookie },
        body: { propertyId: crypto.randomUUID(), period: '2025-01' },
      })
      expect.fail('Expected 403')
    } catch (err: unknown) {
      const e = err as { statusCode?: number }
      expect(e.statusCode).toBe(403)
    }
  })
})
