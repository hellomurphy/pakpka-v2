import { BillingType } from '@repo/db'

/**
 * Calculate utility cost (electricity or water) from units and contract billing settings.
 * PER_UNIT: max(units * rate, minCharge); otherwise uses rate as fixed amount.
 * Unit-testable without DB/Nitro.
 */
export function calcUtilityCost(
  units: number,
  billingType: string,
  rate: string | number,
  minCharge: string | number,
): number {
  const r = Number(rate)
  const min = Number(minCharge)
  if (billingType === BillingType.PER_UNIT) {
    return Math.max(units * r, min)
  }
  return r
}
