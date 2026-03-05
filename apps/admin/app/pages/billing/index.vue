<script setup>
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useBillingStore } from '~/store/billingStore'
import { usePropertyStore } from '~/store/propertyStore'
import { PlusIcon } from '@heroicons/vue/24/solid'

// --- Component Imports ---
import BaseButton from '~/components/ui/BaseButton.vue'
import CreateBillingRunModal from './components/CreateBillingRunModal.vue'
import BillingRunCard from './components/BillingRunCard.vue'
import BillingRunCardSkeleton from './components/BillingRunCardSkeleton.vue'

// --- Store & Router Connections ---
const router = useRouter()
const billingStore = useBillingStore()
const propertyStore = usePropertyStore()
const { billingRuns, isLoading } = storeToRefs(billingStore)
const { propertyId } = storeToRefs(propertyStore)

// --- Local State ---
const createRunModal = ref(null)

// --- Data Fetching ---
// Fetch ข้อมูลเมื่อ propertyId ที่ถูกเลือกมีการเปลี่ยนแปลง
watch(
  propertyId,
  (newId) => {
    if (newId) {
      billingStore.fetchBillingRuns(newId)
    }
  },
  { immediate: true }, // immediate: true ทำให้ watch ทำงานทันทีเมื่อ component ถูกสร้าง
)

// --- Event Handlers ---
const openCreateRunModal = () => {
  createRunModal.value?.open()
}

// เมื่อสร้างรอบบิลใหม่สำเร็จ ระบบจะนำทางไปยังหน้าจัดการรอบบิลนั้นทันที
const handleCreateRunSuccess = (newRunData) => {
  // เราใช้ billingStore action ในการตั้งค่า activeRun และเปลี่ยน view ในหน้าถัดไป
  billingStore.setActiveRun(newRunData)
  router.push(`/billing/run/${newRunData.id}`)
}

// Reset a specific view in the store when navigating back to the overview.
onMounted(() => {
  billingStore.resetView()
})
</script>

<template>
  <div class="p-6 md:px-8 bg-white rounded-xl shadow-md h-full flex flex-col">
    <header class="pb-4 border-b border-gray-200">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-x-4">
            <h1 class="text-3xl font-bold tracking-tight text-slate-900">รอบบิล</h1>
            <p class="mt-1 sm:mt-0 text-base text-slate-500">ภาพรวมและประวัติการแจ้งหนี้ทั้งหมด</p>
          </div>
        </div>
        <div class="mt-4 flex md:ml-4 md:mt-0">
          <BaseButton :icon="PlusIcon" @click="openCreateRunModal"> สร้างรอบบิลใหม่ </BaseButton>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto mt-6">
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <BillingRunCardSkeleton v-for="i in 3" :key="i" />
      </div>

      <div
        v-else-if="!billingRuns || billingRuns.length === 0"
        class="text-center h-full flex flex-col justify-center items-center"
      >
        <svg
          class="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-slate-900">ยังไม่มีรอบบิล</h3>
        <p class="mt-1 text-sm text-slate-500">เริ่มต้นสร้างรอบบิลแรกของคุณได้เลย</p>
        <div class="mt-6">
          <BaseButton :icon="PlusIcon" @click="openCreateRunModal"> สร้างรอบบิลแรก </BaseButton>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-3">
        <BillingRunCard v-for="run in billingRuns" :key="run.id" :run="run" />
      </div>
    </div>

    <CreateBillingRunModal ref="createRunModal" @success="handleCreateRunSuccess" />
  </div>
</template>
