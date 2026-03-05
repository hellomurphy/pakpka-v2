import { defineStore } from 'pinia'
import { useApiFetch } from '~/composables/useApiFetch'

interface ServiceCreateData {
  name: string
  defaultPrice: number
  billingCycle: string
  isOptional: boolean
}

interface ServiceUpdateData {
  name?: string
  defaultPrice?: number
  billingCycle?: string
  isOptional?: boolean
}

export const useServicesStore = defineStore('services', {
  state: () => ({
    services: [] as Record<string, unknown>[],
    isLoading: false,
  }),
  actions: {
    async fetchServices(propertyId: string) {
      if (!propertyId) return
      this.isLoading = true
      try {
        const response = await useApiFetch(`/api/services?propertyId=${propertyId}`, {
          showNotification: false,
        })
        if (response.success && response.data) {
          this.services = response.data
        }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * เพิ่มบริการใหม่ในแคตตาล็อก
     */
    async addService(serviceData: ServiceCreateData, propertyId: string) {
      const response = await useApiFetch('/api/services', {
        method: 'POST',
        body: { ...serviceData, propertyId },
      })
      if (response.success) {
        await this.fetchServices(propertyId) // Re-fetch
      }
      return response
    },

    /**
     * อัปเดตบริการที่มีอยู่
     */
    async updateService(serviceId: string, serviceData: ServiceUpdateData, propertyId: string) {
      const response = await useApiFetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        body: serviceData,
      })
      if (response.success) {
        await this.fetchServices(propertyId) // Re-fetch
      }
      return response
    },

    /**
     * ลบบริการออกจากแคตตาล็อก
     */
    async deleteService(serviceId: string) {
      const response = await useApiFetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      })

      return response
    },

    async addServiceToContract(
      contractId: string,
      data: { serviceId: string; customPrice?: number },
    ) {
      return await useApiFetch(`/api/contracts/${contractId}/services`, {
        method: 'POST',
        body: data,
      })
    },

    /**
     * ลบบริการเสริมออกจากสัญญา
     */
    async removeServiceFromContract(contractServiceId: string) {
      return await useApiFetch(`/api/contract-services/${contractServiceId}`, {
        method: 'DELETE',
        successMessage: 'ลบบริการเสริมสำเร็จ',
      })
    },
  },
})
