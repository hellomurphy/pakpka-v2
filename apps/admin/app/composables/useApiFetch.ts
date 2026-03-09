import { useNotification } from '~/composables/useNotification'
import type { FetchOptions } from 'ofetch'

type ApiFetchOptions = FetchOptions & {
  showNotification?: boolean
  successMessage?: string
  errorMessage?: string
}

/**
 * Wrapper อัจฉริยะสำหรับ $fetch ที่จัดการ Notification และ Error ให้อัตโนมัติ
 */
export async function useApiFetch<T>(url: string, options?: ApiFetchOptions): Promise<T> {
  const { showSuccess, showError } = useNotification()
  const { showNotification = true, successMessage, errorMessage, ...fetchOptions } = options || {}

  // ลบ logic การดึง cookie/headers ออก
  // $fetch จะแนบ cookie ไปกับ same-origin requests (เช่น /api/...) ให้อัตโนมัติ

  try {
    const response = await $fetch.raw(url, {
      ...fetchOptions,
    })

    const isSuccess = response.status >= 200 && response.status < 300

    if (showNotification && isSuccess && successMessage) {
      showSuccess(successMessage)
    }

    // คืนค่าเฉพาะข้อมูล (body) กลับไปเหมือนเดิมตามที่คุณต้องการ
    return response._data as T
  } catch (err: unknown) {
    const error = err as {
      data?: {
        error?: { message?: string }
        statusMessage?: string
        message?: string
        data?: { fieldErrors?: Record<string, string[]> }
      }
      statusMessage?: string
    }
    // --- Error Handling ที่ฉลาดขึ้น ---
    let message = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
    if (errorMessage) {
      // 1. ใช้ Error message ที่เรากำหนดเอง (ถ้ามี)
      message = errorMessage
    } else if (error.data?.error?.message) {
      // ✨ 2. ใช้ Error message จาก errorResponse() (โครงสร้างใหม่: error.data.error.message)
      message = error.data.error.message
    } else if (error.data?.statusMessage) {
      // 3. ใช้ Error message ที่ API ส่งกลับมา (จาก createError แบบเก่า)
      message = error.data.statusMessage
    } else if (error.data?.data?.fieldErrors) {
      // 4. ใช้ Error message จาก Zod validation
      message = Object.values(error.data.data.fieldErrors).flat().join(', ')
    } else if (error.data?.message) {
      // 5. ใช้ Error message ทั่วไป
      message = error.data.message
    } else if (error.statusMessage) {
      // 6. Fallback: ใช้ statusMessage จาก error object โดยตรง
      message = error.statusMessage
    }

    if (showNotification) {
      showError(message)
    }

    // --- จัดการ Session หมดอายุอัตโนมัติ ---
    if (error.statusCode === 401) {
      // await signOut({ redirect: false });
      // // บังคับ reload หน้าเพื่อไปที่หน้า login
      // window.location.reload();
    }

    // ยังคง throw error ออกไปเพื่อให้ Store ที่เรียกใช้จัดการต่อได้ (เช่น หยุด loading)
    throw error
  }
}
