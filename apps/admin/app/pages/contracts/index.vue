<script setup>
import { ref, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { useContractsStore } from "~/store/contractsStore";
import { usePropertyStore } from "~/store/propertyStore";
import { useFormatters } from "~/composables/useFormatters";
import { useWindowSize } from "@vueuse/core";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseTable from "~/components/ui/BaseTable.vue";
import BaseSearchInput from "~/components/form/BaseSearchInput.vue";

// --- Stores & Composables ---
const contractsStore = useContractsStore();
const propertyStore = usePropertyStore();
const { contracts, totalContracts, isLoading } = storeToRefs(contractsStore);
const { propertyId, activeProperty } = storeToRefs(propertyStore);
const { shortDate, currency } = useFormatters();
const router = useRouter();

const { getContractStatusInfo } = useStatusStyles();

// --- Dynamic Table Height ---
const { height: windowHeight } = useWindowSize();
const tableHeight = computed(() => {
  const otherElementsHeight = 285; // Header + Search + Filters + Padding
  return windowHeight.value - otherElementsHeight;
});

// --- Local State ---
const currentPage = ref(1);
const searchQuery = ref("");
const activeFilter = ref("active"); // 'active' is the default

// --- Smart Filters ---
const filters = [
  { id: "active", name: "กำลังใช้งาน" },
  {
    id: "ending_soon",
    name: `ใกล้หมดอายุ (${
      activeProperty.value?.contractEndingSoonDays || 60
    } วัน)`,
  },
  { id: "expired", name: "หมดอายุ/สิ้นสุดแล้ว" },
  { id: "all", name: "ทั้งหมด" },
];

// --- Data Fetching ---
watch(
  [currentPage, searchQuery, activeFilter, propertyId],
  () => {
    if (propertyId.value) {
      contractsStore.fetchContracts({
        propertyId: propertyId.value,
        page: currentPage.value,
        q: searchQuery.value,
        filter: activeFilter.value,
      });
    }
  },
  { immediate: true, deep: true }
);

// --- Table Definition ---
const columns = [
  { key: "room", label: "ห้อง" },
  { key: "tenant", label: "ผู้เช่าหลัก" },
  { key: "period", label: "ระยะเวลาสัญญา" },
  { key: "rentAmount", label: "ค่าเช่า/เดือน", cellClass: "text-right" },
  { key: "status", label: "สถานะ", cellClass: "text-center" },
  { key: "actions", label: "", cellClass: "text-right" },
];

const goToContractDetail = (contract) => {
  router.push(`/contracts/${contract.id}`);
};
</script>

<template>
  <div class="p-6 md:px-8 bg-white rounded-xl shadow-md h-full flex flex-col">
    <header class="pb-4 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-x-4">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          จัดการสัญญา
        </h1>
        <p class="mt-1 sm:mt-0 text-base text-gray-500">
          ศูนย์รวมข้อมูลสัญญาทั้งหมดในระบบ
        </p>
      </div>
    </header>

    <div class="py-4 flex flex-col gap-4">
      <div class="flex-1">
        <BaseSearchInput
          v-model="searchQuery"
          placeholder="ค้นหาตามเลขห้อง หรือ ชื่อผู้เช่า..."
        />
      </div>
      <div class="flex-shrink-0 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
        <div
          class="inline-flex items-center bg-slate-100 rounded-full p-1 space-x-1"
        >
          <button
            v-for="filter in filters"
            :key="filter.id"
            @click="activeFilter = filter.id"
            :class="[
              'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus:outline-none whitespace-nowrap',
              activeFilter === filter.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            {{ filter.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto -mx-6 md:-mx-8 p-5">
      <BaseTable
        :columns="columns"
        :items="contracts"
        :loading="isLoading"
        :total-items="totalContracts"
        v-model:currentPage="currentPage"
        :height="tableHeight"
      >
        <template #cell-room="{ item }">
          <span class="font-semibold text-gray-800">{{
            item.room.roomNumber
          }}</span>
        </template>
        <template #cell-tenant="{ item }">
          {{ item.tenants[0]?.tenant?.name || "N/A" }}
        </template>
        <template #cell-period="{ item }">
          {{ shortDate(item.startDate) }} - {{ shortDate(item.endDate) }}
        </template>
        <template #cell-rentAmount="{ item }">
          {{ currency(item.rentAmount) }}
        </template>
        <template #cell-status="{ item }">
          <span
            :class="[
              getContractStatusInfo(item.status).class,
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            ]"
          >
            {{ getContractStatusInfo(item.status).text }}
          </span>
        </template>
        <template #cell-actions="{ item }">
          <BaseButton
            @click="goToContractDetail(item)"
            variant="secondary"
            size="sm"
          >
            ดู/แก้ไข
          </BaseButton>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
