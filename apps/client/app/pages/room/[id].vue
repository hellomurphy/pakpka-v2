<template>
  <div class="max-w-2xl mx-auto bg-slate-100">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <Icon name="ph:spinner-duotone" class="text-4xl animate-spin text-indigo-600" />
    </div>

    <!-- Main Content -->
    <template v-else-if="room">
      <!-- Room Header -->
      <section class="relative h-48 w-full">
        <img
          :src="room.property?.imageUrl || defaultImage"
          alt="Room Image"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="absolute bottom-0 left-0 p-4">
          <h1 class="text-2xl font-bold leading-tight text-white shadow-lg">
            {{ room.roomNumber }}
          </h1>
          <p class="text-sm text-white/90">{{ room.property?.name }}</p>
        </div>
      </section>

      <main class="p-4 space-y-6">
        <!-- Action Buttons -->
        <section class="grid grid-cols-3 gap-3 text-center mt-2">
          <NuxtLink
            :to="`/contracts/${room.activeContract?.id}`"
            class="bg-white p-3 rounded-xl shadow-md flex flex-col items-center justify-center space-y-1 transition-transform active:scale-95 border border-slate-200 hover:bg-slate-50"
          >
            <Icon name="solar:document-text-bold-duotone" class="text-2xl text-indigo-600" />
            <span class="text-xs font-semibold text-slate-700">ดูสัญญา</span>
          </NuxtLink>
          <button
            @click="fetchPropertyInfo"
            class="bg-white p-3 rounded-xl shadow-lg flex flex-col items-center justify-center space-y-1 transition-transform active:scale-95 border border-slate-200 hover:bg-slate-50"
          >
            <Icon name="solar:buildings-2-bold-duotone" class="text-2xl text-indigo-600" />
            <span class="text-xs font-semibold text-slate-700">ข้อมูลหอ</span>
          </button>
          <button
            @click="isContactSheetOpen = true"
            class="bg-white p-3 rounded-xl shadow-md flex flex-col items-center justify-center space-y-1 transition-transform active:scale-95 border border-slate-200 hover:bg-slate-50"
          >
            <Icon name="solar:phone-bold-duotone" class="text-2xl text-indigo-600" />
            <span class="text-xs font-semibold text-slate-700">ติดต่อ</span>
          </button>
        </section>

        <!-- Contact Sheet -->
        <Teleport to="body">
          <transition
            enter-active-class="transition-all duration-300 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 translate-y-full"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-full"
          >
            <div v-if="isContactSheetOpen && contactInfo" class="fixed inset-0 z-50 flex items-end">
              <div
                @click="isContactSheetOpen = false"
                class="absolute inset-0 bg-black/40 backdrop-blur-sm"
              ></div>

              <div class="relative w-full bg-slate-100 rounded-t-2xl p-4 pb-6 space-y-4">
                <div class="text-center">
                  <div class="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3"></div>
                  <h3 class="text-lg font-bold text-slate-800">เลือกช่องทางการติดต่อ</h3>
                  <p class="text-sm text-slate-500">กรุณาเลือกช่องทางที่คุณสะดวกที่สุด</p>
                </div>

                <div class="space-y-3 pt-2">
                  <a
                    v-if="contactInfo.lineOA"
                    :href="`https://line.me/R/ti/p/${contactInfo.lineOA}`"
                    external
                    target="_blank"
                    class="contact-option line-button"
                  >
                    <Icon name="bi:line" class="text-2xl" />
                    <span>แชทผ่าน LINE</span>
                  </a>

                  <a
                    v-if="contactInfo.facebookPageId"
                    :href="`https://m.me/${contactInfo.facebookPageId}`"
                    external
                    target="_blank"
                    class="contact-option messenger-button"
                  >
                    <Icon name="brandico:facebook-rect" class="text-2xl" />
                    <span>ส่งข้อความทาง Facebook</span>
                  </a>

                  <a
                    v-if="contactInfo.phone"
                    :href="`tel:${contactInfo.phone}`"
                    class="contact-option"
                  >
                    <Icon name="solar:phone-calling-bold-duotone" class="text-2xl" />
                    <span>โทรออก: {{ contactInfo.phone }}</span>
                  </a>

                  <a
                    v-if="contactInfo.email"
                    :href="`mailto:${contactInfo.email}`"
                    class="contact-option"
                  >
                    <Icon name="solar:letter-bold-duotone" class="text-2xl" />
                    <span>ส่งอีเมล</span>
                  </a>
                </div>
              </div>
            </div>
          </transition>
        </Teleport>

        <!-- Current Bill Section -->
        <section>
          <h2 class="text-base font-bold text-slate-700 mb-3">บิลปัจจุบัน</h2>

          <div v-if="currentInvoice">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
              <div class="flex justify-between items-baseline pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-base font-bold text-slate-800">
                    สรุปยอดบิล: {{ currentInvoice.period }}
                  </h3>
                </div>
                <span class="text-xs font-semibold text-slate-500">
                  ครบกำหนด: {{ formatDate(currentInvoice.dueDate) }}
                </span>
              </div>
              <div class="text-center my-6">
                <p class="text-4xl font-bold text-slate-800 tracking-tight">
                  {{ formatNumber(currentInvoice.totalAmount) }}
                </p>
                <p class="text-sm font-medium text-slate-500">บาท</p>
              </div>
              <div class="space-y-3">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  รายละเอียดค่าใช้จ่าย
                </p>
                <ul class="text-sm space-y-2.5">
                  <li
                    v-for="item in currentInvoice.items"
                    :key="item.id"
                    class="flex justify-between items-start"
                  >
                    <span class="flex items-center gap-3 text-slate-700">
                      <Icon
                        :name="getItemIcon(item.type)"
                        class="text-xl flex-shrink-0"
                        :class="getItemIconColor(item.type)"
                      />
                      <div>
                        <span>{{ item.description }}</span>
                      </div>
                    </span>
                    <span class="font-mono font-semibold text-slate-800 pt-0.5">
                      {{ formatNumber(item.amount) }} บ.
                    </span>
                  </li>
                </ul>
              </div>
              <div class="mt-6 border-t border-slate-100 pt-4">
                <NuxtLink
                  :to="`/payment/${currentInvoice.id}`"
                  class="w-full block text-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  ไปที่หน้าชำระเงิน
                </NuxtLink>
              </div>
            </div>
          </div>

          <div v-else>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 text-center">
              <div
                class="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center"
              >
                <Icon name="solar:check-circle-bold-duotone" class="text-4xl text-green-500" />
              </div>
              <h3 class="mt-4 text-lg font-bold text-slate-800">ยอดชำระเป็นปัจจุบัน</h3>
              <p class="text-sm text-slate-500 mt-1">ไม่มีบิลค้างชำระสำหรับรอบบิลนี้</p>
              <div class="mt-6">
                <NuxtLink
                  to="/history/payment"
                  class="w-full block text-center bg-white text-indigo-600 font-bold py-2.5 px-4 rounded-lg border-2 border-indigo-200 hover:bg-indigo-50 transition-all"
                >
                  ดูประวัติการชำระเงิน
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>

        <!-- Chart Section -->
        <section v-if="invoiceHistory.length > 0" class="bg-white p-4 rounded-2xl shadow-md">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-base font-bold text-slate-800">ภาพรวมค่าใช้จ่าย</h2>
            <div class="flex gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                @click="timeframe = 3"
                :class="timeframe === 3 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'"
                class="px-2 py-1 rounded-md"
              >
                3M
              </button>
              <button
                @click="timeframe = 6"
                :class="timeframe === 6 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'"
                class="px-2 py-1 rounded-md"
              >
                6M
              </button>
              <button
                @click="timeframe = 12"
                :class="timeframe === 12 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'"
                class="px-2 py-1 rounded-md"
              >
                1Y
              </button>
            </div>
          </div>
          <ClientOnly>
            <apexchart type="area" height="250" :options="chartOptions" :series="chartSeries" />
          </ClientOnly>
        </section>

        <!-- Bill History -->
        <section v-if="invoiceHistory.length > 0" class="space-y-3">
          <h2 class="text-base font-bold text-slate-800">ประวัติบิลล่าสุด</h2>
          <div
            v-for="invoice in invoiceHistory.slice(0, 3)"
            :key="invoice.id"
            class="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3"
          >
            <div
              class="w-10 h-10 flex items-center justify-center rounded-lg"
              :class="invoice.status === 'PAID' ? 'bg-green-100' : 'bg-yellow-100'"
            >
              <Icon
                :name="
                  invoice.status === 'PAID'
                    ? 'solar:check-read-line-duotone'
                    : 'solar:document-text-bold-duotone'
                "
                class="text-2xl"
                :class="invoice.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'"
              />
            </div>
            <div class="flex-grow">
              <p class="font-bold text-slate-700">บิลประจำเดือน {{ invoice.period }}</p>
              <p class="text-sm text-slate-500">
                ยอดรวม {{ formatNumber(invoice.totalAmount) }} บาท
              </p>
            </div>
            <NuxtLink :to="`/payment/${invoice.id}`" class="p-2">
              <Icon name="solar:alt-arrow-right-linear" class="text-slate-400 text-xl" />
            </NuxtLink>
          </div>
          <div v-if="invoiceHistory.length > 3" class="pt-2">
            <NuxtLink
              to="/history/payment"
              class="w-full block text-center bg-white text-indigo-600 font-bold py-2.5 px-4 rounded-lg border-2 border-indigo-200 hover:bg-indigo-50 transition-all"
            >
              ดูประวัติทั้งหมด
            </NuxtLink>
          </div>
        </section>
      </main>
    </template>

    <!-- Error State -->
    <div v-else class="text-center pt-20 px-6">
      <Icon name="solar:home-cross-bold-duotone" class="text-8xl text-slate-300 mb-4" />
      <h3 class="text-lg font-semibold text-slate-700">ไม่พบข้อมูลห้อง</h3>
      <p class="text-slate-500">กรุณาลองใหม่อีกครั้ง</p>
      <NuxtLink
        to="/my-rooms"
        class="mt-4 inline-block bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg"
      >
        กลับไปหน้าห้องของฉัน
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import type { Room, Invoice } from '@repo/db'

definePageMeta({
  title: 'รายละเอียดห้อง',
  showFooter: false,
  headerVariant: 'page',
})

// Route & Stores
const route = useRoute()
const roomsStore = useRoomsStore()
const invoicesStore = useInvoicesStore()
const api = useApi()

// Utils
const { formatNumber } = useNumberFormat()

// State
const roomId = route.params.id as string
const room = ref<Room | null>(null)
const currentInvoice = ref<Invoice | null>(null)
const invoiceHistory = ref<Invoice[]>([])
const contactInfo = ref<any>(null)
const isContactSheetOpen = ref(false)
const isLoading = ref(true)
const timeframe = ref(6)

// Default image
const defaultImage =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2940&auto=format&fit=crop'

// Helper functions
const formatDate = (date: string) => {
  return dayjs(date).format('D MMM BBBB')
}

const getItemIcon = (type?: string) => {
  switch (type) {
    case 'RENT':
      return 'solar:home-smile-angle-bold-duotone'
    case 'WATER':
      return 'solar:droplet-bold-duotone'
    case 'ELECTRICITY':
      return 'solar:bolt-bold-duotone'
    case 'SERVICE':
      return 'solar:settings-bold-duotone'
    case 'LATE_FEE':
      return 'solar:danger-bold-duotone'
    default:
      return 'solar:document-text-bold-duotone'
  }
}

const getItemIconColor = (type?: string) => {
  switch (type) {
    case 'RENT':
      return 'text-indigo-500'
    case 'WATER':
      return 'text-sky-500'
    case 'ELECTRICITY':
      return 'text-amber-500'
    case 'SERVICE':
      return 'text-purple-500'
    case 'LATE_FEE':
      return 'text-red-500'
    default:
      return 'text-slate-500'
  }
}

// Fetch property contact info
const fetchPropertyInfo = async () => {
  if (!room.value?.property?.id) return

  try {
    const response = await api.properties.get(room.value.property.id)
    contactInfo.value = response.data?.contactInfo
    isContactSheetOpen.value = true
  } catch (error) {
    console.error('Failed to fetch property info:', error)
  }
}

// Chart data
const chartData = computed(() => {
  return invoiceHistory.value.slice(-timeframe.value).map((inv) => {
    const waterItem = inv.items.find((i) => i.type === 'WATER')
    const electricItem = inv.items.find((i) => i.type === 'ELECTRICITY')

    return {
      period: inv.period,
      water: waterItem?.amount || 0,
      electric: electricItem?.amount || 0,
    }
  })
})

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 250,
    zoom: { enabled: false },
    toolbar: { show: false },
    fontFamily: 'inherit',
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.1,
      stops: [0, 90, 100],
    },
  },
  xaxis: {
    categories: chartData.value.map((d) => d.period),
    labels: { style: { colors: '#64748b', fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#64748b', fontSize: '12px' },
      formatter: (val: number) => val.toFixed(0),
    },
  },
  tooltip: {
    y: { formatter: (val: number) => `฿${formatNumber(val)}` },
    theme: 'light',
  },
  colors: ['#6366f1', '#3b82f6'],
  grid: {
    show: true,
    borderColor: '#e5e7eb',
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
  },
  legend: { position: 'top', horizontalAlign: 'right' },
}))

const chartSeries = computed(() => [
  { name: 'ค่าไฟฟ้า', data: chartData.value.map((d) => d.electric) },
  { name: 'ค่าน้ำ', data: chartData.value.map((d) => d.water) },
])

// Lifecycle
onMounted(async () => {
  isLoading.value = true

  try {
    // Fetch room details
    await roomsStore.fetchRoom(roomId)
    room.value = roomsStore.currentRoom

    if (room.value) {
      // Fetch current invoice
      try {
        const currentInvoiceRes = await api.invoices.getCurrent()
        currentInvoice.value = currentInvoiceRes.data
      } catch (error) {
        // No current invoice - that's okay
        currentInvoice.value = null
      }

      // Fetch invoice history
      try {
        const historyRes = await api.invoices.getMy()
        invoiceHistory.value = historyRes.data || []
      } catch (error) {
        invoiceHistory.value = []
      }
    }
  } catch (error) {
    console.error('Failed to load room details:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.contact-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background-color: #fff;
  border-width: 2px;
  border-color: #e2e8f0;
  font-weight: bold;
  color: #334155;
  transition: all 0.2s;
}
.contact-option:active {
  transform: scale(0.95);
}
.contact-option:hover {
  border-color: #6366f1;
  background-color: #f0f5ff;
  color: #4338ca;
}
.contact-option.line-button {
  background-color: #22c55e;
  color: #fff;
  border-color: #16a34a;
}
.contact-option.line-button:hover {
  background-color: #16a34a;
  color: #fff;
  border-color: #16a34a;
}
.contact-option.messenger-button {
  background-color: #2563eb;
  color: #fff;
  border-color: #1d4ed8;
}
.contact-option.messenger-button:hover {
  background-color: #1d4ed8;
  color: #fff;
  border-color: #1d4ed8;
}
</style>
