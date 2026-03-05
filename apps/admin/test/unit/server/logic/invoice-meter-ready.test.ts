import { describe, expect, it } from 'vitest'
import { isInvoiceMeterReady } from '../../../../server/utils/invoice-meter-ready'
import { BillingType } from '@repo/db'

describe('invoice-meter-ready', () => {
  describe('isInvoiceMeterReady', () => {
    it('returns true when both are FLAT_RATE (no readings required)', () => {
      expect(
        isInvoiceMeterReady(BillingType.FLAT_RATE, BillingType.FLAT_RATE, false, false)
      ).toBe(true)
    })

    it('returns false when electricity is PER_UNIT and no electricity reading', () => {
      expect(
        isInvoiceMeterReady(BillingType.PER_UNIT, BillingType.FLAT_RATE, false, true)
      ).toBe(false)
      expect(
        isInvoiceMeterReady(BillingType.PER_UNIT, BillingType.FLAT_RATE, false, false)
      ).toBe(false)
    })

    it('returns false when water is PER_UNIT and no water reading', () => {
      expect(
        isInvoiceMeterReady(BillingType.FLAT_RATE, BillingType.PER_UNIT, true, false)
      ).toBe(false)
      expect(
        isInvoiceMeterReady(BillingType.FLAT_RATE, BillingType.PER_UNIT, false, false)
      ).toBe(false)
    })

    it('returns true when both PER_UNIT and both readings present', () => {
      expect(
        isInvoiceMeterReady(BillingType.PER_UNIT, BillingType.PER_UNIT, true, true)
      ).toBe(true)
    })

    it('returns false when either PER_UNIT is missing its reading', () => {
      expect(
        isInvoiceMeterReady(BillingType.PER_UNIT, BillingType.PER_UNIT, true, false)
      ).toBe(false)
      expect(
        isInvoiceMeterReady(BillingType.PER_UNIT, BillingType.PER_UNIT, false, true)
      ).toBe(false)
    })
  })
})
