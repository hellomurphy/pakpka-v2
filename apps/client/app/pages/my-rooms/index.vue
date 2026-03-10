<template>
  <div class="bg-slate-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <Icon name="ph:spinner-duotone" class="text-4xl animate-spin text-indigo-600" />
    </div>

    <!-- Main Content -->
    <main v-else class="p-4 max-w-2xl mx-auto">
      <div v-if="hasRooms" class="space-y-4">
        <p class="text-center text-slate-500">
          เลือกห้องพักเพื่อดูข้อมูลเชิงลึก, ประวัติบิล, หรือจัดการสัญญา
        </p>

        <ul class="space-y-3">
          <li v-for="room in rooms" :key="room.id">
            <NuxtLink
              :to="`/room/${room.id}`"
              class="flex items-center p-3 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
            >
              <img
                :src="room.property?.imageUrl || defaultRoomImage"
                alt="Room"
                class="w-20 h-20 rounded-lg object-cover mr-4"
              />
              <div class="flex-grow">
                <p class="font-bold text-slate-800 text-lg">
                  {{ room.roomNumber }}
                </p>
                <p class="text-sm text-slate-600">{{ room.property?.name }}</p>
                <div
                  class="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 text-xs font-bold rounded-full"
                  :class="getStatusClass(room.currentInvoice?.status)"
                >
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    :class="getStatusDotClass(room.currentInvoice?.status)"
                  ></div>
                  <span>{{ getStatusText(room.currentInvoice?.status) }}</span>
                </div>
              </div>
              <Icon name="solar:alt-arrow-right-linear" class="text-slate-400 text-2xl" />
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center pt-20 px-6">
        <Icon name="solar:home-heart-bold-duotone" class="text-8xl text-slate-300 mb-4" />
        <h3 class="text-lg font-semibold text-slate-700">ยังไม่มีห้องพัก</h3>
        <p class="text-slate-500">กรุณาติดต่อเจ้าของหอพักเพื่อเพิ่มข้อมูลของคุณ</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { InvoiceStatus } from '@repo/db'

definePageMeta({
  title: 'ห้องของฉัน',
  headerVariant: 'page',
  showFooter: false,
})

// Stores
const roomsStore = useRoomsStore()

// Computed
const rooms = computed(() => roomsStore.rooms)
const hasRooms = computed(() => roomsStore.hasRooms)
const isLoading = computed(() => roomsStore.isLoading)

// Default image
const defaultRoomImage =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2940&auto=format&fit=crop'

// Helper functions
const getStatusClass = (status?: InvoiceStatus) => {
  if (status === 'OVERDUE') {
    return 'bg-red-100 text-red-700'
  }
  if (status === 'UNPAID') {
    return 'bg-yellow-100 text-yellow-700'
  }
  return 'bg-green-100 text-green-700'
}

const getStatusDotClass = (status?: InvoiceStatus) => {
  if (status === 'OVERDUE') {
    return 'bg-red-500'
  }
  if (status === 'UNPAID') {
    return 'bg-yellow-500'
  }
  return 'bg-green-500'
}

const getStatusText = (status?: InvoiceStatus) => {
  if (status === 'OVERDUE') {
    return 'ค้างชำระ'
  }
  if (status === 'UNPAID') {
    return 'รอชำระ'
  }
  return 'ปกติ'
}

// Lifecycle
onMounted(async () => {
  await roomsStore.fetchMyRooms()
})
</script>
