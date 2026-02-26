<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "./settings/store/settingsStore";
import { usePropertyStore } from "~/store/propertyStore";
import { useLeaveConfirmation } from "~/composables/useLeaveConfirmation";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import {
  BuildingOffice2Icon,
  CreditCardIcon,
  UsersIcon,
  BanknotesIcon,
} from "@heroicons/vue/24/outline";
import { ChevronDownIcon } from "@heroicons/vue/24/solid";
import BaseButton from "~/components/ui/BaseButton.vue";
import { useRoute, useRouter } from "vue-router";

const settingsStore = useSettingsStore();
const propertyStore = usePropertyStore();
const router = useRouter();
const route = useRoute();

const { isSaving, isDirty, showSaveFooter } = storeToRefs(settingsStore);
const { propertyId } = storeToRefs(propertyStore);

// ✨ 1. Fetch ข้อมูลครั้งเดียวที่ Component แม่
// useAsyncData จะช่วยป้องกันการ fetch ซ้ำซ้อนเมื่อสลับไปมาระหว่างแท็บลูก
useAsyncData("settings", () => settingsStore.fetchSettings(), {
  watch: [propertyId],
});

// ✨ 2. "ยามเฝ้าประตู" จะทำงานกับทุกหน้าย่อยใน /settings
useLeaveConfirmation(isDirty, settingsStore.resetDirtyState);

// ✨ 3. Navigation จะใช้ NuxtLink เพื่อเปลี่ยนหน้า
const navigation = [
  {
    id: "rooms",
    name: "อาคารและห้องพัก",
    icon: BuildingOffice2Icon,
    to: "/settings",
  },
  {
    id: "finance",
    name: "การเงินและบิล",
    icon: CreditCardIcon,
    to: "/settings/finance",
  },
  {
    id: "payment",
    name: "ช่องทางการชำระเงิน",
    icon: BanknotesIcon,
    to: "/settings/payment",
  },
  { id: "staff", name: "ทีมงาน", icon: UsersIcon, to: "/settings/staff" },
];

// --- Logic for Mobile Dropdown ---
const activeTabId = computed(() => {
  // หา path ที่ตรงกันเพื่อกำหนดค่าเริ่มต้นให้ dropdown
  const currentRoute = route.path;
  const foundNav = navigation.find((nav) => nav.to === currentRoute);
  return foundNav ? foundNav.id : "rooms";
});

const handleMobileNavChange = (selectedId) => {
  const selectedNav = navigation.find((nav) => nav.id === selectedId);
  if (selectedNav) {
    router.push(selectedNav.to);
  }
};

const handleSave = () => {
  settingsStore.saveSettings();
};

const routesWithSaveFooter = ["/settings", "/settings/finance"];

watch(
  () => route.path,
  (newPath) => {
    // ตรวจสอบว่า path ใหม่ อยู่ในลิสต์ที่เรากำหนดหรือไม่
    if (routesWithSaveFooter.includes(newPath)) {
      settingsStore.setShowSaveFooter(true);
    } else {
      settingsStore.setShowSaveFooter(false);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white rounded-xl shadow-md">
    <header
      class="sticky top-0 z-20 p-6 md:px-8 bg-white/80 backdrop-blur-sm border-b border-slate-200"
    >
      <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-x-4">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          ตั้งค่าหอพัก
        </h1>
        <p class="mt-1 sm:mt-0 text-base text-gray-500">
          จัดการข้อมูลหอพัก, ประเภทห้อง, การเงิน, และทีมงานของคุณ
        </p>
      </div>
    </header>

    <div class="p-6 md:px-8">
      <div class="lg:grid lg:grid-cols-12 lg:gap-x-8">
        <aside class="hidden lg:block lg:col-span-3">
          <div class="sticky top-28">
            <nav
              class="space-y-1 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-3"
            >
              <NuxtLink
                v-for="item in navigation"
                :key="item.name"
                :to="item.to"
                class="group rounded-md px-3 py-2 flex items-center text-sm font-medium transition-colors"
                active-class="bg-blue-50 text-blue-700 font-semibold"
                exact-active-class="bg-blue-50 text-blue-700 font-semibold"
              >
                <component
                  :is="item.icon"
                  class="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400 group-[.router-link-exact-active]:text-blue-500"
                />
                <span class="truncate">{{ item.name }}</span>
              </NuxtLink>
            </nav>
          </div>
        </aside>

        <div class="lg:hidden mb-6"></div>

        <div class="lg:col-span-9">
          <NuxtPage />

          <div
            v-if="showSaveFooter"
            class="sticky bottom-0 z-10 flex justify-end gap-x-3 bg-white/80 backdrop-blur-sm py-4 mt-8 -mx-8 px-8 border-t border-slate-200"
          >
            <BaseButton
              @click="settingsStore.revertChanges()"
              variant="secondary"
              :disabled="!isDirty"
            >
              ยกเลิก
            </BaseButton>
            <BaseButton
              @click="handleSave"
              :disabled="!isDirty"
              :loading="isSaving"
            >
              บันทึกการเปลี่ยนแปลง
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
