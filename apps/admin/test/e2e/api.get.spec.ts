import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('Server API (e2e)', async () => {
  await setup({
    rootDir: '.',
    setupTimeout: 60000
  })

  describe('GET /api/dev/check-env', () => {
    it('returns database env info', async () => {
      const data = await $fetch<{ databaseUrlSet: boolean, hint: string, suggestion: string }>('/api/dev/check-env')
      expect(data).toBeDefined()
      expect(typeof data.databaseUrlSet).toBe('boolean')
      expect(data).toHaveProperty('hint')
      expect(data).toHaveProperty('suggestion')
    })
  })

  describe('GET /api/auth/dev-login', () => {
    it('returns 403 when not in development or 200/404 when in dev', async () => {
      try {
        const data = await $fetch<{ ok?: boolean, user?: unknown }>('/api/auth/dev-login')
        // In development with users: { ok: true, user }
        expect(data).toBeDefined()
        if (data.ok === true) {
          expect(data.user).toBeDefined()
          expect(data.user).toHaveProperty('id')
        }
      } catch (err: unknown) {
        const e = err as { statusCode?: number, data?: unknown }
        // Not in dev -> 403; no user in DB -> 404
        expect([403, 404]).toContain(e.statusCode)
      }
    })
  })

  describe('GET /api/dashboard', () => {
    it('returns 400 when propertyId is missing', async () => {
      try {
        await $fetch('/api/dashboard')
        expect.fail('Expected 400')
      } catch (err: unknown) {
        const e = err as { statusCode?: number }
        expect(e.statusCode).toBe(400)
      }
    })

    it('returns 401 when not authenticated (no session)', async () => {
      try {
        await $fetch('/api/dashboard', { query: { propertyId: 'any-property-id' } })
        expect.fail('Expected 401')
      } catch (err: unknown) {
        const e = err as { statusCode?: number }
        expect([401, 403]).toContain(e.statusCode)
      }
    })
  })
})
