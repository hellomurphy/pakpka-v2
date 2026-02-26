import { defineStore } from "pinia";
import { useApiFetch } from "~/composables/useApiFetch";

export const useReservationsStore = defineStore("reservations", {
  state: () => ({
    isLoading: false,
  }),

  actions: {
    async createReservation(data: {
      propertyId: string;
      roomId: string;
      tenantId: string;
      startDate: Date;
      endDate: Date;
    }) {
      return await useApiFetch("/api/reservations", {
        method: "POST",
        body: data,
      });
    },
    /**
     * ยกเลิกการจอง
     * @param reservationId - ID ของการจองที่ต้องการยกเลิก
     */
    async cancelReservation(reservationId: string) {
      this.isLoading = true;
      try {
        const response = await useApiFetch(
          `/api/reservations/${reservationId}/cancel`,
          {
            method: "POST",
            // ไม่ต้องส่ง body เพราะ API รู้จัก Action จาก URL อยู่แล้ว
          }
        );

        // คืนค่า response เพื่อให้ component รู้ว่าสำเร็จหรือไม่
        return response;
      } finally {
        this.isLoading = false;
      }
    },

    // สามารถเพิ่ม Action อื่นๆ ที่เกี่ยวกับ Reservation ได้ที่นี่
    // async createReservation(data) { ... }
  },
});
