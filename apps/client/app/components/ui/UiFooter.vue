<template>
  <footer class="sticky bottom-0 bg-white border-t border-slate-200/80 shadow-t-sm">
    <div class="flex justify-around items-center max-w-md mx-auto px-2 pt-2 pb-1">
      <NuxtLink
        v-for="nav in navigations"
        :key="nav.url"
        :to="nav.url"
        class="relative flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-lg transition-all duration-200 active:scale-90"
      >
        <template v-if="nav.id === 'notification' && unreadCount > 0">
           <span class="absolute top-0 right-[25%] flex h-5 w-5">
            <span class="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center font-semibold">
              {{ unreadCount }}
            </span>
          </span>
        </template>
        
        <template v-if="isActive(nav.url)">
          <Icon :name="nav.activeIcon" class="text-2xl text-indigo-600" />
          <span class="text-xs font-bold text-indigo-600">{{ nav.title }}</span>
        </template>
        <template v-else>
          <Icon :name="nav.icon" class="text-2xl text-slate-500" />
          <span class="text-xs font-medium text-slate-500">{{ nav.title }}</span>
        </template>
      </NuxtLink>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// --- STATE & DATA ---
// You would get this from your state management (Pinia) or API call
const unreadCount = ref(3); 

const isActive = (url) => route.path === url;

// Add an 'id' to easily identify the notification tab
const navigations = ref([
  { id: "payment", title: "จ่ายเงิน", icon: "solar:wallet-outline", activeIcon: "solar:wallet-bold", url: "/checkout" },
  { id: "report", title: "แจ้งเรื่อง", icon: "solar:chat-round-line-outline", activeIcon: "solar:chat-round-line-bold", url: "/report" },
  { id: "home", title: "หน้าแรก", icon: "solar:home-2-outline", activeIcon: "solar:home-2-bold", url: "/dashboard" },
  { id: "notification", title: "ประกาศ", icon: "solar:bell-outline", activeIcon: "solar:bell-bold", url: "/notifications" },
  { id: "more", title: "เพิ่มเติม", icon: "solar:hamburger-menu-outline", activeIcon: "solar:hamburger-menu-bold", url: "/additional" },
]);
</script>