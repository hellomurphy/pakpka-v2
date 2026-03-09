/**
 * E2E: เก็บเฉพาะเทสที่ต้องตรวจ HTTP + cookie + middleware จริง.
 * เทส 400/403/404 ย้ายไปอยู่ที่ integration แล้ว.
 */
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { getE2ESetupOptions } from '../integration/helpers'

describe('Server API – Contracts (e2e)', async () => {
  await setup(getE2ESetupOptions())

  async function getSessionCookie(): Promise<string | null> {
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

  describe('POST /api/contracts', () => {
    it('returns 401 when no session (auth middleware)', async () => {
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
            depositAmount: 10000,
            waterBillingType: 'FLAT_RATE',
            waterRate: 0,
            waterMinimumCharge: 0,
            electricityBillingType: 'FLAT_RATE',
            electricityRate: 0,
            electricityMinimumCharge: 0,
          },
        })
        expect.fail('Expected 401')
      } catch (err: unknown) {
        const e = err as { statusCode?: number }
        expect(e.statusCode).toBe(401)
      }
    })

    it('returns 403 when cookie sent but user not staff of property', async () => {
      const cookie = await getSessionCookie()
      if (!cookie) return
      const fakePropertyId = crypto.randomUUID()
      const fakeId = crypto.randomUUID()
      try {
        await $fetch('/api/contracts', {
          method: 'POST',
          headers: { Cookie: cookie, 'Content-Type': 'application/json' },
          body: {
            tenantId: fakeId,
            roomId: fakeId,
            propertyId: fakePropertyId,
            startDate: '2025-06-01',
            endDate: '2026-05-31',
            rentAmount: 5000,
            depositAmount: 10000,
            waterBillingType: 'FLAT_RATE',
            waterRate: 0,
            waterMinimumCharge: 0,
            electricityBillingType: 'FLAT_RATE',
            electricityRate: 0,
            electricityMinimumCharge: 0,
          },
        })
        expect.fail('Expected 403')
      } catch (err: unknown) {
        const e = err as { statusCode?: number }
        expect(e.statusCode).toBe(403)
      }
    })
  })
})
