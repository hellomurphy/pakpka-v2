import { defineStore } from "pinia";

interface RoomUpdateData {
  floorId?: string;
  roomNumber?: string;
  roomTypeId?: string;
  propertyId?: string; // สำหรับการสร้างห้องใหม่
}

export const useRoomsStore = defineStore("rooms", {
  state: () => {
    return {
      floors: [],
      rooms: [], // เก็บข้อมูลห้องของชั้นที่เลือกอยู่
      roomTypes: [],
      isLoading: false,
      initialFloorId: null as string | null,
    };
  },

  getters: {
    availableRooms: (state) =>
      state.rooms.filter((room: Room) => room.status === RoomStatus.AVAILABLE),
  },

  actions: {
    /**
     * ✨ Action 1: ดึงข้อมูลเริ่มต้นสำหรับหน้า (ทำครั้งเดียว)
     */
    async fetchInitialPageData(propertyId: string) {
      if (!propertyId) return;

      this.isLoading = true;
      try {
        const response = await useApiFetch(
          `/api/rooms/page-init?propertyId=${propertyId}`,
          {
            showNotification: false,
          }
        );

        if (response.data) {
          this.floors = response.data.floors;
          this.roomTypes = response.data.roomTypes;
          this.rooms = response.data.rooms;
          this.initialFloorId = response.data.initialFloorId;
        }
      } catch (error) {
        useNotification().showError("ไม่สามารถโหลดข้อมูลเริ่มต้นได้");
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * ✨ Action 2: ดึงข้อมูลห้องสำหรับชั้นที่เลือก
     */
    async fetchRoomsForFloor(propertyId: string, floorId: string) {
      if (!propertyId || !floorId) return;

      this.isLoading = true;
      try {
        const response = await useApiFetch(
          `/api/rooms?propertyId=${propertyId}&floorId=${floorId}`,
          {
            showNotification: false,
          }
        );

        if (response.data) {
          this.rooms = response.data || [];
        }
      } catch (error) {
        useNotification().showError("ไม่สามารถโหลดข้อมูลห้องได้");
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * เพิ่มห้องพักใหม่
     * @param roomData - ข้อมูลห้องจากฟอร์ม (floorId, roomNumber, roomTypeId)
     * @param propertyId - ID ของ Property ปัจจุบัน
     */
    async addRoom(roomData: RoomUpdateData, propertyId: string) {
      // ✨ ใช้ useApiFetch เพื่อยิง API และจัดการ Notification
      await useApiFetch("/api/rooms", {
        method: "POST",
        body: {
          ...roomData,
          propertyId: propertyId,
        },
      });

      // ✨ Best Practice: หลังจากสร้างสำเร็จ ให้ดึงข้อมูลใหม่ทั้งหมด
      // เพื่อให้ UI อัปเดตถูกต้อง 100% (รวมถึงการเรียงลำดับ)
      await this.fetchRoomsForFloor(propertyId, roomData.floorId);
    },

    /**
     * อัปเดตข้อมูลห้องพัก
     * @param roomId - ID ของห้องที่ต้องการแก้ไข
     * @param roomData - ข้อมูลใหม่ (floorId, roomNumber, roomTypeId)
     * @param propertyId - ID ของ Property ปัจจุบัน
     * @param currentFloorId - ID ของชั้นที่กำลังดูอยู่ (สำหรับ re-fetch)
     */
    async updateRoom(
      roomId: string,
      roomData: RoomUpdateData,
      propertyId: string,
      currentFloorId: string
    ) {
      await useApiFetch(`/api/rooms/${roomId}`, {
        method: "PUT",
        body: roomData,
      });

      // ✨ Re-fetch ข้อมูลของชั้นที่กำลังดูอยู่เพื่อให้ UI อัปเดต
      await this.fetchRoomsForFloor(propertyId, currentFloorId);
    },

    /**
     * ลบห้องพัก
     * @param roomId - ID ของห้องที่ต้องการลบ
     * @param propertyId - ID ของ Property ปัจจุบัน
     * @param currentFloorId - ID ของชั้นที่กำลังดูอยู่ (สำหรับ re-fetch)
     */
    async deleteRoom(
      roomId: string,
      propertyId: string,
      currentFloorId: string
    ) {
      await useApiFetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
        successMessage: "ลบห้องพักสำเร็จ",
      });

      // ✨ Re-fetch ข้อมูลของชั้นที่กำลังดูอยู่เพื่อให้ UI อัปเดต
      await this.fetchRoomsForFloor(propertyId, currentFloorId);
    },

    async updateRoomStatus(
      roomId: string,
      status: RoomStatus,
      propertyId: string,
      currentFloorId: string
    ) {
      await useApiFetch(`/api/rooms/${roomId}/status`, {
        method: "PUT",
        body: { status },
        successMessage: `อัปเดตสถานะห้องเป็น "${status.toLowerCase()}" สำเร็จ`,
      });

      // Re-fetch ข้อมูลเพื่อให้ UI อัปเดต
      await this.fetchRoomsForFloor(propertyId, currentFloorId);
    },

    /**
     * Sync โครงสร้างห้องทั้งหมด
     * @param propertyId - ID ของ Property
     * @param floorsData - Array ของ floors พร้อม rooms ที่เป็น "พิมพ์เขียว"
     */
    async syncRooms(propertyId: string, floorsData: any[]) {
      return await useApiFetch(`/api/properties/${propertyId}/sync-rooms`, {
        method: "POST",
        body: {
          floors: floorsData,
        },
      });
    },
  },
});
