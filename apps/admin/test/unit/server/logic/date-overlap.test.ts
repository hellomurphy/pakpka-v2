import { describe, expect, it } from 'vitest'
import { hasOverlappingDateRanges } from '../../../../server/utils/date-overlap'

describe('hasOverlappingDateRanges', () => {
  const june1 = new Date('2025-06-01')
  const june30 = new Date('2025-06-30')
  const july1 = new Date('2025-07-01')
  const july31 = new Date('2025-07-31')
  const aug1 = new Date('2025-08-01')

  it('returns false when existing is empty', () => {
    expect(hasOverlappingDateRanges(june1, june30, [])).toBe(false)
  })

  it('returns false when new range is entirely after existing', () => {
    const existing = [{ startDate: june1, endDate: june30 }]
    expect(hasOverlappingDateRanges(july1, july31, existing)).toBe(false)
  })

  it('returns false when new range is entirely before existing', () => {
    const existing = [{ startDate: july1, endDate: july31 }]
    expect(hasOverlappingDateRanges(june1, june30, existing)).toBe(false)
  })

  it('returns true when new range overlaps at end of existing', () => {
    const existing = [{ startDate: june1, endDate: june30 }]
    expect(hasOverlappingDateRanges(june30, july31, existing)).toBe(true)
  })

  it('returns true when new range overlaps at start of existing', () => {
    const existing = [{ startDate: july1, endDate: july31 }]
    expect(hasOverlappingDateRanges(june1, july1, existing)).toBe(true)
  })

  it('returns true when new range is inside existing', () => {
    const existing = [{ startDate: june1, endDate: july31 }]
    expect(hasOverlappingDateRanges(july1, july31, existing)).toBe(true)
  })

  it('returns true when existing is inside new range', () => {
    const existing = [{ startDate: july1, endDate: july31 }]
    expect(hasOverlappingDateRanges(june1, aug1, existing)).toBe(true)
  })

  it('works with date strings from DB', () => {
    const existing = [{ startDate: '2025-06-01', endDate: '2025-06-30' }]
    expect(hasOverlappingDateRanges(july1, july31, existing)).toBe(false)
    expect(hasOverlappingDateRanges('2025-06-15', '2025-07-15', existing)).toBe(true)
  })
})
