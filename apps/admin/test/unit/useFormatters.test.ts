import { describe, expect, it } from 'vitest'
import { useFormatters } from '../../app/composables/useFormatters'

describe('useFormatters', () => {
  const { currency, number, phoneNumber } = useFormatters()

  describe('currency', () => {
    it('returns "-" for null and undefined', () => {
      expect(currency(null)).toBe('-')
      expect(currency(undefined)).toBe('-')
    })

    it('formats number as THB with symbol', () => {
      const result = currency(1234.5)
      expect(result).toMatch(/฿.*1[,.]?234[,.]?50/)
    })

    it('formats with optional decimalDigits', () => {
      const result = currency(1000, { decimalDigits: 0 })
      expect(result).toMatch(/฿.*1[,.]?000/)
    })

    it('supports compact format for thousands', () => {
      expect(currency(1500, { compact: true })).toBe('฿1.50K')
    })

    it('supports compact format for millions', () => {
      expect(currency(2_500_000, { compact: true })).toBe('฿2.50M')
    })
  })

  describe('number', () => {
    it('returns "-" for null and undefined', () => {
      expect(number(null)).toBe('-')
      expect(number(undefined)).toBe('-')
    })

    it('formats integer with Thai locale grouping', () => {
      const result = number(1234)
      expect(result).toMatch(/1[,.]?234/)
    })

    it('respects decimalDigits', () => {
      const result = number(12.345, 2)
      expect(result).toMatch(/12[,.]?35/)
    })
  })

  describe('phoneNumber', () => {
    it('returns "-" for null and undefined', () => {
      expect(phoneNumber(null)).toBe('-')
      expect(phoneNumber(undefined)).toBe('-')
    })

    it('formats 10-digit Thai mobile as XXX-XXX-XXXX', () => {
      expect(phoneNumber('0812345678')).toBe('081-234-5678')
    })

    it('formats 9-digit number as XX-XXX-XXXX', () => {
      expect(phoneNumber('812345678')).toBe('81-234-5678')
    })

    it('strips non-digits before formatting', () => {
      expect(phoneNumber('081-234-5678')).toBe('081-234-5678')
    })
  })
})
