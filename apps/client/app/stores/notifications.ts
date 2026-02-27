import { defineStore } from "pinia";
import type { Notification, NotificationType } from "~/types";

interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
}

export const useNotificationsStore = defineStore("notifications", {
  state: (): NotificationsState => ({
    notifications: [],
    isLoading: false,
  }),

  getters: {
    unreadCount: (state) =>
      state.notifications.filter((n) => !n.isRead).length,

    hasUnread: (state) =>
      state.notifications.some((n) => !n.isRead),

    byType: (state) => (type: NotificationType | "all") => {
      if (type === "all") return state.notifications;
      return state.notifications.filter((n) => n.type === type);
    },
  },

  actions: {
    async fetchNotifications(params?: { type?: string; page?: number; limit?: number }) {
      this.isLoading = true;
      try {
        const api = useApi();
        const response = await api.notifications.list(params);

        if (response.data) {
          this.notifications = response.data;
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        // Set empty array on error instead of throwing
        this.notifications = [];
      } finally {
        this.isLoading = false;
      }
    },

    async markAsRead(notificationId: string) {
      try {
        const api = useApi();
        await api.notifications.markAsRead(notificationId);

        // Update local state
        const notification = this.notifications.find((n) => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },

    clearNotifications() {
      this.notifications = [];
      this.isLoading = false;
    },
  },
});
