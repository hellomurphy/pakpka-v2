import { defineStore } from 'pinia'
import { useApiFetch } from '~/composables/useApiFetch'

export const useInvoicesStore = defineStore('invoices', {
  state: () => ({
    isLoading: false,
  }),
  actions: {
    /**
     * ✨ Action ใหม่: อัปเดตการจดมิเตอร์และคำนวณบิลใหม่
     * @param meterReadingId - ID ของ MeterReading ที่ต้องการแก้ไข
     * @param data - ข้อมูลใหม่ { readingValue: number }
     */
    async updateMeterReading(meterReadingId: string, data: { readingValue: number }) {
      this.isLoading = true
      try {
        const response = await useApiFetch(`/api/meter-readings/${meterReadingId}`, {
          method: 'PUT',
          body: data,
          successMessage: 'อัปเดตข้อมูลมิเตอร์และคำนวณบิลใหม่สำเร็จ',
        })
        return response
      } finally {
        this.isLoading = false
      }
    },
    /**
     * อัปเดตข้อมูลใบแจ้งหนี้ (Invoice)
     * @param invoiceId - ID ของใบแจ้งหนี้ที่ต้องการแก้ไข
     * @param invoiceData - ข้อมูลใหม่ทั้งหมดของใบแจ้งหนี้
     */
    async updateInvoice(invoiceId: string, invoiceData: Record<string, unknown>) {
      this.isLoading = true
      try {
        const response = await useApiFetch(`/api/invoices/${invoiceId}`, {
          method: 'PUT',
          body: invoiceData,
          successMessage: 'บันทึกการแก้ไขใบแจ้งหนี้สำเร็จ',
        })
        return response
      } finally {
        this.isLoading = false
      }
    },
  },
})
