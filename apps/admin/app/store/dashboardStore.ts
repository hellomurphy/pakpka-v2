import { defineStore } from "pinia";

interface DashboardMetrics {
  monthlyIncome: number;
  overdueBalance: number;
  availableRooms: number;
  maintenanceRequests: number;
}

interface DashboardOccupancy {
  total: number;
  occupied: number;
  available: number;
  other: number;
}

interface DashboardBilling {
  paid: number;
  unpaid: number;
}

interface DashboardTodo {
  type: "PAYMENT" | "CHECK_IN" | "CHECK_OUT" | "CONTRACT_ENDING";
  text: string;
  urgent: boolean;
  to: string;
  relatedId?: string;
}

interface DashboardData {
  metrics: DashboardMetrics;
  occupancy: DashboardOccupancy;
  billing: DashboardBilling;
  todos: DashboardTodo[];
}

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    dashboardData: null as DashboardData | null,
    isLoading: false,
  }),

  getters: {
    metrics: (state) => state.dashboardData?.metrics,
    occupancy: (state) => state.dashboardData?.occupancy,
    billing: (state) => state.dashboardData?.billing,
    todos: (state) => state.dashboardData?.todos || [],
  },

  actions: {
    async fetchDashboardData(propertyId: string) {
      this.isLoading = true;
      try {
        const response = await useApiFetch<DashboardData>(
          `/api/dashboard?propertyId=${propertyId}`,
          {
            showNotification: false,
          }
        );

        if (response.success) {
          this.dashboardData = response.data;
        }
      } finally {
        this.isLoading = false;
      }
    },

    clearDashboardData() {
      this.dashboardData = null;
    },
  },
});
