import { defineStore } from "pinia";
import { useNotification } from "~/composables/useNotification";
// Type สำหรับ Property (ข้อมูลพื้นฐานจาก Property table)
interface Property {
  id: string;
  name: string;
  // Settings fields
  roomNamingFormat: string;
  roomTurnoverDays: number;
  contractEndingSoonDays: number;
  // Billing defaults
  defaultWaterBillingType: string;
  defaultWaterRate: number;
  defaultWaterMinimumCharge: number;
  defaultElectricityBillingType: string;
  defaultElectricityRate: number;
  defaultElectricityMinimumCharge: number;
  defaultBillingCutoffDay: number;
  defaultPaymentDueDays: number;
  // Late fee settings
  lateFeeEnabled: boolean;
  lateFeeType: string;
  lateFeeValue: number;
}

// Key สำหรับ Local Storage
const ACTIVE_PROPERTY_ID_KEY = "prop_pakdee_place_01";

export const usePropertyStore = defineStore("property", {
  // --- STATE ---
  // สถานะของ Store ไม่มีการเปลี่ยนแปลง
  state: () => ({
    allProperties: [] as Property[],
    activeProperty: null as Property | null,
    isLoading: false,
  }),

  // --- GETTERS ---
  // Getters ไม่มีการเปลี่ยนแปลง
  getters: {
    isSessionInitialized: (state) => !!state.activeProperty,
    propertyId: (state) => state.activeProperty?.id,
  },

  // --- ACTIONS ---
  actions: {
    /**
     * ✨ Action ใหม่: มีหน้าที่รับข้อมูล Properties มาตั้งค่า State เท่านั้น
     * Action นี้จะถูกเรียกใช้โดย Plugin หลังจากที่ดึงข้อมูล Session สำเร็จแล้ว
     * @param properties - Array ของ properties ที่ได้มาจาก API
     */
    setInitialProperties(properties: Property[]) {
      this.allProperties = properties;

      if (properties.length === 0) {
        useNotification().showError("ไม่พบข้อมูลหอพักสำหรับบัญชีนี้");
        this.activeProperty = null;
        return;
      }

      const savedId = localStorage.getItem(ACTIVE_PROPERTY_ID_KEY);
      const savedPropertyIsValid = properties.some((p) => p.id === savedId);

      if (savedId && savedPropertyIsValid) {
        // ถ้ามี ID ที่ถูกต้องบันทึกไว้ ให้ใช้ ID นั้น
        this.setActiveProperty(savedId);
      } else {
        // ถ้าไม่มี ให้ใช้ default (อันแรก)
        this.setActiveProperty(properties[0].id);
      }
    },

    /**
     * ✨ Action สำหรับสลับ Property ที่ใช้งานอยู่
     * @param propertyId - ID ของ Property ที่ต้องการจะสลับไปใช้
     */
    setActiveProperty(propertyId: string) {
      // เพิ่มการตรวจสอบว่า propertyId ที่ส่งเข้ามามีอยู่ในลิสต์ของผู้ใช้จริงหรือไม่
      const newActive = this.allProperties.find((p) => p.id === propertyId);

      if (newActive) {
        this.activeProperty = newActive;
        localStorage.setItem(ACTIVE_PROPERTY_ID_KEY, propertyId);
      } else {
        console.error(
          `Attempted to set an invalid active property ID: ${propertyId}`
        );
        useNotification().showError("เกิดข้อผิดพลาดในการเลือกหอพัก");
      }
    },

    async updateProperty(item: Partial<Property>) {
      if (!this.activeProperty) return;

      try {
        const url = `/api/properties/${this.activeProperty.id}`;
        console.log(url)
        const res = await useApiFetch<{ success: boolean }>(url, {
          method: "PUT",
          body: item,
        });

        console.log("Update response:", res);

        if (res?.success) {
          this.activeProperty = { ...this.activeProperty, ...item };
        }
      } catch (error) {
        console.error("Error updating property:", error);
      }
    },

    /**
     * ✨ Action สำหรับเคลียร์ State (จะถูกเรียกตอน Logout)
     */
    clearProperties() {
      this.activeProperty = null;
      this.allProperties = [];
      localStorage.removeItem(ACTIVE_PROPERTY_ID_KEY);
    },
  },
});
