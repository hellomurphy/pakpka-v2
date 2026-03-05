import { z } from 'zod'
import { BillingType } from '@repo/db'

export const createContractSchema = z.object({
  tenantId: z.string().min(1, 'ต้องระบุ ID ผู้เช่า'),
  roomId: z.string().min(1, 'ต้องระบุ ID ห้องพัก'),
  propertyId: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  rentAmount: z.coerce.number().positive(),
  depositAmount: z.coerce.number().min(0),
  waterBillingType: z.enum(Object.values(BillingType) as [string, ...string[]]),
  waterRate: z.coerce.number().min(0),
  waterMinimumCharge: z.coerce.number().min(0).default(0),
  electricityBillingType: z.enum(Object.values(BillingType) as [string, ...string[]]),
  electricityRate: z.coerce.number().min(0),
  electricityMinimumCharge: z.coerce.number().min(0).default(0),
})

export type CreateContractInput = z.infer<typeof createContractSchema>
