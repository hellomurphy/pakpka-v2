import { describe, expect, it } from 'vitest'
import { createContractSchema } from '../../../../server/utils/schemas/contract'

const validMin = {
  tenantId: 't1',
  roomId: 'r1',
  propertyId: 'p1',
  startDate: '2025-06-01',
  endDate: '2026-05-31',
  rentAmount: 5000,
  depositAmount: 0,
  waterBillingType: 'FLAT_RATE',
  waterRate: 0,
  waterMinimumCharge: 0,
  electricityBillingType: 'FLAT_RATE',
  electricityRate: 0,
  electricityMinimumCharge: 0
}

describe('createContractSchema', () => {
  it('parses valid body', () => {
    const result = createContractSchema.parse(validMin)
    expect(result.tenantId).toBe('t1')
    expect(result.rentAmount).toBe(5000)
    expect(result.waterBillingType).toBe('FLAT_RATE')
  })

  it('rejects empty tenantId', () => {
    expect(() =>
      createContractSchema.parse({ ...validMin, tenantId: '' })
    ).toThrow()
  })

  it('rejects invalid waterBillingType enum', () => {
    expect(() =>
      createContractSchema.parse({ ...validMin, waterBillingType: 'INVALID' })
    ).toThrow()
  })

  it('rejects non-positive rentAmount', () => {
    expect(() =>
      createContractSchema.parse({ ...validMin, rentAmount: 0 })
    ).toThrow()
  })

  it('rejects missing required fields', () => {
    expect(() => createContractSchema.parse({})).toThrow()
  })
})
