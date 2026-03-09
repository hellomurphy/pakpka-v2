import { requireSession } from '~~/server/utils/auth'

/**
 * Placeholder: schema ยังไม่มี Notification model.
 * เมื่อมี Notification model แล้ว ค่อย implement การ mark as read จริง.
 */
export default defineEventHandler(async (event) => {
  try {
    await requireSession(event)

    const notificationId = event.context.params?.id
    if (!notificationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Notification ID is required',
      })
    }

    return successResponse(
      {
        id: notificationId,
        isRead: true,
        readAt: new Date(),
      },
      'ทำเครื่องหมายว่าอ่านแล้ว (Placeholder - ต้องเพิ่ม Notification model เพื่อใช้งานจริง)',
    )
  } catch (error) {
    return errorResponse(event, error)
  }
})
