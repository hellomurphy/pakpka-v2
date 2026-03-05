/**
 * Integration tests: handler + DB (and auth).
 * Uses same server as e2e (setup + $fetch). Focus on business flows with real DB.
 * See test/TESTING_STRATEGY.md for pyramid and next steps.
 */
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { getSessionCookie } from '../../helpers'

describe('Integration – POST /api/contracts (handler + DB)', async () => {
  await setup({
    rootDir: '.',
    setupTimeout: 60000
  })

  it('returns 401 when not authenticated', async () => {
    const fakeId = crypto.randomUUID()
    try {
      await $fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          tenantId: fakeId,
          roomId: fakeId,
          propertyId: fakeId,
          startDate: '2025-06-01',
          endDate: '2026-05-31',
          rentAmount: 5000,
          depositAmount: 0,
          waterBillingType: 'FLAT_RATE',
          waterRate: 0,
          waterMinimumCharge: 0,
          electricityBillingType: 'FLAT_RATE',
          electricityRate: 0,
          electricityMinimumCharge: 0
        }
      })
      expect.fail('Expected 401')
    } catch (err: unknown) {
      const e = err as { statusCode?: number }
      expect(e.statusCode).toBe(401)
    }
  })

  it('returns 400 when body is invalid', async () => {
    try {
      await $fetch('/api/contracts', { method: 'POST', body: {} })
      expect.fail('Expected 400')
    } catch (err: unknown) {
      const e = err as { statusCode?: number }
      expect(e.statusCode).toBe(400)
    }
  })

  it('returns 403 or 404 when authenticated but not staff or room missing', async () => {
    const cookie = await getSessionCookie()
    if (!cookie) return
    const fakeId = crypto.randomUUID()
    try {
      await $fetch('/api/contracts', {
        method: 'POST',
        headers: { Cookie: cookie, 'Content-Type': 'application/json' },
        body: {
          tenantId: fakeId,
          roomId: fakeId,
          propertyId: fakeId,
          startDate: '2025-06-01',
          endDate: '2026-05-31',
          rentAmount: 5000,
          depositAmount: 0,
          waterBillingType: 'FLAT_RATE',
          waterRate: 0,
          waterMinimumCharge: 0,
          electricityBillingType: 'FLAT_RATE',
          electricityRate: 0,
          electricityMinimumCharge: 0
        }
      })
      expect.fail('Expected 403 or 404')
    } catch (err: unknown) {
      const e = err as { statusCode?: number }
      expect([403, 404]).toContain(e.statusCode)
    }
  })
})
