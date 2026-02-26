import { z } from 'zod'
import { requirePropertyStaff } from '~~/server/utils/auth'

const createAccountSchema = z
  .object({
    propertyId: z.string().min(1),
    type: z.enum(['BANK_ACCOUNT', 'PROMPTPAY']),
    details: z.any()
  })
  .superRefine((data, ctx) => {
    if (data.type === 'BANK_ACCOUNT') {
      const bankDetails = z
        .object({
          bankName: z.string().min(1),
          accountName: z.string().min(1),
          accountNumber: z.string().min(1)
        })
        .safeParse(data.details)
      if (!bankDetails.success) ctx.addIssue(bankDetails.error.issues[0])
    } else if (data.type === 'PROMPTPAY') {
      const promptpayDetails = z
        .object({
          recipientName: z.string().min(1),
          promptpayNumber: z.string().min(10)
        })
        .safeParse(data.details)
      if (!promptpayDetails.success) ctx.addIssue(promptpayDetails.error.issues[0])
    }
  })

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, data => createAccountSchema.safeParse(data))
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ข้อมูลไม่ถูกต้อง',
        data: body.error.flatten()
      })
    }
    await requirePropertyStaff(event, body.data.propertyId)

    const id = crypto.randomUUID()
    const [newAccount] = await db
      .insert(schema.receivingAccount)
      .values({
        id,
        propertyId: body.data.propertyId,
        type: body.data.type,
        details: body.data.details
      })
      .returning()
    if (!newAccount) throw createError({ statusCode: 500, statusMessage: 'เพิ่มช่องทางไม่สำเร็จ' })

    return successResponse(newAccount, 'เพิ่มช่องทางการชำระเงินสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
