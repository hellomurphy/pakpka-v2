<template>
  <Popover v-slot="{ close }" class="relative">
    <PopoverButton
      class="relative rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-transform active:scale-90"
    >
      <Icon
        name="solar:bell-bold-duotone"
        class="text-3xl text-slate-700 hover:text-indigo-600"
      />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 flex h-5 w-5"
      >
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
        ></span>
        <span
          class="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center font-semibold"
        >
          {{ unreadCount }}
        </span>
      </span>
    </PopoverButton>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <PopoverPanel
        class="absolute z-50 mt-2 w-[90vw] max-w-sm -right-4 sm:right-0 transform"
      >
        <div
          class="overflow-hidden rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 bg-white"
        >
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-lg font-bold text-slate-800">การแจ้งเตือน</h3>
            <button
              v-if="unreadCount > 0"
              class="text-xs font-semibold text-indigo-600 hover:underline"
            >
              อ่านทั้งหมด
            </button>
          </div>

          <div
            v-if="notifications.length > 0"
            class="max-h-[60vh] overflow-y-auto"
          >
            <ul class="divide-y divide-slate-100">
              <li v-for="item in notifications" :key="item.id">
                <NuxtLink
                  :to="getNotificationLink(item)"
                  @click="close"
                  class="block p-3 transition-colors"
                  :class="
                    item.isRead
                      ? 'hover:bg-slate-50'
                      : 'bg-indigo-50/60 hover:bg-indigo-100/70'
                  "
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                      :class="getIconInfo(item.type).bgColor"
                    >
                      <Icon
                        :name="getIconInfo(item.type).icon"
                        class="text-lg"
                        :class="getIconInfo(item.type).iconColor"
                      />
                    </div>
                    <div class="flex-grow">
                      <p
                        class="font-semibold text-sm text-slate-800 leading-tight"
                      >
                        {{ item.title }}
                      </p>
                      <p class="text-xs text-slate-600">{{ item.message }}</p>
                      <p class="text-xs text-slate-400 mt-1">
                        {{ item.timestamp }}
                      </p>
                    </div>
                    <div
                      v-if="!item.isRead"
                      class="w-2.5 h-2.5 bg-indigo-500 rounded-full flex-shrink-0 mt-1"
                    ></div>
                  </div>
                </NuxtLink>
              </li>
            </ul>
          </div>
          <p v-else class="text-sm text-gray-500 text-center py-10">
            ยังไม่มีการแจ้งเตือน
          </p>

          <div class="border-t px-4 py-3 bg-slate-50 text-center">
            <NuxtLink
              to="/notifications"
              @click="close"
              class="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              ดูการแจ้งเตือนทั้งหมด
            </NuxtLink>
          </div>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { ref, computed } from "vue";

// --- MOCK DATA (ใช้โครงสร้างเดียวกับหน้า Notifications เต็มรูปแบบ) ---
const notifications = ref([
  {
    id: 1,
    type: "announcement",
    relatedId: "p-1",
    title: "ปิดปรับปรุงระบบ",
    message: "จะปิดปรับปรุงคืนนี้ 00:00 - 02:00",
    timestamp: "5 นาทีที่แล้ว",
    isRead: false,
  },
  {
    id: 4,
    type: "dorm",
    relatedId: "inv-june-2025",
    subtype: "bill",
    title: "แจ้งยอดชำระค่าเช่า",
    message: "บิลค่าบริการรอบเดือน มิ.ย. ออกแล้ว",
    timestamp: "3 วันที่แล้ว",
    isRead: false,
  },
  {
    id: 2,
    type: "repair",
    relatedId: "r-123",
    title: "แจ้งซ่อม B202 - ดำเนินการแล้ว",
    message: "ช่างจะเข้าตรวจสอบ 12 มิ.ย. 14:00",
    timestamp: "3 ชั่วโมงที่แล้ว",
    isRead: true,
  },
  {
    id: 3,
    type: "dorm",
    relatedId: "parcel-789",
    subtype: "parcel",
    title: "พัสดุของคุณมาถึงแล้ว",
    message: "พัสดุหมายเลข TH123456789",
    timestamp: "1 วันที่แล้ว",
    isRead: true,
  },
]);

// --- COMPUTED PROPERTIES ---
const unreadCount = computed(
  () => notifications.value.filter((n) => !n.isRead).length
);

// --- HELPER FUNCTIONS (ควรย้ายไปเป็น Composables 'useNotifications' เพื่อการใช้งานร่วมกัน) ---
const getIconInfo = (type: string) => {
  switch (type) {
    case "system":
      return {
        icon: "ph:gear-duotone",
        bgColor: "bg-slate-200",
        iconColor: "text-slate-600",
      };
    case "dorm":
      return {
        icon: "ph:house-duotone",
        bgColor: "bg-sky-100",
        iconColor: "text-sky-600",
      };
    case "announcement":
      return {
        icon: "ph:megaphone-duotone",
        bgColor: "bg-amber-100",
        iconColor: "text-amber-600",
      };
    case "repair":
      return {
        icon: "ph:wrench-duotone",
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
      };
    default:
      return {
        icon: "ph:bell-duotone",
        bgColor: "bg-gray-200",
        iconColor: "text-gray-600",
      };
  }
};

const getNotificationLink = (notification: any): string => {
  switch (notification.type) {
    case "repair":
      return `/reports/${notification.relatedId}`;
    case "announcement":
    case "system":
      return `/announcements/${notification.relatedId}`;
    case "dorm":
      if (notification.subtype === "parcel")
        return `/parcels/${notification.relatedId}`;
      if (notification.subtype === "bill")
        return `/payment/${notification.relatedId}`;
      return "/";
    default:
      return "#";
  }
};
</script>
