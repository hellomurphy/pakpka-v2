// stores/user.ts
import { defineStore } from 'pinia'
import type { UserProfile } from '@repo/db'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as UserProfile | null,
    token: null as string | null,
    status: 'idle' as 'idle' | 'pending' | 'success' | 'error',
  }),

  getters: {
    isLoggedIn: (state): boolean => state.status === 'success' && !!state.user,
    isLoading: (state): boolean => state.status === 'pending',
    displayName: (state): string => state.user?.name ?? 'ผู้ใช้งาน',
  },

  actions: {
    /**
     * ดึงข้อมูลโปรไฟล์ของ tenant
     */
    async fetchProfile() {
      // ถ้า login อยู่แล้ว ไม่ต้อง fetch ใหม่
      if (this.isLoggedIn) return

      const api = useApi()
      this.status = 'pending'

      try {
        const response = await api.profile.get()
        this.user = response.data
        this.status = 'success'
      } catch (error: any) {
        this.status = 'error'
        this.user = null
        console.error('Failed to fetch user profile:', error)

        // ถ้าเป็น 401 Unauthorized แปลว่ายังไม่ login
        if (error.status === 401 || error.statusCode === 401) {
          throw new Error('Unauthorized')
        }

        // Don't throw other errors - let the UI handle empty state
      }
    },

    /**
     * อัปเดตโปรไฟล์
     */
    async updateProfile(data: Partial<UserProfile>) {
      const api = useApi()
      const uiStore = useUiStore()

      try {
        const response = await api.profile.update(data)
        this.user = response.data

        uiStore.showNotification({
          type: 'success',
          message: 'อัปเดตโปรไฟล์สำเร็จ',
        })
      } catch (error) {
        console.error('Failed to update profile:', error)
        throw error
      }
    },

    /**
     * Logout: call admin API to clear session/cookie, then clear store and redirect.
     */
    async logout() {
      try {
        const config = useRuntimeConfig()
        const apiBaseUrl = config.public.apiBaseUrl as string
        await $fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        })
      } catch {
        // Still clear local state and redirect even if API fails (e.g. already 401)
      } finally {
        this.user = null
        this.token = null
        this.status = 'idle'

        const roomsStore = useRoomsStore()
        const invoicesStore = useInvoicesStore()
        roomsStore.clearRooms()
        invoicesStore.clearInvoices()

        await navigateTo('/login')
      }
    },

    /**
     * Set token (ใช้หลัง login สำเร็จ)
     */
    setToken(newToken: string) {
      this.token = newToken
    },
  },
})
