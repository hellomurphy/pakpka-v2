// stores/property.ts
import { defineStore } from 'pinia'
import type { PropertySummaryDto } from '@repo/db'

const ACTIVE_PROPERTY_ID_STORAGE_KEY = 'pakpak-active-property-id'

export const usePropertyStore = defineStore('property', {
  state: () => ({
    properties: [] as PropertySummaryDto[],
    activePropertyId: null as string | null,
    status: 'idle' as 'idle' | 'pending' | 'success' | 'error',
  }),

  getters: {
    isLoading: (state) => state.status === 'pending',
    activeProperty: (state): PropertySummaryDto | undefined => {
      if (!state.activePropertyId) return undefined
      return state.properties.find((p) => p.id === state.activePropertyId)
    },
  },

  actions: {
    /**
     * For tenant: derive properties from profile (no GET /properties).
     * Call profile.get() and set properties to [profile.property] when present.
     */
    async fetchProperties() {
      if (this.properties.length > 0 && this.status === 'success') return

      this.status = 'pending'
      try {
        const api = useApi()
        const res = await api.profile.get()
        const profile = res.data as { property?: { id: string; name: string } } | undefined
        const propertyList: PropertySummaryDto[] = profile?.property
          ? [{ id: profile.property.id, name: profile.property.name }]
          : []
        this.properties = propertyList
        if (!this.activePropertyId && propertyList.length > 0) {
          this.setActiveProperty(propertyList[0].id)
        }
        this.status = 'success'
      } catch (e) {
        this.status = 'error'
        console.error('Failed to fetch properties (from profile)', e)
      }
    },

    setActiveProperty(propertyId: string | null) {
      this.activePropertyId = propertyId
      if (import.meta.client && propertyId) {
        localStorage.setItem(ACTIVE_PROPERTY_ID_STORAGE_KEY, propertyId)
      } else if (import.meta.server) {
        localStorage.removeItem(ACTIVE_PROPERTY_ID_STORAGE_KEY)
      }
    },

    loadActivePropertyFromStorage() {
      if (import.meta.client) {
        const savedId = localStorage.getItem(ACTIVE_PROPERTY_ID_STORAGE_KEY)
        if (savedId) {
          this.activePropertyId = savedId
        }
      }
    },
  },
})
