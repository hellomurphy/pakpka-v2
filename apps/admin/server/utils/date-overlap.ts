/**
 * Pure business rule: check if a new date range overlaps any existing ranges.
 * Used by contracts, reservations, and tenants create flows.
 * Unit-testable without DB/Nitro.
 */
export type DateRange = { startDate: Date | string; endDate: Date | string }

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d)
}

/**
 * Two ranges [a1, a2] and [b1, b2] overlap iff a1 <= b2 and b1 <= a2.
 */
export function hasOverlappingDateRanges(
  newStart: Date | string,
  newEnd: Date | string,
  existing: DateRange[],
): boolean {
  const a1 = toDate(newStart).getTime()
  const a2 = toDate(newEnd).getTime()
  return existing.some(({ startDate, endDate }) => {
    const b1 = toDate(startDate).getTime()
    const b2 = toDate(endDate).getTime()
    return a1 <= b2 && b1 <= a2
  })
}
