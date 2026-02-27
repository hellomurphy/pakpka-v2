// stores/property.ts
import { defineStore } from "pinia";
import { useHttpClient } from "~/composables/useHttpClient"; // 1. Import HttpClient
import type { PropertySummaryDto } from "@pakpak/types";

const ACTIVE_PROPERTY_ID_STORAGE_KEY = "pakpak-active-property-id";

export const usePropertyStore = defineStore("property", {
  state: () => ({
    properties: [] as PropertySummaryDto[],
    activePropertyId: null as string | null,
    status: "idle" as "idle" | "pending" | "success" | "error",
  }),

  getters: {
    isLoading: (state) => state.status === "pending",
    activeProperty: (state): PropertySummaryDto | undefined => {
      if (!state.activePropertyId) return undefined;
      return state.properties.find((p) => p.id === state.activePropertyId);
    },
  },

  actions: {
    async fetchProperties() {
      if (this.properties.length > 0 && this.status === "success") return;

      // 2. เรียกใช้ HttpClient
      const http = useHttpClient();
      this.status = "pending";

      try {
        // 3. เปลี่ยนจาก $fetch เป็น http
        const propertyList = await http<PropertySummaryDto[]>("/properties");
        this.properties = propertyList;

        if (!this.activePropertyId && propertyList.length > 0) {
          this.setActiveProperty(propertyList[0].id);
        }

        this.status = "success";
      } catch (e) {
        // 4. จัดการแค่ status ของตัวเอง ที่เหลือ httpClient จัดการให้
        this.status = "error";
        console.error("Failed to fetch properties in store action", e);
      }
    },

    setActiveProperty(propertyId: string | null) {
      this.activePropertyId = propertyId;
      if (import.meta.client && propertyId) {
        localStorage.setItem(ACTIVE_PROPERTY_ID_STORAGE_KEY, propertyId);
      } else if (import.meta.server) {
        localStorage.removeItem(ACTIVE_PROPERTY_ID_STORAGE_KEY);
      }
    },

    loadActivePropertyFromStorage() {
      if (import.meta.client) {
        const savedId = localStorage.getItem(ACTIVE_PROPERTY_ID_STORAGE_KEY);
        if (savedId) {
          this.activePropertyId = savedId;
        }
      }
    },
  },
});
