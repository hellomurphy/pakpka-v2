<template>
  <div class="bg-slate-50 pb-24">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <Icon name="ph:spinner-duotone" class="text-4xl animate-spin text-indigo-600" />
    </div>

    <!-- Main Content -->
    <main v-else class="p-4 max-w-2xl mx-auto space-y-6">
      <header>
        <p class="text-slate-500">{{ greeting }}</p>
        <h1 class="text-2xl font-bold text-slate-800">{{ displayName }} 👋</h1>
      </header>

      <!-- Has Rooms -->
      <div v-if="hasRooms" class="space-y-6">
        <!-- Outstanding Balance Card -->
        <section v-if="totalOutstanding > 0">
          <div
            class="bg-white p-4 rounded-xl shadow-md border border-yellow-300 flex items-center justify-between"
          >
            <div>
              <p class="text-sm text-yellow-700 font-semibold">ยอดค้างชำระ</p>
              <p class="text-2xl font-bold text-slate-800">
                {{ formatNumber(totalOutstanding) }} บาท
              </p>
            </div>
            <NuxtLink
              to="/checkout"
              class="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg shadow-sm hover:bg-indigo-700 transition-all"
            >
              ชำระเงิน
            </NuxtLink>
          </div>
        </section>

        <!-- Rooms List -->
        <section class="space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-bold text-slate-800">ห้องพักของคุณ</h2>
          </div>

          <div class="space-y-4">
            <RoomCard v-for="room in rooms" :key="room.id" :room-data="room" />
          </div>
        </section>
      </div>

      <!-- Empty State -->
      <div v-else>
        <div class="text-center pt-10 px-6">
          <Icon name="solar:home-heart-bold-duotone" class="text-8xl text-indigo-400 mb-4" />
          <h2 class="text-2xl font-bold text-slate-800">ยินดีต้อนรับสู่ PakPak!</h2>
          <p class="text-slate-500 mt-2 mb-6">
            ยังไม่มีห้องพักในระบบ กรุณาติดต่อเจ้าของหอพักเพื่อเพิ่มข้อมูลของคุณ
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import RoomCard from './components/RoomCard.vue'
import { useUserStore } from '~/stores/user'
import { useRoomsStore } from '~/stores/rooms'
import { useInvoicesStore } from '~/stores/invoices'

definePageMeta({
  title: 'แดชบอร์ด',
  headerVariant: 'dashboard',
})

// Stores
const userStore = useUserStore()
const roomsStore = useRoomsStore()
const invoicesStore = useInvoicesStore()

// Utils
const { formatNumber } = useNumberFormat()

// Computed
const displayName = computed(() => userStore.displayName)
const rooms = computed(() => roomsStore.rooms)
const hasRooms = computed(() => roomsStore.hasRooms)
const totalOutstanding = computed(() => invoicesStore.totalOutstanding)
const isLoading = computed(() => userStore.status === 'pending' || roomsStore.status === 'pending')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'สวัสดีตอนเช้า'
  if (hour < 18) return 'สวัสดีตอนบ่าย'
  return 'สวัสดีตอนค่ำ'
})

// Lifecycle
onMounted(async () => {
  try {
    // Fetch user profile
    await userStore.fetchProfile()

    // Fetch rooms
    await roomsStore.fetchMyRooms()

    // Fetch current invoices (for outstanding balance)
    await invoicesStore.fetchInvoices({ status: 'UNPAID,OVERDUE' })

    // Update room status based on invoices
    if (invoicesStore.invoices.length > 0) {
      roomsStore.updateRoomStatusFromInvoices(invoicesStore.invoices)
    }
  } catch (error) {
    console.error('Dashboard error:', error)
    // Continue to show empty state if API fails
  }
})
</script>
