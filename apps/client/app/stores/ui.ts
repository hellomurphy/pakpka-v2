// stores/ui.ts
import { defineStore } from "pinia";

type NotificationType = "success" | "error" | "info";

interface Notification {
  message: string;
  type: NotificationType;
}

export const useUiStore = defineStore("ui", {
  state: () => ({
    isGlobalLoading: false,
    notification: null as Notification | null,
  }),

  actions: {
    setGlobalLoading(isLoading: boolean) {
      this.isGlobalLoading = isLoading;
    },

    /**
     * แสดง Notification และจะหายไปเองใน 3 วินาที
     */
    showNotification(payload: {
      message: string;
      type: NotificationType;
      duration?: number;
    }) {
      const { message, type, duration = 3000 } = payload;
      this.notification = { message, type };

      // ตั้งเวลาเพื่อซ่อน notification
      setTimeout(() => {
        this.notification = null;
      }, duration);
    },

    hideNotification() {
      this.notification = null;
    },
  },
});
