import { defineStore } from "pinia";
import { useApiFetch } from "~/composables/useApiFetch";

// ✨ 1. เพิ่ม Type ที่จำเป็นสำหรับหน้า List
interface ContractListItem extends Contract {
  room: { roomNumber: string };
  tenants: { tenant: { name: string } }[];
}

interface FetchContractsParams {
  propertyId: string;
  page?: number;
  q?: string; 
  filter?: string;
}

// --- Interfaces เดิมของคุณ ---
interface FinalizeMoveOutData {
  deductions?: number;
  deductionNotes?: string;
}
interface ContractUpdateData {
  endDate?: Date;
  rentAmount?: number;
  status?: string;
}

export const useContractsStore = defineStore("contracts", {
  state: () => ({
    isLoading: false,
    // ✨ 2. เพิ่ม State ใหม่สำหรับเก็บรายการสัญญา
    contracts: [] as ContractListItem[],
    totalContracts: 0,
    activeContract: null as Contract | null,
  }),
  actions: {
    // ✨ 3. เพิ่ม Action ใหม่สำหรับดึงรายการสัญญา
    /**
     * ดึงรายการสัญญาทั้งหมด (สำหรับหน้า /contracts)
     */
    async fetchContracts(params: FetchContractsParams) {
      if (!params.propertyId) return;
      this.isLoading = true;
      try {
        // สร้าง query string จาก params object
        const query = new URLSearchParams(
          JSON.parse(JSON.stringify(params))
        ).toString();

        const response = await useApiFetch(`/api/contracts?${query}`, {
          showNotification: false,
        });

        if (response.success && response.data) {
          this.contracts = response.data.contracts;
          this.totalContracts = response.data.total;
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchContractDetails(contractId: string) {
      if (!contractId) return;
      this.isLoading = true;
      this.activeContract = null; // เคลียร์ของเก่าก่อน
      try {
        const response = await useApiFetch(`/api/contracts/${contractId}`, {
          showNotification: false,
        });

        if (response.success) {
          this.activeContract = response.data;
        }
      } finally {
        this.isLoading = false;
      }
    },

    // --- Actions เดิมของคุณ (ยังคงอยู่เหมือนเดิม) ---

    async updateContract(contractId: string, data: ContractUpdateData) {
      this.isLoading = true;
      try {
        const response = await useApiFetch(`/api/contracts/${contractId}`, {
          method: "PUT",
          body: data,
          successMessage: "อัปเดตข้อมูลสัญญาสำเร็จ",
        });
        return response;
      } finally {
        this.isLoading = false;
      }
    },

    async createContractForExistingTenant(data: any) {
      return await useApiFetch("/api/contracts", {
        method: "POST",
        body: data,
      });
    },

    async confirmCheckIn(contractId: string) {
      return await useApiFetch(`/api/contracts/${contractId}/check-in`, {
        method: "POST",
        successMessage: "ยืนยันการย้ายเข้าสำเร็จ",
      });
    },

    async cancelUpcomingContract(contractId: string) {
      return await useApiFetch(`/api/contracts/${contractId}/cancel`, {
        method: "POST",
        successMessage: "ยกเลิกสัญญาสำเร็จ",
      });
    },

    async giveNoticeOfMoveOut(contractId: string, noticeDate: Date) {
      this.isLoading = true;
      try {
        const response = await useApiFetch(
          `/api/contracts/${contractId}/notice`,
          {
            method: "POST",
            body: { noticeDate },
            successMessage: "บันทึกการแจ้งย้ายออกสำเร็จ",
          }
        );
        // เมื่อสำเร็จ ให้คืนค่า response เพื่อให้ component รู้
        return response;
      } finally {
        this.isLoading = false;
      }
    },

    async finalizeMoveOut(contractId: string, data: FinalizeMoveOutData) {
      this.isLoading = true;
      try {
        const response = await useApiFetch(
          `/api/contracts/${contractId}/finalize`,
          {
            method: "POST",
            body: data,
            successMessage: "ยืนยันการย้ายออกสำเร็จ",
          }
        );
        return response;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
