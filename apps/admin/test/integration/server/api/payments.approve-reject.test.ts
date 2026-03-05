/**
 * Integration: POST /api/payments/:id/approve, reject (handler + DB).
 * See test/TESTING_STRATEGY.md.
 */
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { getE2ESetupOptions, getSessionCookie } from '../../helpers'

describe('Integration – POST /api/payments (approve & reject)', async () => {
  await setup(getE2ESetupOptions())

  describe('POST /api/payments/:id/approve', () => {
    it('returns 401 when not authenticated', async () => {
      try {
        await $fetch('/api/payments/00000000-0000-0000-0000-000000000000/approve', {
          method: 'POST',
        })
        expect.fail('Expected 401')
      } catch (err: unknown) {
        const e = err as { statusCode?: number }
        expect(e.statusCode).toBe(401)
      }
    })

    it('returns 404 when payment does not exist (authenticated)', async () => {
      const cookie = await getSessionCookie()
      if (!cookie) return
      const fakeId = crypto.randomUUID()
      try {
        await $fetch(`/api/payments/${fakeId}/approve`, {
          method: 'POST',
          headers: { Cookie: cookie },
        })
        expect.fail('Expected 404')
      } catch (err: unknown) {
        const e = err as { statusCode?: number }
        expect(e.statusCode).toBe(404)
      }
    })
  })

  describe('POST /api/payments/:id/reject', () => {
    it('returns 401 when not authenticated', async () => {
      try {
        await $fetch('/api/payments/00000000-0000-0000-0000-000000000000/reject', {
          method: 'POST',
          body: {},
        })
        expect.fail('Expected 401')
      } catch (err: unknown) {
        const e = err as { statusCode?: number }
        expect(e.statusCode).toBe(401)
      }
    })

    it('returns 404 when payment does not exist (authenticated)', async () => {
      const cookie = await getSessionCookie()
      if (!cookie) return
      const fakeId = crypto.randomUUID()
      try {
        await $fetch(`/api/payments/${fakeId}/reject`, {
          method: 'POST',
          headers: { Cookie: cookie },
          body: {},
        })
        expect.fail('Expected 404')
      } catch (err: unknown) {
        const e = err as { statusCode?: number }
        expect(e.statusCode).toBe(404)
      }
    })
  })
})
