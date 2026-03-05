import { defineStore } from 'pinia'
import { useApiFetch } from '~/composables/useApiFetch'
import { usePropertyStore } from '~/store/propertyStore' // ✨ Import propertyStore

// กำหนด Type สำหรับข้อมูลที่จะส่งไปสร้างหรืออัปเดต
type AccountPayloadDetails = {
  bankName?: string
  accountName?: string
  accountNumber?: string
  recipientName?: string
  promptpayNumber?: string
}

type AccountPayload = {
  type?: 'BANK_ACCOUNT' | 'PROMPTPAY'
  details?: AccountPayloadDetails
  isActive?: boolean
}

export const useReceivingAccountsStore = defineStore('receivingAccounts', {
  state: () => ({
    accounts: [],
    isLoading: false,
  }),

  getters: {
    bankAccounts: (state) => state.accounts.filter((a) => a.type === 'BANK_ACCOUNT'),
    promptPayAccounts: (state) => state.accounts.filter((a) => a.type === 'PROMPTPAY'),
  },

  actions: {
    /**
     * READ: ดึงข้อมูลบัญชีทั้งหมด (ไม่มีการเปลี่ยนแปลง)
     */
    async fetchAccounts(propertyId: string) {
      if (!propertyId) return
      this.isLoading = true
      try {
        const response = await useApiFetch(`/api/receiving-accounts?propertyId=${propertyId}`, {
          showNotification: false,
        })
        if (response.success) {
          this.accounts = response.data
        }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * ✨ CREATE: สร้างบัญชีใหม่ (ปรับปรุงเป็น Optimistic UI)
     */
    async createAccount(data: { type: string; details: AccountPayloadDetails }) {
      const propertyStore = usePropertyStore()
      const response = await useApiFetch('/api/receiving-accounts', {
        method: 'POST',
        body: { ...data, propertyId: propertyStore.propertyId },
      })

      if (response.success) {
        // แทนที่จะ fetch ใหม่ทั้งหมด เราเพิ่มข้อมูลใหม่เข้าไปใน state ทันที
        this.accounts.push(response.data)
      }
      return response
    },

    /**
     * ✨ UPDATE: อัปเดตข้อมูลบัญชี (ปรับปรุงเป็น Optimistic UI)
     */
    async updateAccount(accountId: string, data: AccountPayload) {
      const response = await useApiFetch(`/api/receiving-accounts/${accountId}`, {
        method: 'PUT',
        body: data,
      })
      if (response.success) {
        // ค้นหา index ของรายการที่ต้องการแก้ไข
        const index = this.accounts.findIndex((acc) => acc.id === accountId)
        if (index !== -1) {
          // อัปเดตข้อมูลใน state ด้วยข้อมูลล่าสุดจาก API
          this.accounts[index] = response.data
        }
      }
      return response
    },

    /**
     * ✨ DELETE: ลบบัญชี (ปรับปรุงเป็น Optimistic UI)
     */
    async deleteAccount(accountId: string) {
      const response = await useApiFetch(`/api/receiving-accounts/${accountId}`, {
        method: 'DELETE',
      })
      if (response.success) {
        // กรองรายการที่ถูกลบออกจาก state ทันที
        this.accounts = this.accounts.filter((acc) => acc.id !== accountId)
      }
      return response
    },
  },
})
