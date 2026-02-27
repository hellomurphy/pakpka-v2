// composables/useApi.ts
/**
 * Composables สำหรับเรียกใช้ API endpoints ต่างๆ
 * รวม API ทั้งหมดไว้ในที่เดียว เพื่อความสะดวกในการใช้งาน
 */

export const useApi = () => {
  const httpClient = useHttpClient();

  return {
    // ============================
    // Authentication APIs
    // ============================
    auth: {
      /**
       * ดึงข้อมูล session ของผู้ใช้
       * GET /api/session/init
       */
      getSession: () => httpClient<any>("/session/init"),

      /**
       * Login ด้วย credentials (username/password)
       * POST /api/auth/signin/credentials
       */
      login: (credentials: { login: string; password: string }) =>
        httpClient<any>("/auth/signin/credentials", {
          method: "POST",
          body: credentials,
        }),
    },

    // ============================
    // Dashboard APIs
    // ============================
    dashboard: {
      /**
       * ดึงข้อมูล dashboard หลัก
       * GET /api/dashboard
       */
      get: (propertyId: string) =>
        httpClient<any>("/dashboard", {
          query: { propertyId },
        }),

      /**
       * ดึงข้อมูล dashboard ของ property
       * GET /api/properties/:id/dashboard
       */
      getPropertyDashboard: (propertyId: string) =>
        httpClient<any>(`/properties/${propertyId}/dashboard`),
    },

    // ============================
    // Tenant/User Profile APIs
    // ============================
    profile: {
      /**
       * ดึงข้อมูลโปรไฟล์ของผู้ใช้
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      get: () => httpClient<any>("/tenant/profile"),

      /**
       * อัปเดตโปรไฟล์ผู้ใช้
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      update: (data: any) =>
        httpClient<any>("/tenant/profile", {
          method: "PUT",
          body: data,
        }),
    },

    // ============================
    // Contracts APIs
    // ============================
    contracts: {
      /**
       * ดึงรายการสัญญาทั้งหมด
       * GET /api/contracts
       */
      list: (params: {
        propertyId: string;
        page?: number;
        limit?: number;
        q?: string;
        filter?: string;
      }) =>
        httpClient<any>("/contracts", {
          query: params,
        }),

      /**
       * ดึงข้อมูลสัญญาเฉพาะ ID
       * GET /api/contracts/:id
       */
      get: (id: string) => httpClient<any>(`/contracts/${id}`),

      /**
       * ดึงสัญญาของ tenant ที่ล็อกอินอยู่
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      getMy: () => httpClient<any>("/tenant/contracts"),
    },

    // ============================
    // Rooms APIs
    // ============================
    rooms: {
      /**
       * ดึงรายการห้องทั้งหมด
       * GET /api/rooms
       */
      list: (floorId: string) =>
        httpClient<any>("/rooms", {
          query: { floorId },
        }),

      /**
       * ดึงข้อมูลห้องเฉพาะ ID
       * GET /api/rooms/:id
       */
      get: (id: string) => httpClient<any>(`/rooms/${id}`),

      /**
       * ดึงห้องที่ user เป็นผู้เช่า
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      getMy: () => httpClient<any>("/tenant/rooms"),
    },

    // ============================
    // Invoices APIs
    // ============================
    invoices: {
      /**
       * ดึงข้อมูลใบแจ้งหนี้เฉพาะ ID
       * GET /api/invoices/:id
       */
      get: (id: string) => httpClient<any>(`/invoices/${id}`),

      /**
       * ดึงรายการใบแจ้งหนี้ของ tenant
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      getMy: (params?: { year?: string; status?: string }) =>
        httpClient<any>("/tenant/invoices", {
          query: params,
        }),

      /**
       * ดึงใบแจ้งหนี้ปัจจุบันที่ค้างชำระ
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      getCurrent: () => httpClient<any>("/tenant/invoices/current"),
    },

    // ============================
    // Payments APIs
    // ============================
    payments: {
      /**
       * ดึงรายการการชำระเงิน
       * GET /api/payments
       */
      list: (params: {
        propertyId: string;
        status?: string;
        page?: number;
        limit?: number;
      }) =>
        httpClient<any>("/payments", {
          query: params,
        }),

      /**
       * ส่งหลักฐานการชำระเงิน (สลิป)
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      submit: (data: { invoiceId: string; amount: number; slipUrl: string }) =>
        httpClient<any>("/tenant/payments", {
          method: "POST",
          body: data,
        }),

      /**
       * ดึงประวัติการชำระเงิน
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      getHistory: (params?: { year?: string; status?: string }) =>
        httpClient<any>("/tenant/payments/history", {
          query: params,
        }),
    },

    // ============================
    // Notifications APIs
    // ============================
    notifications: {
      /**
       * ดึงรายการการแจ้งเตือน
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      list: (params?: { type?: string; page?: number; limit?: number }) =>
        httpClient<any>("/tenant/notifications", {
          query: params,
        }),

      /**
       * ทำเครื่องหมายว่าอ่านแล้ว
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      markAsRead: (id: string) =>
        httpClient<any>(`/tenant/notifications/${id}/read`, {
          method: "POST",
        }),
    },

    // ============================
    // Property/Dorm Info APIs
    // ============================
    properties: {
      /**
       * ดึงข้อมูลหอพัก/อพาร์ทเมนท์
       * GET /api/properties/:id/settings
       */
      get: (id: string) => httpClient<any>(`/properties/${id}/settings`),
    },

    // ============================
    // Room Types APIs
    // ============================
    roomTypes: {
      /**
       * ดึงรายการประเภทห้อง
       * GET /api/room-types
       */
      list: (propertyId: string) =>
        httpClient<any>("/room-types", {
          query: { propertyId },
        }),
    },

    // ============================
    // Services APIs
    // ============================
    services: {
      /**
       * ดึงรายการบริการเสริม
       * GET /api/services
       */
      list: (propertyId: string) =>
        httpClient<any>("/services", {
          query: { propertyId },
        }),
    },

    // ============================
    // Billing Runs APIs
    // ============================
    billingRuns: {
      /**
       * ดึงรายการรอบบิล
       * GET /api/billing-runs
       */
      list: (propertyId: string) =>
        httpClient<any>("/billing-runs", {
          query: { propertyId },
        }),

      /**
       * ดึงรอบบิลล่าสุด
       * GET /api/billing-runs/latest
       */
      getLatest: (propertyId: string) =>
        httpClient<any>("/billing-runs/latest", {
          query: { propertyId },
        }),
    },

    // ============================
    // Repair/Maintenance APIs
    // ============================
    maintenance: {
      /**
       * ดึงรายการแจ้งซ่อม
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      list: (params?: { status?: string }) =>
        httpClient<any>("/tenant/maintenance", {
          query: params,
        }),

      /**
       * สร้างคำขอแจ้งซ่อม
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      create: (data: {
        roomId: string;
        description: string;
        images?: string[];
      }) =>
        httpClient<any>("/tenant/maintenance", {
          method: "POST",
          body: data,
        }),

      /**
       * ดูรายละเอียดการแจ้งซ่อม
       * (ยังไม่มีใน backend - ต้องสร้างใหม่)
       */
      get: (id: string) => httpClient<any>(`/tenant/maintenance/${id}`),
    },
  };
};
