<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useContractsStore } from "~/store/contractsStore";
import { useServicesStore } from "~/store/servicesStore";
import { usePropertyStore } from "~/store/propertyStore";

// Import sub-components
import ContractDetailCard from "../components/ContractDetailCard.vue";
import ContractServicesCard from "../components/ContractServicesCard.vue";

// Import UI components
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

// --- Stores & Route ---
const route = useRoute();
const contractsStore = useContractsStore();
const servicesStore = useServicesStore();
const propertyStore = usePropertyStore();

const { activeContract, isLoading } = storeToRefs(contractsStore);
const { services: serviceCatalog } = storeToRefs(servicesStore);
const { propertyId } = storeToRefs(propertyStore); // Get propertyId for fetching services
const contractId = Array.isArray(route.params.id)
  ? route.params.id[0]
  : route.params.id;

// --- Data Fetching ---
onMounted(() => {
  if (contractId) {
    contractsStore.fetchContractDetails(contractId);
  }
  if (propertyId.value) {
    // Fetch all available services for the "Add Service" dropdown
    servicesStore.fetchServices(propertyId.value);
  }
});

// --- Methods ---
const refreshData = () => {
  if (contractId) {
    contractsStore.fetchContractDetails(contractId);
  }
};
</script>

<template>
  <div class="p-6 md:px-8 bg-white rounded-xl shadow-md min-h-full">
    <header class="mb-6">
      <NuxtLink
        to="/contracts"
        class="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-3 transition-colors"
      >
        <ArrowLeftIcon class="w-5 h-5" />
        กลับไปหน้ารายการสัญญา
      </NuxtLink>

      <div v-if="isLoading && !activeContract" class="animate-pulse">
        <div class="h-9 w-3/4 bg-gray-200 rounded-md"></div>
        <div class="h-5 w-1/2 bg-gray-200 rounded-md mt-2"></div>
      </div>

      <div v-else-if="activeContract">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          สัญญาห้อง {{ activeContract.room.roomNumber }}
        </h1>
        <p class="mt-1 text-base text-gray-500">
          จัดการรายละเอียดทั้งหมดของสัญญาสำหรับผู้เช่า:
          <span class="font-semibold text-gray-700">{{
            activeContract.tenants[0]?.tenant.name
          }}</span>
        </p>
      </div>
    </header>

    <div v-if="isLoading && !activeContract" class="space-y-6">
      <div
        class="h-64 w-full bg-white rounded-xl animate-pulse ring-1 ring-gray-900/5"
      ></div>
      <div
        class="h-48 w-full bg-white rounded-xl animate-pulse ring-1 ring-gray-900/5"
      ></div>
    </div>

    <div
      v-else-if="activeContract"
      class="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div class="lg:col-span-2 space-y-6">
        <ContractDetailCard :contract="activeContract" @success="refreshData" />
      </div>

      <div class="space-y-6">
        <ContractServicesCard
          :contract-id="activeContract.id"
          :contract-services="activeContract.services"
          :service-catalog="serviceCatalog"
          @success="refreshData"
        />
      </div>
    </div>
  </div>
</template>
