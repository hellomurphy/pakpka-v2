import { defineStore } from "pinia";
import { usePropertyStore } from "~/store/propertyStore";
import { useApiFetch } from "~/composables/useApiFetch";
import { useRoomsStore } from "~/pages/rooms/store/roomsStore";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    settings: null,
    initialSettings: null,
    isLoading: false,
    isSaving: false,
    showSaveFooter: false,
  }),

  getters: {
    isDirty: (state): boolean => {
      if (!state.settings || !state.initialSettings) return false;
      return (
        JSON.stringify(state.settings) !== JSON.stringify(state.initialSettings)
      );
    },
  },

  actions: {
    /**
     * ดึงข้อมูลการตั้งค่าทั้งหมดของ Property
     */
    async fetchSettings() {
      const propertyStore = usePropertyStore();
      const propertyId = propertyStore.propertyId;
      if (!propertyId) return;

      this.isLoading = true;
      try {
        // ✨ 2. เปลี่ยนมาใช้ useApiFetch
        const response = await useApiFetch(
          `/api/properties/${propertyId}/settings`,
          {
            showNotification: false, // การ fetch ข้อมูลปกติ ไม่ต้องแสดง notification
          }
        );

        if (response) {
          this.settings = response.data;
          this.initialSettings = JSON.parse(JSON.stringify(response.data));
        }
      } catch (error) {
        // useApiFetch จะแสดง Error toast ให้แล้ว
        // เราอาจจะแค่เคลียร์ค่าถ้าต้องการ
        this.settings = null;
        this.initialSettings = null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * บันทึกการเปลี่ยนแปลงทั้งหมด
     */
    async saveSettings() {
      if (!this.isDirty || !this.settings || !this.initialSettings) return;

      const propertyStore = usePropertyStore();
      const propertyId = propertyStore.propertyId;
      if (!propertyId) return;

      this.isSaving = true;
      const { showSuccess, showError } = useNotification();
      const promises = [];

      // ✨ 1. สร้างฟังก์ชัน "ตัวแปลง" ข้อมูล
      const transformSettingsForApi = (settingsObject: any) => {
        return {
          name: settingsObject.name,
          roomNamingFormat: settingsObject.roomNamingFormat,
          roomTurnoverDays: settingsObject.roomTurnoverDays,
          // --- แปลงข้อมูล Finance ---
          defaultWaterBillingType: settingsObject.finance.utilities.water.type,
          defaultWaterRate: settingsObject.finance.utilities.water.rate,
          defaultWaterMinimumCharge:
            settingsObject.finance.utilities.water.minimumCharge,

          defaultElectricityBillingType:
            settingsObject.finance.utilities.electricity.type,
          defaultElectricityRate:
            settingsObject.finance.utilities.electricity.rate,
          defaultElectricityMinimumCharge:
            settingsObject.finance.utilities.electricity.minimumCharge,

          lateFeeEnabled: settingsObject.finance.lateFee.enabled,
          lateFeeType: settingsObject.finance.lateFee.type,
          lateFeeValue: settingsObject.finance.lateFee.value,

          defaultBillingCutoffDay:
            settingsObject.finance.billingCycle.cutoffDay,
          defaultPaymentDueDays: settingsObject.finance.billingCycle.dueDays,
        };
      };

      const initialInfoPayload = transformSettingsForApi(this.initialSettings);
      const currentInfoPayload = transformSettingsForApi(this.settings);

      if (
        JSON.stringify(initialInfoPayload) !==
        JSON.stringify(currentInfoPayload)
      ) {
        promises.push(
          useApiFetch(`/api/properties/${propertyId}`, {
            method: "PUT",
            body: currentInfoPayload,
          })
        );
      }

      // ✨ 3. เปรียบเทียบข้อมูลโครงสร้างห้อง (Floors & Rooms)
      const roomsStore = useRoomsStore();
      const initialFloors = JSON.stringify(this.initialSettings.floors);
      const currentFloors = JSON.stringify(this.settings.floors);

      if (initialFloors !== currentFloors) {
        promises.push(roomsStore.syncRooms(propertyId, this.settings.floors));
      }

      // --- (สามารถเพิ่มการเปรียบเทียบส่วนอื่นๆ ได้ที่นี่) ---

      try {
        if (promises.length === 0) {
          // กรณีนี้ไม่ควรเกิดขึ้นเพราะมี isDirty check อยู่แล้ว แต่ใส่ไว้เพื่อความปลอดภัย
          showSuccess("ไม่มีอะไรเปลี่ยนแปลง");
          return;
        }

        // ✨ 4. รันทุก "งาน" ที่มีการเปลี่ยนแปลงพร้อมกัน
        const results = await Promise.all(promises);

        // เช็คว่าทุก promise สำเร็จหรือไม่
        if (results.every((res) => res.success)) {
          // เมื่อทุกอย่างสำเร็จ ให้ fetch ข้อมูลทั้งหมดมาใหม่เพื่อรีเซ็ต isDirty
          await this.fetchSettings();
        }
      } catch (error) {
        // useApiFetch จะแสดง Notification เอง แต่เราอาจจะ log error เพิ่มเติม
        console.error("Failed to save settings:", error);
      } finally {
        this.isSaving = false;
      }
    },

    async updateFloorStructure(propertyId: string, totalFloors: number) {
      this.isSaving = true; // ใช้ isSaving ร่วมกันได้
      try {
        const response = await useApiFetch(
          `/api/properties/${propertyId}/floors`,
          {
            method: "POST",
            body: { totalFloors },
          }
        );

        if (response.success) {
          await this.fetchSettings();
        }
        return response;
      } finally {
        this.isSaving = false;
      }
    },

    /**
     * เพิ่มประเภทห้องใหม่
     */
    async addRoomType(roomTypeData: object) {
      const propertyStore = usePropertyStore();
      try {
        await useApiFetch("/api/room-types", {
          method: "POST",
          body: { ...roomTypeData, propertyId: propertyStore.propertyId },
          successMessage: "เพิ่มประเภทห้องใหม่สำเร็จ",
        });
        await this.fetchSettings(); // ดึงข้อมูลใหม่ทั้งหมดเพื่อให้ UI อัปเดต
      } catch (error) {
        /* Error handled by useApiFetch */
      }
    },

    /**
     * แก้ไขประเภทห้อง
     */
    async updateRoomType(roomTypeId: string, roomTypeData: object) {
      try {
        await useApiFetch(`/api/room-types/${roomTypeId}`, {
          method: "PUT",
          body: roomTypeData,
          successMessage: "แก้ไขประเภทห้องสำเร็จ",
        });
        await this.fetchSettings();
      } catch (error) {
        /* Error handled by useApiFetch */
      }
    },

    /**
     * ลบประเภทห้อง
     */
    async deleteRoomType(roomTypeId: string) {
      try {
        await useApiFetch(`/api/room-types/${roomTypeId}`, {
          method: "DELETE",
          successMessage: "ลบประเภทห้องสำเร็จ",
        });
        await this.fetchSettings();
      } catch (error) {
        /* Error handled by useApiFetch */
      }
    },

    revertChanges() {
      if (this.initialSettings) {
        this.settings = JSON.parse(JSON.stringify(this.initialSettings));
      }
    },

    clearSettings() {
      this.settings = null;
      this.initialSettings = null;
    },

    setShowSaveFooter(shouldShow: boolean) {
      this.showSaveFooter = shouldShow;
    },
  },
});
