import { Role } from '@repo/db'

const PERIOD_REGEX = /^\d{4}-\d{2}$/

/**
 * Valid billing run period format: YYYY-MM.
 * Unit-testable without DB/Nitro.
 */
export function isValidBillingRunPeriod(period: string): boolean {
  return PERIOD_REGEX.test(period)
}

/**
 * Only OWNER or ADMIN can create a billing run.
 * Unit-testable without DB/Nitro.
 */
export function canCreateBillingRun(role: string | null | undefined): boolean {
  return role === Role.OWNER || role === Role.ADMIN
}

/**
 * Check if period is already in the list of existing periods (e.g. for same property).
 * Unit-testable without DB/Nitro.
 */
export function isPeriodDuplicate(
  existingPeriods: string[],
  period: string
): boolean {
  return existingPeriods.includes(period)
}
