import { describe, expect, it } from 'vitest'
import {
  isValidBillingRunPeriod,
  canCreateBillingRun,
  isPeriodDuplicate,
} from '../../../../server/utils/billing-run-rules'

describe('billing-run-rules', () => {
  describe('isValidBillingRunPeriod', () => {
    it('accepts YYYY-MM format', () => {
      expect(isValidBillingRunPeriod('2025-01')).toBe(true)
      expect(isValidBillingRunPeriod('2024-12')).toBe(true)
    })

    it('rejects invalid format', () => {
      expect(isValidBillingRunPeriod('invalid')).toBe(false)
      expect(isValidBillingRunPeriod('2025/01')).toBe(false)
      expect(isValidBillingRunPeriod('25-01')).toBe(false)
      expect(isValidBillingRunPeriod('2025-1')).toBe(false)
      expect(isValidBillingRunPeriod('')).toBe(false)
    })
  })

  describe('canCreateBillingRun', () => {
    it('returns true for OWNER and ADMIN', () => {
      expect(canCreateBillingRun('OWNER')).toBe(true)
      expect(canCreateBillingRun('ADMIN')).toBe(true)
    })

    it('returns false for STAFF and others', () => {
      expect(canCreateBillingRun('STAFF')).toBe(false)
      expect(canCreateBillingRun(null)).toBe(false)
      expect(canCreateBillingRun(undefined)).toBe(false)
    })
  })

  describe('isPeriodDuplicate', () => {
    it('returns true when period exists in list', () => {
      expect(isPeriodDuplicate(['2025-01', '2025-02'], '2025-01')).toBe(true)
    })

    it('returns false when period is not in list', () => {
      expect(isPeriodDuplicate(['2025-01', '2025-02'], '2025-03')).toBe(false)
      expect(isPeriodDuplicate([], '2025-01')).toBe(false)
    })
  })
})
