import { defineStore } from "pinia";
import { useApiFetch } from "~/composables/useApiFetch";
import { usePropertyStore } from "~/store/propertyStore";

export const useStaffStore = defineStore("staff", {
  state: () => ({
    staff: [] as any[],
    invitations: [] as any[],
    isLoading: false,
  }),
  actions: {
    /**
     * ดึงข้อมูลทีมงานและคำเชิญทั้งหมด
     */
    async fetchStaffAndInvitations(propertyId: string) {
      if (!propertyId) return;
      this.isLoading = true;
      try {
        const response = await useApiFetch(
          `/api/properties/${propertyId}/staff`,
          {
            showNotification: false,
          }
        );
        if (response.success && response.data) {
          this.staff = response.data.staff;
          this.invitations = response.data.invitations;
        }
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * สร้างคำเชิญใหม่
     */
    async createInvitation(data: {
      nameForReference: string;
      role: "ADMIN" | "STAFF";
    }) {
      const propertyStore = usePropertyStore();
      const response = await useApiFetch("/api/invitations", {
        method: "POST",
        body: { ...data, propertyId: propertyStore.propertyId },
      });
      if (response.success) {
        this.invitations.push(response.data); // Optimistic UI
      }
      return response;
    },

    /**
     * ยกเลิกคำเชิญ
     */
    async revokeInvitation(invitationId: string) {
      const response = await useApiFetch(`/api/invitations/${invitationId}`, {
        method: "DELETE",
      });
      if (response.success) {
        this.invitations = this.invitations.filter(
          (inv) => inv.id !== invitationId
        ); // Optimistic UI
      }
      return response;
    },

    /**
     * อัปเดต Role ของทีมงาน
     */
    async updateStaffRole(userId: string, role: "ADMIN" | "STAFF") {
      const propertyStore = usePropertyStore();
      const response = await useApiFetch("/api/staff/role", {
        method: "PUT",
        body: {
          propertyId: propertyStore.propertyId,
          userId: userId,
          role: role,
        },
      });
      if (response.success) {
        const member = this.staff.find((s) => s.userId === userId);
        if (member) member.role = role;
      }
      return response;
    },

    /**
     * นำทีมงานออกจากหอพัก
     */
    async removeStaff(userId: string) {
      const propertyStore = usePropertyStore();
      const response = await useApiFetch("/api/staff", {
        method: "DELETE",
        body: {
          propertyId: propertyStore.propertyId,
          userId: userId,
        },
      });
      if (response.success) {
        this.staff = this.staff.filter((s) => s.userId !== userId); // Optimistic UI
      }
      return response;
    },
  },
});
