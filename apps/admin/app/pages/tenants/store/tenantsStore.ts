// stores/tenantsStore.ts
import { defineStore } from 'pinia'
import { useApiFetch } from '~/composables/useApiFetch'

interface FetchTenantsParams {
  propertyId: string
  status?: string
  q?: string
  page?: number
  limit?: number
}

export const useTenantsStore = defineStore('tenants', {
  state: () => ({
    tenants: [],
    isLoading: false,
    totalTenants: 0,
    itemsPerPage: 10,
    currentPage: 1,
    counts: {
      ACTIVE: 0,
      UPCOMING: 0,
      NOTICE_GIVEN: 0,
      WAITING_LIST: 0,
      MOVED_OUT: 0,
    },
  }),

  getters: {
    countsByStatus: (state) => {
      const result: Record<string, number> = { ...state.counts }
      state.tenants.forEach((t) => {
        const status = t.status || 'WAITING_LIST'
        result[status] = (result[status] || 0) + 1
      })
      return result
    },
  },

  actions: {
    // ------------------ FETCH TENANTS ------------------
    async fetchTenants(params: FetchTenantsParams) {
      if (!params.propertyId) {
        this.tenants = []
        return
      }

      this.isLoading = true

      try {
        const query = new URLSearchParams({
          propertyId: params.propertyId,
          page: (params.page || 1).toString(),
          limit: (params.limit || this.itemsPerPage).toString(),
        })

        if (params.status && params.status !== 'all') {
          query.append('status', params.status)
        }
        if (params.q) {
          query.append('q', params.q)
        }

        const response = await useApiFetch(`/api/tenants?${query.toString()}`, {
          showNotification: false,
        })

        // ✨ อัปเดต State ทั้งหมดจาก Response ใหม่
        if (response.data) {
          this.tenants = response.data.tenants || []
          this.counts = response.data.counts || this.counts
          this.totalTenants = response.data.total || 0
        }
      } catch {
        this.tenants = []
        this.counts = {}
        this.totalTenants = 0
      } finally {
        this.isLoading = false
      }
    },

    /**
     * ✨ Action ใหม่: สร้างผู้เช่าใหม่ (ทั้งแบบสร้างสัญญาและ Waiting List)
     * @param data - ข้อมูลทั้งหมดจากฟอร์ม AddTenantContractModal
     */
    async createTenant(data: Record<string, unknown>) {
      const response = await useApiFetch('/api/tenants', {
        method: 'POST',
        body: data,
        // successMessage จะถูกดึงมาจาก API response โดยอัตโนมัติ
      })

      // คืนค่าสถานะความสำเร็จเพื่อให้ Modal รู้
      return response
    },

    // ------------------ UPDATE TENANT ------------------
    async updateTenant(tenantId: string, data: { name?: string; phone?: string }) {
      try {
        const url = `/api/tenants/${tenantId}`
        const res = await useApiFetch(url, {
          method: 'PUT',
          body: data,
        })

        if (res.success) {
          this.tenants = this.tenants.map((tenant) =>
            tenant.id === tenantId ? { ...tenant, ...data } : tenant,
          )
        }

        return res
      } catch {
        // store ไม่ต้อง handle notification
      }
    },

    // ------------------ ARCHIVE TENANT ------------------
    async archiveTenant(tenantId: string) {
      try {
        const res = await useApiFetch(`/api/tenants/${tenantId}/archive`, {
          method: 'POST',
          body: {
            status: TenantStatus.MOVED_OUT,
          },
        })

        return res
        // re-fetch เพื่อ sync state
      } catch {
        // store ไม่ต้อง handle notification
      }
    },

    async deleteTenantPermanent(tenantId: string) {
      this.isLoading = true
      try {
        const response = await useApiFetch(`/api/tenants/${tenantId}/permanent`, {
          method: 'DELETE',
          successMessage: 'ลบข้อมูลผู้เช่าอย่างถาวรสำเร็จ',
        })
        return response
      } finally {
        this.isLoading = false
      }
    },
  },
})
