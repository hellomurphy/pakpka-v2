import { describe, expect, it } from 'vitest'
import { calcUtilityCost } from '../../../../server/utils/utility-cost'
import { BillingType } from '@repo/db'

describe('utility-cost', () => {
  describe('calcUtilityCost', () => {
    describe('PER_UNIT', () => {
      it('returns units * rate when above minimum charge', () => {
        expect(calcUtilityCost(10, BillingType.PER_UNIT, 8, 0)).toBe(80)
        expect(calcUtilityCost(5, BillingType.PER_UNIT, '7.5', '0')).toBe(37.5)
      })

      it('returns minimum charge when units * rate is below minimum', () => {
        expect(calcUtilityCost(0, BillingType.PER_UNIT, 8, 100)).toBe(100)
        expect(calcUtilityCost(5, BillingType.PER_UNIT, 10, 80)).toBe(80)
      })

      it('accepts string rate and minCharge from DB', () => {
        expect(calcUtilityCost(10, BillingType.PER_UNIT, '8', '100')).toBe(100)
        expect(calcUtilityCost(20, BillingType.PER_UNIT, '8', '100')).toBe(160)
      })
    })

    describe('FLAT_RATE', () => {
      it('returns rate as fixed amount regardless of units', () => {
        expect(calcUtilityCost(0, BillingType.FLAT_RATE, 500, 0)).toBe(500)
        expect(calcUtilityCost(100, BillingType.FLAT_RATE, 500, 0)).toBe(500)
        expect(calcUtilityCost(10, BillingType.FLAT_RATE, '350', '100')).toBe(350)
      })
    })

    it('treats unknown billing type as flat (returns rate)', () => {
      expect(calcUtilityCost(10, 'UNKNOWN', 200, 50)).toBe(200)
    })
  })
})
