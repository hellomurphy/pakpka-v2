import { z } from 'zod'

/** รูปแบบรอบบิล YYYY-MM ใช้ร่วมกับ isValidBillingRunPeriod ใน billing-run-rules */
export const billingRunPeriodSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'รูปแบบรอบบิลต้องเป็น YYYY-MM')

export const createBillingRunSchema = z.object({
  propertyId: z.string().min(1, 'Property ID ไม่ถูกต้อง'),
  period: billingRunPeriodSchema,
})

export type CreateBillingRunInput = z.infer<typeof createBillingRunSchema>
