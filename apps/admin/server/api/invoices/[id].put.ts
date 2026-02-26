import { z } from 'zod'
import { eq, inArray } from 'drizzle-orm'
import { requirePropertyStaff } from '~~/server/utils/auth'

const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.coerce.number()
})
const updateInvoiceSchema = z.object({
  totalAmount: z.coerce.number(),
  dueDate: z.coerce.date(),
  items: z.array(invoiceItemSchema)
})

export default defineEventHandler(async (event) => {
  try {
    const invoiceId = event.context.params?.id
    if (!invoiceId) {
      throw createError({ statusCode: 400, statusMessage: 'ต้องระบุ Invoice ID' })
    }
    const body = await readValidatedBody(event, data => updateInvoiceSchema.safeParse(data))
    if (!body.success) {
      throw createError({ statusCode: 400, statusMessage: 'ข้อมูลไม่ถูกต้อง' })
    }
    const { totalAmount, dueDate, items: newItems } = body.data

    const [inv] = await db
      .select({ propertyId: schema.invoice.propertyId })
      .from(schema.invoice)
      .where(eq(schema.invoice.id, invoiceId))
      .limit(1)
    if (!inv) {
      throw createError({ statusCode: 404, statusMessage: 'ไม่พบใบแจ้งหนี้' })
    }
    await requirePropertyStaff(event, inv.propertyId)

    await db.transaction(async (tx) => {
      const existingItems = await tx
        .select({ id: schema.invoiceItem.id })
        .from(schema.invoiceItem)
        .where(eq(schema.invoiceItem.invoiceId, invoiceId))
      const existingItemIds = new Set(existingItems.map(item => item.id))
      const newItemIds = new Set(
        newItems.filter(item => !item.id.startsWith('temp-')).map(item => item.id)
      )

      const itemsToDelete = [...existingItemIds].filter(id => !newItemIds.has(id))
      if (itemsToDelete.length > 0) {
        await tx.delete(schema.invoiceItem).where(inArray(schema.invoiceItem.id, itemsToDelete))
      }

      const itemsToCreate = newItems.filter(item => item.id.startsWith('temp-'))
      for (const item of itemsToCreate) {
        await tx.insert(schema.invoiceItem).values({
          id: crypto.randomUUID(),
          invoiceId,
          description: item.description,
          amount: String(item.amount)
        })
      }

      await tx
        .update(schema.invoice)
        .set({
          totalAmount: String(totalAmount),
          dueDate
        })
        .where(eq(schema.invoice.id, invoiceId))
    })

    return successResponse(null, 'บันทึกการแก้ไขสำเร็จ')
  } catch (error) {
    return errorResponse(event, error)
  }
})
