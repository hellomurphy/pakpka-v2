import { defineStore } from 'pinia'
import { useApiFetch } from '~/composables/useApiFetch'
import { usePropertyStore } from './propertyStore'

interface FetchPaymentsParams {
  propertyId: string
  page?: number
  limit?: number
}

export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    pendingPayments: [], // ✨ 2. ใช้ Type ที่เราสร้างขึ้น
    isLoading: false,
    totalPending: 0,
    itemsPerPage: 15,
  }),
  actions: {
    /**
     * ดึงรายการชำระเงินที่ต้องตรวจสอบ (สถานะ PENDING)
     */
    async fetchPendingPayments(params: FetchPaymentsParams) {
      if (!params.propertyId) return
      this.isLoading = true
      try {
        const query = new URLSearchParams({
          propertyId: params.propertyId,
          page: (params.page || 1).toString(),
          limit: (params.limit || this.itemsPerPage).toString(),
        })

        // ✨ แก้ไข endpoint ให้ถูกต้องตามที่เราเคยทำ
        const response = await useApiFetch(`/api/payments/pending?${query.toString()}`, {
          showNotification: false,
        })
        if (response.success && response.data) {
          this.pendingPayments = response.data.payments
          this.totalPending = response.data.total
        }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * ยืนยันการชำระเงิน
     */
    async approvePayment(paymentId: string) {
      const response = await useApiFetch(`/api/payments/${paymentId}/approve`, {
        method: 'POST',
        successMessage: 'ยืนยันการชำระเงินสำเร็จ',
      })

      // ✨ 3. เพิ่ม Logic การจัดการ State (Optimistic UI)
      if (response.success) {
        this.pendingPayments = this.pendingPayments.filter((p) => p.id !== paymentId)
        this.totalPending--
      }
      return response
    },

    /**
     * ปฏิเสธการชำระเงิน
     */
    async rejectPayment(paymentId: string, reason: string) {
      const response = await useApiFetch(`/api/payments/${paymentId}/reject`, {
        method: 'POST',
        body: { reason },
        successMessage: 'ปฏิเสธการชำระเงินสำเร็จ',
      })

      // ✨ 3. เพิ่ม Logic การจัดการ State (Optimistic UI)
      if (response.success) {
        this.pendingPayments = this.pendingPayments.filter((p) => p.id !== paymentId)
        this.totalPending--
      }
      return response
    },

    /**
     * สร้างข้อมูลทดสอบ (ฟังก์ชันนี้ดีอยู่แล้ว)
     */
    async generateDemoPayments() {
      const propertyStore = usePropertyStore()
      if (!propertyStore.propertyId) return
      return await useApiFetch('/api/dev/generate-payments', {
        method: 'POST',
        body: { propertyId: propertyStore.propertyId },
      })
    },
  },
})
