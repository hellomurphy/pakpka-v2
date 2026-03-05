import { defineStore } from 'pinia'
import { useApiFetch } from '~/composables/useApiFetch'
import { useRouter } from 'vue-router'
import { usePropertyStore } from './propertyStore'

// สร้าง Type สำหรับ State ที่ซับซ้อน
interface BillingRun {
  id: string
  period: string
}

type BillingView = 'overview' | 'summary' | 'meterReading'

export const useBillingStore = defineStore('billing', {
  state: () => ({
    billingRuns: [] as Record<string, unknown>[], // เก็บข้อมูลสรุปของทุกรอบบิล
    activeRun: null as BillingRun | null, // เก็บข้อมูลรอบบิลที่กำลังทำงานอยู่
    isLoading: false,
    currentView: 'overview' as BillingView,
    meterReadingList: [],
    invoicesForReview: [],
    totalInvoicesForReview: 10,
  }),

  actions: {
    /**
     * ดึงข้อมูลสรุปของรอบบิลทั้งหมดสำหรับหน้า Overview
     */
    async fetchBillingRuns(propertyId: string) {
      this.isLoading = true
      try {
        const response = await useApiFetch(`/api/billing-runs?propertyId=${propertyId}`, {
          showNotification: false,
        })

        if (response.success) {
          this.billingRuns = response.data
        }
      } finally {
        this.isLoading = false
      }
    },

    async findLatestRunId(): Promise<string | null> {
      const propertyStore = usePropertyStore()
      if (!propertyStore.propertyId) {
        console.error('findLatestRunId: propertyId is not available.')
        return null
      }

      try {
        const response = await useApiFetch(
          `/api/billing-runs/latest?propertyId=${propertyStore.propertyId}`,
          { showNotification: false },
        )

        // ถ้า API ทำงานสำเร็จ และมีข้อมูล (data is not null) และมี id
        if (response.success && response.data?.id) {
          return response.data.id
        }

        return null // ไม่พบรอบบิล
      } catch (error) {
        console.error('Failed to fetch latest billing run ID:', error)
        return null
      }
    },

    async fetchActiveRun(runId: string) {
      this.isLoading = true
      try {
        const response = await useApiFetch(`/api/billing-runs/${runId}`, {
          showNotification: false,
        })
        if (response.success) {
          this.activeRun = response.data
        }
      } finally {
        this.isLoading = false
      }
    },

    async fetchMeterReadingList(runId: string) {
      this.isLoading = true
      try {
        const response = await useApiFetch(`/api/billing-runs/${runId}/meter-readings`, {
          showNotification: false,
        })
        if (response.success) {
          this.meterReadingList = response.data
        }
      } finally {
        this.isLoading = false
      }
    },

    async fetchInvoicesForReview(runId: string, params: Record<string, string | number | boolean>) {
      this.isLoading = true
      const query = new URLSearchParams(params)
      try {
        const response = await useApiFetch(
          `/api/billing-runs/${runId}/invoices?${query.toString()}`,
          {
            showNotification: false,
          },
        )
        if (response.success) {
          this.invoicesForReview = response.data.invoices
          this.totalInvoicesForReview = response.data.total
        }
      } finally {
        this.isLoading = false
      }
    },

    async saveMeterReadings(runId: string, readings: Record<string, unknown>[]) {
      const response = await useApiFetch(`/api/billing-runs/${runId}/meter-readings`, {
        method: 'POST',
        body: { readings },
        successMessage: 'บันทึกข้อมูลมิเตอร์และคำนวณบิลสำเร็จ',
      })
      return response
    },

    async saveSingleMeterReading(readingData: {
      invoiceId: string
      newElec: number
      newWater: number
    }) {
      const { invoiceId, newElec, newWater } = readingData

      return await useApiFetch(`/api/invoices/${invoiceId}/meter-reading`, {
        method: 'PUT',
        body: { newElec, newWater },
        // เราจะไม่แสดง notification จากที่นี่ แต่จะให้ component จัดการเอง
        showNotification: false,
      })
    },

    /**
     * ✨ ACTION ใหม่: ส่งใบแจ้งหนี้ฉบับเดียว
     * @param invoiceId - ID ของใบแจ้งหนี้ที่ต้องการส่ง
     */
    async sendSingleInvoice(invoiceId: string) {
      // เราจะใช้ POST method เพราะเป็นการสั่งให้เกิด Action (การส่ง)
      return await useApiFetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST',
        successMessage: 'ส่งใบแจ้งหนี้เรียบร้อยแล้ว',
      })
    },

    /**
     * ✨ ACTION ใหม่: ส่งใบแจ้งหนี้ที่พร้อมส่งทั้งหมด (ตามที่กรองมา)
     * @param runId - ID ของรอบบิล
     * @param invoiceIds - Array ของ Invoice IDs ที่ต้องการส่ง
     */
    async sendReadyInvoices(runId: string, invoiceIds: string[]) {
      this.isLoading = true
      try {
        return await useApiFetch(`/api/billing-runs/${runId}/send`, {
          method: 'POST',
          body: { invoiceIds },
          successMessage: `ส่งใบแจ้งหนี้ ${invoiceIds.length} ฉบับสำเร็จ`,
        })
      } finally {
        this.isLoading = false
      }
    },

    async sendAllInvoices(runId: string) {
      this.isLoading = true
      try {
        return await useApiFetch(`/api/billing-runs/${runId}/send`, {
          method: 'POST',
          successMessage: 'ส่งใบแจ้งหนี้ทั้งหมดสำเร็จ',
        })
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Action ที่ถูกเรียกจาก Modal เพื่อเริ่มสร้างรอบบิลใหม่
     */
    async createBillingRun(propertyId: string, period: string) {
      console.log('Creating Billing Run for', propertyId, period)
      // isLoading จะถูกจัดการใน Component ที่เรียกใช้ Modal
      const response = await useApiFetch('/api/billing-runs', {
        method: 'POST',
        body: { propertyId, period },
      })

      if (response.success) {
        this.activeRun = response.data
        this.currentView = 'summary' // ✨ เปลี่ยน View ไปที่หน้าสรุป
      }
      return response
    },

    /**
     * Action สำหรับตั้งค่า Active Run (ใช้ตอนที่ Modal emit 'success')
     */
    setActiveRun(runData: BillingRun) {
      this.activeRun = runData
      this.currentView = 'summary'
    },

    /**
     * Action สำหรับเปลี่ยน View ภายใน Wizard
     */
    changeView(view: BillingView) {
      this.currentView = view
    },

    /**
     * Action สำหรับกลับไปหน้า Overview
     */
    resetView() {
      this.currentView = 'overview'
      this.activeRun = null
      // (Optional) อาจจะ re-fetch billingRuns ใหม่
    },

    /**
     * Action สำหรับนำทางไปยังหน้า Review
     */
    goToReviewPage() {
      if (!this.activeRun) return
      const router = useRouter()
      router.push(`/billing/run/${this.activeRun.id}/review`)
    },
  },
})
