import { BillingType } from '@repo/db'

/**
 * Whether an invoice has required meter readings to be sent.
 * PER_UNIT billing requires a reading for that utility; otherwise no reading is required.
 * Unit-testable without DB/Nitro.
 */
export function isInvoiceMeterReady(
  electricityBillingType: string,
  waterBillingType: string,
  hasElectricityReading: boolean,
  hasWaterReading: boolean,
): boolean {
  if (electricityBillingType === BillingType.PER_UNIT && !hasElectricityReading) return false
  if (waterBillingType === BillingType.PER_UNIT && !hasWaterReading) return false
  return true
}
