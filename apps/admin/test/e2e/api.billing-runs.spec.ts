/**
 * E2E: เก็บเฉพาะเทสที่ต้องตรวจ HTTP + cookie + middleware จริง.
 * เทส 400/403 ย้ายไปอยู่ที่ integration แล้ว.
 */
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('Server API – Billing runs (e2e)', async () => {
  await setup({
    rootDir: '.',
    setupTimeout: 60000,
  })

  describe('POST /api/billing-runs', () => {
    it('returns 401 when no session (auth middleware)', async () => {
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
  })
})
