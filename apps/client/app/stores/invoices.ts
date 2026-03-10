// stores/invoices.ts
import { defineStore } from 'pinia'
import type { Invoice, Payment } from '@repo/db'

export const useInvoicesStore = defineStore('invoices', {
  state: () => ({
    invoices: [] as Invoice[],
    currentInvoice: null as Invoice | null,
    payments: [] as Payment[],
    status: 'idle' as 'idle' | 'pending' | 'success' | 'error',
    paymentStatus: 'idle' as 'idle' | 'pending' | 'success' | 'error',
  }),

  getters: {
    isLoading: (state) => state.status === 'pending',
    isSubmittingPayment: (state) => state.paymentStatus === 'pending',

    /**
     * ใบแจ้งหนี้ที่ค้างชำระ
     */
    unpaidInvoices: (state) =>
      state.invoices.filter((inv) => inv.status === 'UNPAID' || inv.status === 'OVERDUE'),

    /**
     * ยอดค้างชำระรวม (บังคับเป็น number เผื่อ backend ส่ง totalAmount เป็น string)
     */
    totalOutstanding: (state) =>
      state.invoices
        .filter((inv) => inv.status === 'UNPAID' || inv.status === 'OVERDUE')
        .reduce((sum, inv) => sum + Number(inv.totalAmount ?? 0), 0),

    /**
     * ใบแจ้งหนี้ที่เกินกำหนด
     */
    overdueInvoices: (state) => state.invoices.filter((inv) => inv.status === 'OVERDUE'),
  },

  actions: {
    /**
     * ดึงรายการใบแจ้งหนี้ทั้งหมด
     */
    async fetchInvoices(params?: { year?: string; status?: string }) {
      const api = useApi()
      this.status = 'pending'

      try {
        // ถ้า status มีหลายค่า (เช่น "UNPAID,OVERDUE") ให้แยกเป็นหลาย request
        if (params?.status?.includes(',')) {
          const statuses = params.status.split(',')
          const responses = await Promise.all(
            statuses.map((status) => api.invoices.getMy({ ...params, status: status.trim() })),
          )

          // รวม invoices จากทุก response
          this.invoices = responses.flatMap((res) => res.data?.invoices || [])
        } else {
          const response = await api.invoices.getMy(params)
          this.invoices = response.data?.invoices || []
        }

        console.log('📋 Fetched invoices:', this.invoices)
        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.invoices = []
        console.error('Failed to fetch invoices:', error)
      }
    },

    /**
     * ดึงใบแจ้งหนี้ปัจจุบันที่ค้างชำระ
     */
    async fetchCurrentInvoice() {
      const api = useApi()
      this.status = 'pending'

      try {
        const response = await api.invoices.getCurrent()
        this.currentInvoice = response.data
        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.currentInvoice = null
        console.error('Failed to fetch current invoice:', error)
      }
    },

    /**
     * ดึงข้อมูลใบแจ้งหนี้เฉพาะ ID
     */
    async fetchInvoice(invoiceId: string) {
      const api = useApi()
      this.status = 'pending'

      try {
        const response = await api.invoices.get(invoiceId)
        this.currentInvoice = response.data
        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.currentInvoice = null
        console.error('Failed to fetch invoice:', error)
      }
    },

    /**
     * สร้างรายการชำระเงินและอัปโหลดสลิป (create payment แล้ว upload slip)
     */
    async submitPayment(
      data: {
        invoiceId: string
        amount: number
        paymentDate?: string
        paymentMethod?: string
        notes?: string
      },
      file: File,
    ) {
      const api = useApi()
      const uiStore = useUiStore()
      this.paymentStatus = 'pending'

      try {
        const createRes = await api.payments.create({
          invoiceId: data.invoiceId,
          amount: data.amount,
          paymentDate: data.paymentDate ?? new Date().toISOString(),
          paymentMethod: data.paymentMethod ?? 'BANK_TRANSFER',
          notes: data.notes,
        })
        const paymentId = createRes.data?.id
        if (!paymentId) throw new Error(createRes.message || 'สร้างรายการชำระเงินไม่สำเร็จ')

        await api.payments.uploadSlip(paymentId, file)
        this.paymentStatus = 'success'

        uiStore.showNotification({
          type: 'success',
          message: 'ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว',
        })

        await this.fetchInvoice(data.invoiceId)
      } catch (error) {
        this.paymentStatus = 'error'
        console.error('Failed to submit payment:', error)
        throw error
      }
    },

    /**
     * ดึงประวัติการชำระเงิน
     */
    async fetchPaymentHistory(params?: { year?: string; status?: string }) {
      const api = useApi()

      try {
        const response = await api.payments.getHistory(params)
        this.payments = response.data || []
      } catch (error) {
        this.payments = []
        console.error('Failed to fetch payment history:', error)
      }
    },

    /**
     * Clear state เมื่อ logout
     */
    clearInvoices() {
      this.invoices = []
      this.currentInvoice = null
      this.payments = []
      this.status = 'idle'
      this.paymentStatus = 'idle'
    },
  },
})
