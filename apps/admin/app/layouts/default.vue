<template>
  <!-- Single shell during SSR and initial hydration so server and client output matches -->
  <div
    v-if="!hasHydrated"
    class="flex h-screen items-center justify-center bg-slate-50"
  >
    <p class="text-gray-500">กำลังโหลด...</p>
  </div>

  <template v-else>
    <div v-if="isLoading" class="flex h-screen items-center justify-center">
      <p class="text-gray-500">กำลังตรวจสอบข้อมูลผู้ใช้...</p>
    </div>

    <div
      v-else-if="!activeProperty"
      class="flex h-screen items-center justify-center bg-slate-50"
    >
      <div class="text-center p-8 bg-white rounded-xl shadow-md">
        <UIcon name="i-lucide-alert-circle" class="mx-auto h-12 w-12 text-amber-500" />
        <h1 class="mt-4 text-xl font-bold text-gray-900">ยังไม่มีข้อมูลหอพัก</h1>
        <p class="mt-2 text-sm text-gray-600">
          บัญชีของคุณยังไม่ได้ถูกผูกกับหอพักใดๆ<br />
          กรุณาติดต่อผู้ดูแลระบบเพื่อทำการเพิ่มสิทธิ์
        </p>
        <BaseButton @click="signOut()" class="mt-6" variant="secondary">
          <UIcon name="i-lucide-log-out" class="h-5 w-5 mr-2" />
          ออกจากระบบ
        </BaseButton>
      </div>
    </div>

    <div v-else class="flex h-screen bg-white">
    <!-- Sidebar for desktop -->
    <AppSideBar class="hidden md:flex fixed h-full z-20" />

    <div
      class="flex-1 flex flex-col overflow-hidden bg-gray-50 md:transition-all md:duration-300"
      :class="[
        isSidebarOpen ? 'md:ml-72' : 'md:ml-0',
        'lg:ml-72'
      ]"
    >
      <AppHeader :title="pageTitle" class="h-16" />

      <main
        class="bg-gray-50 flex-1 overflow-y-auto px-4 py-2 md:px-8 pb-20 md:pb-0 max-h-[calc(100vh-80px)]"
      >
        <slot :updateTitle="updateTitle" />
      </main>
    </div>

    <!-- Footer for mobile -->
    <AppFooter class="md:hidden" />

    <ConfirmDialog />

    <Toaster
      rich-colors
      position="top-right"
      :duration="3000"
      :toast-options="{
        style: {
          borderRadius: '8px',
          fontFamily: `'IBM+Plex+Sans+Thai', sans-serif`,
        },
        classNames: {
          toast: 'shadow-lg',
          title: 'text-sm',
          description: 'text-xs',
          actionButton: 'bg-blue-500 text-white',
        },
      }"
    />
    </div>
  </template>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { usePropertyStore } from "~/store/propertyStore";
import AppSideBar from "~/components/AppSideBar.vue";
import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import { Toaster } from "vue-sonner";
import BaseButton from "~/components/ui/BaseButton.vue";
import { useSidebar } from "~/composables/useSidebar";

const hasHydrated = ref(false);
onMounted(() => {
  hasHydrated.value = true;
});

const propertyStore = usePropertyStore();
const { activeProperty, isLoading } = storeToRefs(propertyStore);
const { signOut, data, status } = useAppAuth();
const { isSidebarOpen } = useSidebar();

watch(status, (s) => {
  if (s === "unauthenticated") navigateTo("/login");
}, { immediate: true });

const pageTitle = ref("ภาพรวมระบบ");

const updateTitle = (newTitle) => {
  pageTitle.value = newTitle;
};
</script>
