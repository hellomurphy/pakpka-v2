import { describe, expect, it } from 'vitest'
import {
  createBillingRunSchema,
  billingRunPeriodSchema,
} from '../../../../server/utils/schemas/billing-run'

describe('billingRunPeriodSchema', () => {
  it('accepts valid YYYY-MM', () => {
    expect(billingRunPeriodSchema.parse('2025-01')).toBe('2025-01')
    expect(billingRunPeriodSchema.parse('2024-12')).toBe('2024-12')
  })

  it('rejects invalid format', () => {
    expect(() => billingRunPeriodSchema.parse('2025-1')).toThrow()
    expect(() => billingRunPeriodSchema.parse('25-01')).toThrow()
    expect(() => billingRunPeriodSchema.parse('invalid')).toThrow()
  })
})

describe('createBillingRunSchema', () => {
  it('parses valid body', () => {
    const result = createBillingRunSchema.parse({
      propertyId: 'prop-1',
      period: '2025-01',
    })
    expect(result.propertyId).toBe('prop-1')
    expect(result.period).toBe('2025-01')
  })

  it('rejects empty propertyId', () => {
    expect(() => createBillingRunSchema.parse({ propertyId: '', period: '2025-01' })).toThrow()
  })

  it('rejects invalid period', () => {
    expect(() => createBillingRunSchema.parse({ propertyId: 'p', period: 'bad' })).toThrow()
  })

  it('rejects missing fields', () => {
    expect(() => createBillingRunSchema.parse({})).toThrow()
    expect(() => createBillingRunSchema.parse({ propertyId: 'p' })).toThrow()
  })
})
