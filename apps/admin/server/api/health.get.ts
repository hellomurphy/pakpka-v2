/**
 * Lightweight health check for CI and load balancers.
 * Used by wait-on in CI to confirm Nitro is ready before running integration/e2e tests.
 */
export default defineEventHandler(() => ({ ok: true }))
