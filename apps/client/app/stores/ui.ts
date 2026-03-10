// stores/ui.ts
import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'

type NotificationType = 'success' | 'error' | 'info'

interface Notification {
  message: string
  type: NotificationType
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    isGlobalLoading: false,
    notification: null as Notification | null,
  }),

  actions: {
    setGlobalLoading(isLoading: boolean) {
      this.isGlobalLoading = isLoading
    },

    /**
     * แสดง toast (vue-sonner) และอัปเดต state สำหรับ component ที่ยังใช้ notification
     */
    showNotification(payload: { message: string; type: NotificationType; duration?: number }) {
      const { message, type, duration = 3000 } = payload
      this.notification = { message, type }
      if (import.meta.client) {
        if (type === 'success') toast.success(message, { duration })
        else if (type === 'error') toast.error(message, { duration })
        else toast.info(message, { duration })
      }
      setTimeout(() => {
        this.notification = null
      }, duration)
    },

    hideNotification() {
      this.notification = null
    },
  },
})
