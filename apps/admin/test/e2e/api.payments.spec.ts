/**
 * E2E: เก็บเฉพาะเทสที่ต้องตรวจ HTTP + cookie + middleware จริง.
 * เทส 404 ย้ายไปอยู่ที่ integration แล้ว.
 */
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('Server API – Payments (e2e)', async () => {
  await setup({
    rootDir: '.',
    setupTimeout: 60000,
  })

  describe('POST /api/payments/:id/approve', () => {
    it('returns 401 when no session (auth middleware)', async () => {
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
  })

  describe('POST /api/payments/:id/reject', () => {
    it('returns 401 when no session (auth middleware)', async () => {
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
  })
})
