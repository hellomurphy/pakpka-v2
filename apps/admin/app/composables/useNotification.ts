import { toast } from 'vue-sonner'

export const useNotification = () => {
  const showSuccess = (message: string) => {
    toast.success(message)
  }

  const showError = (error: unknown) => {
    let message = 'เกิดข้อผิดพลาดที่ไม่คาดคิด'

    const err = error as { data?: { statusMessage?: string } }
    if (err?.data?.statusMessage) {
      message = err.data.statusMessage
    }
    // เงื่อนไขเดิมสำหรับ Error รูปแบบอื่นๆ
    else if (typeof error === 'string') {
      message = error
    } else if (error instanceof Error) {
      message = error.message
    }

    toast.error(message)
  }

  const showInfo = (message: string) => {
    toast.info(message)
  }

  const show = (options: { message: string; type?: 'success' | 'info' | 'error' | 'warning' }) => {
    const { message, type = 'info' } = options
    switch (type) {
      case 'success':
        toast.success(message)
        break
      case 'error':
        toast.error(message)
        break
      case 'warning':
        toast.warning(message)
        break // ✨ เพิ่ม warning
      case 'info':
      default:
        toast.info(message)
        break
    }
  }

  return {
    show,
    showSuccess,
    showError,
    showInfo,
  }
}
