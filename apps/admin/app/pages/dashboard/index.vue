<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '~/store/propertyStore'
import { useDashboardStore } from '~/store/dashboardStore'
import { useAppAuth } from '~/composables/useAppAuth'

import DashboardMetrics from './components/Metrics.vue'
import DashboardOccupancyChart from './components/OccupancyChart.vue'
import DashboardBillingChart from './components/BillingChart.vue'
import DashboardTodoList from './components/TodoList.vue'

const propertyStore = usePropertyStore()
const dashboardStore = useDashboardStore()
const { propertyId } = storeToRefs(propertyStore)
const { isLoading, metrics, occupancy, billing, todos } = storeToRefs(dashboardStore)

const { data: session } = useAppAuth()

// ✨ ดึงข้อมูล Dashboard เมื่อโหลดหน้า
onMounted(() => {
  if (propertyId.value) {
    dashboardStore.fetchDashboardData(propertyId.value)
  }
})

// ✨ Watch เมื่อเปลี่ยน property
watch(propertyId, (newPropertyId) => {
  if (newPropertyId) {
    dashboardStore.fetchDashboardData(newPropertyId)
  }
})

const adminName = computed(() => session.value?.user?.name || 'ผู้จัดการ')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return `สวัสดีตอนเช้า, คุณ${adminName.value} ☀️`
  if (hour < 18) return `สวัสดีตอนบ่าย, คุณ${adminName.value} ☕`
  return `สวัสดีตอนเย็น, คุณ${adminName.value} 🌙`
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-md min-h-full p-6 md:px-8">
    <header class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        {{ greeting }}
      </h1>
      <p class="mt-1 text-sm text-gray-600">นี่คือภาพรวมสุขภาพของหอพักคุณในวันนี้</p>
    </header>

    <div v-if="isLoading" class="space-y-6">
      <!-- Skeleton: Metrics Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 3"
          :key="n"
          class="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5"
        >
          <div class="flex items-center gap-x-3 mb-3">
            <div class="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div class="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div class="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <!-- Skeleton: Charts & Todo -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Skeleton: Occupancy Chart -->
        <div
          class="lg:col-span-1 flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5"
        >
          <div class="h-5 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
          <div class="flex-1 flex items-center justify-center">
            <div class="w-48 h-48 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div class="grid grid-cols-3 gap-2 text-center mt-4">
            <div class="space-y-2">
              <div class="h-6 w-10 bg-gray-200 rounded mx-auto animate-pulse" />
              <div class="h-4 w-12 bg-gray-200 rounded mx-auto animate-pulse" />
            </div>
            <div class="space-y-2">
              <div class="h-6 w-10 bg-gray-200 rounded mx-auto animate-pulse" />
              <div class="h-4 w-12 bg-gray-200 rounded mx-auto animate-pulse" />
            </div>
            <div class="space-y-2">
              <div class="h-6 w-10 bg-gray-200 rounded mx-auto animate-pulse" />
              <div class="h-4 w-12 bg-gray-200 rounded mx-auto animate-pulse" />
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <!-- Skeleton: Billing Chart -->
          <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <div class="flex items-center justify-between mb-4">
              <div class="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              <div class="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div class="h-4 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
            <div class="h-6 w-full bg-gray-200 rounded animate-pulse" />
          </div>

          <!-- Skeleton: Todo List -->
          <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <div class="h-5 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
            <div class="space-y-2">
              <div v-for="n in 3" :key="n" class="flex items-center gap-x-3 p-3">
                <div class="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                <div class="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="metrics && occupancy && billing" class="space-y-6">
      <DashboardMetrics :metrics="metrics" />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardOccupancyChart :occupancy="occupancy" />

        <div class="lg:col-span-2 space-y-6">
          <DashboardBillingChart :billing="billing" />
          <DashboardTodoList :todos="todos" />
        </div>
      </div>
    </div>
  </div>
</template>
