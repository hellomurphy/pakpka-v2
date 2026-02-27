<template>
  <div class="bg-slate-50">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center min-h-screen"
    >
      <Icon
        name="ph:spinner-duotone"
        class="text-4xl animate-spin text-indigo-600"
      />
    </div>

    <!-- Main Content -->
    <div v-else>
      <div class="p-4 max-w-2xl mx-auto">
        <div class="flex gap-2 overflow-x-auto pb-3 -mb-3 no-scrollbar">
          <button
            v-for="filter in filters"
            :key="filter.id"
            @click="activeFilter = filter.id"
            class="px-4 py-1.5 text-sm font-semibold rounded-full transition-colors whitespace-nowrap"
            :class="
              activeFilter === filter.id
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            "
          >
            {{ filter.name }}
          </button>
        </div>
      </div>

      <main class="p-4 max-w-2xl mx-auto">
        <div v-if="filteredNotifications.length > 0" class="space-y-3">
          <div
            v-for="item in filteredNotifications"
            :key="item.id"
            @click="handleNotificationClick(item)"
            class="block outline-none"
            aria-label="ดูรายละเอียดการแจ้งเตือน"
          >
            <div
              class="bg-white p-3 rounded-lg shadow-sm border border-transparent hover:border-indigo-400 hover:shadow-md transition-all flex items-start gap-4 cursor-pointer"
              :class="{ 'bg-indigo-50/50': !item.isRead }"
            >
              <div
                class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                :class="getIconInfo(item.type).bgColor"
              >
                <Icon
                  :name="getIconInfo(item.type).icon"
                  class="text-xl"
                  :class="getIconInfo(item.type).iconColor"
                />
              </div>

              <div class="flex-grow">
                <p class="font-bold text-slate-800 leading-tight">
                  {{ item.title }}
                </p>
                <p class="text-sm text-slate-600 mt-0.5">{{ item.message }}</p>
                <div class="text-xs text-slate-400 mt-2 flex items-center">
                  <span>{{ formatTimestamp(item.createdAt) }}</span>
                  <div
                    v-if="!item.isRead"
                    class="w-2 h-2 bg-indigo-500 rounded-full ml-auto animate-pulse"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center pt-24 px-6">
          <Icon
            name="ph:bell-slash-duotone"
            class="text-7xl text-slate-300 mb-4"
          />
          <h3 class="text-lg font-semibold text-slate-700">ไม่มีการแจ้งเตือน</h3>
          <p class="text-slate-500">เมื่อมีการอัปเดตใหม่ๆ จะปรากฏที่นี่</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import type { Notification, NotificationType } from "~/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";

dayjs.extend(relativeTime);
dayjs.locale("th");

definePageMeta({
  title: "การแจ้งเตือน",
  headerVariant: "page",
});

// Stores
const notificationsStore = useNotificationsStore();

// State
const activeFilter = ref<NotificationType | "all">("all");

// Computed
const isLoading = computed(() => notificationsStore.isLoading);
const notifications = computed(() => notificationsStore.notifications);

// Filter options
const filters = [
  { id: "all", name: "ทั้งหมด" },
  { id: "system", name: "ระบบ" },
  { id: "dorm", name: "หอพัก" },
  { id: "announcement", name: "ประกาศ" },
  { id: "repair", name: "ซ่อม" },
];

// Computed: filtered notifications
const filteredNotifications = computed(() => {
  if (activeFilter.value === "all") {
    return notifications.value;
  }
  return notifications.value.filter((n) => n.type === activeFilter.value);
});

// Helper: format timestamp
const formatTimestamp = (timestamp: string): string => {
  return dayjs(timestamp).fromNow();
};

// Helper: get icon info based on notification type
const getIconInfo = (type: NotificationType) => {
  const iconMap: Record<
    NotificationType,
    { icon: string; bgColor: string; iconColor: string }
  > = {
    system: {
      icon: "ph:gear-duotone",
      bgColor: "bg-slate-200",
      iconColor: "text-slate-600",
    },
    dorm: {
      icon: "ph:house-duotone",
      bgColor: "bg-sky-100",
      iconColor: "text-sky-600",
    },
    announcement: {
      icon: "ph:megaphone-duotone",
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    repair: {
      icon: "ph:wrench-duotone",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  };

  return (
    iconMap[type] || {
      icon: "ph:bell-duotone",
      bgColor: "bg-gray-200",
      iconColor: "text-gray-600",
    }
  );
};

// Get notification link based on subtype
const getNotificationLink = (notification: Notification): string | null => {
  if (!notification.relatedId) {
    return null;
  }

  switch (notification.subtype) {
    case "repair":
      return "/history/repairs";
    case "bill":
      return `/invoice/${notification.relatedId}`;
    case "parcel":
      return `/parcels/${notification.relatedId}`;
    case "announcement":
    case "system":
      return `/announcements/${notification.relatedId}`;
    default:
      return null;
  }
};

// Handle notification click
const handleNotificationClick = async (notification: Notification) => {
  // Mark as read
  if (!notification.isRead) {
    await notificationsStore.markAsRead(notification.id);
  }

  // Navigate if there's a related link
  const link = getNotificationLink(notification);
  if (link) {
    await navigateTo(link);
  }
};

// Lifecycle
onMounted(async () => {
  await notificationsStore.fetchNotifications();
});
</script>

<style scoped>
/* Utility to hide scrollbar but keep it scrollable */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
