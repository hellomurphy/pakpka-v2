<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFormatters } from '~/composables/useFormatters'
import { usePropertyStore } from '~/store/propertyStore'
import { useRoomsStore } from '~/pages/rooms/store/roomsStore'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import AddEditRoomModal from '~/pages/rooms/components/AddEditRoomModal.vue'
import NoticeMoveOutModal from '~/pages/rooms/components/NoticeMoveOutModal.vue'
import CreateInvoiceModal from '~/pages/rooms/components/CreateInvoiceModal.vue'

dayjs.extend(buddhistEra)

// --- Setup ---
const route = useRoute()
const router = useRouter()
const roomId = route.params.id as string
const { currency } = useFormatters()

// --- Stores ---
const propertyStore = usePropertyStore()
const roomsStore = useRoomsStore()
const { propertyId } = storeToRefs(propertyStore)

// --- State ---
const activeTab = ref('overview') // overview | invoices | meters | history
const editRoomModalRef = ref<InstanceType<typeof AddEditRoomModal> | null>(null)
const moveOutModalRef = ref<InstanceType<typeof NoticeMoveOutModal> | null>(null)
const createInvoiceModalRef = ref<InstanceType<typeof CreateInvoiceModal> | null>(null)

// --- Load floors and roomTypes for Modal ---
onMounted(async () => {
  if (propertyId.value && (!roomsStore.floors.length || !roomsStore.roomTypes.length)) {
    await roomsStore.fetchInitialPageData(propertyId.value)
  }
})

// --- Fetch Data ---
const {
  data: room,
  refresh,
  pending,
  error,
} = await useFetch<Record<string, unknown>>(`/api/rooms/${roomId}`)

// Debug: Log the room data
watchEffect(() => {
  if (room.value) {
    console.log('Room data:', room.value)
  }
  if (error.value) {
    console.error('Room fetch error:', error.value)
  }
})

// --- Formatters ---
const formatDate = (date: string | Date) => {
  if (!date) return '-'
  return dayjs(date).locale('th').format('D MMM BB')
}

const formatCurrency = (amount: number | string) => {
  if (!amount) return '฿0.00'
  return currency(Number(amount))
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OCCUPIED':
      return 'bg-green-100 text-green-800'
    case 'AVAILABLE':
      return 'bg-gray-100 text-gray-800'
    case 'MAINTENANCE':
      return 'bg-yellow-100 text-yellow-800'
    case 'CLEANING':
      return 'bg-purple-100 text-purple-800'
    case 'RESERVED':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'OCCUPIED':
      return 'มีผู้เช่า'
    case 'AVAILABLE':
      return 'ว่าง'
    case 'MAINTENANCE':
      return 'ซ่อมบำรุง'
    case 'CLEANING':
      return 'ทำความสะอาด'
    case 'RESERVED':
      return 'จองแล้ว'
    default:
      return status
  }
}

const getInvoiceStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'UNPAID':
      return 'bg-yellow-100 text-yellow-800'
    case 'OVERDUE':
      return 'bg-red-100 text-red-800'
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getInvoiceStatusLabel = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'ชำระแล้ว'
    case 'UNPAID':
      return 'ยังไม่ชำระ'
    case 'OVERDUE':
      return 'เกินกำหนด'
    case 'CANCELLED':
      return 'ยกเลิก'
    default:
      return status
  }
}

// --- Computed ---
const calculateUsage = (invoice: Record<string, unknown>, type: 'electricity' | 'water') => {
  const meterReadings = invoice.meterReadings as Record<string, { value?: unknown }> | undefined
  const currentValue = meterReadings?.[type]?.value
  if (!currentValue) return '-'

  // หาค่าเดือนก่อนหน้า
  const invoices = (room.value as Record<string, unknown>)?.invoices as { id: string }[] | undefined
  const currentIndex = invoices?.findIndex((inv) => inv.id === invoice.id)
  if (currentIndex === undefined || currentIndex === -1) return '-'

  const previousInvoice = room.value?.invoices?.[currentIndex + 1]
  const previousValue = previousInvoice?.meterReadings?.[type]?.value

  if (!previousValue) return '-'

  const usage = Number(currentValue) - Number(previousValue)
  return usage > 0 ? usage.toString() : '0'
}

// --- Actions ---
const handleMoveOut = () => {
  if (!room.value?.currentContract) return
  moveOutModalRef.value?.open(room.value.currentContract)
}

const handleEditRoom = () => {
  if (!room.value) return
  editRoomModalRef.value?.open(room.value)
}

const handleCreateInvoice = () => {
  if (!room.value) return
  createInvoiceModalRef.value?.open(room.value)
}
</script>

<template>
  <div>
    <!-- Skeleton Loading State -->
    <div v-if="pending" class="bg-white max-w-7xl mx-auto p-4 space-y-6">
      <!-- Header Skeleton -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex-1">
          <div class="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
          <div class="h-8 w-32 bg-gray-300 rounded animate-pulse mb-2" />
          <div class="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div class="flex gap-2">
          <div class="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          <div class="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <!-- Tabs Skeleton -->
      <div class="border-b border-gray-200">
        <div class="flex space-x-8">
          <div v-for="n in 4" :key="n" class="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <!-- Content Skeleton -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div class="space-y-6">
            <div v-for="n in 3" :key="n">
              <div class="h-6 w-40 bg-gray-300 rounded animate-pulse mb-4" />
              <div class="space-y-3">
                <div v-for="i in 3" :key="i" class="flex justify-between">
                  <div class="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div class="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div class="space-y-6">
            <div class="h-6 w-40 bg-gray-300 rounded animate-pulse mb-4" />
            <div class="grid grid-cols-2 gap-4">
              <div class="h-32 bg-gray-200 rounded-lg animate-pulse" />
              <div class="h-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white max-w-7xl mx-auto p-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-400 text-5xl mb-4">⚠️</div>
        <h3 class="text-lg font-medium text-red-900 mb-2">เกิดข้อผิดพลาด</h3>
        <p class="text-red-700 mb-4">ไม่สามารถโหลดข้อมูลห้องพักได้</p>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          @click="refresh()"
        >
          ลองอีกครั้ง
        </button>
      </div>
    </div>

    <div v-else-if="room" class="bg-white rounded-xl mx-auto p-4 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            class="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
            @click="router.back()"
          >
            ← กลับไปหน้ารวม
          </button>
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold text-gray-900">ห้อง {{ room.roomNumber }}</h1>
            <span
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="getStatusColor(room.status)"
            >
              {{ getStatusLabel(room.status) }}
            </span>
          </div>
          <p class="text-gray-500 mt-1">
            ชั้น {{ room.floor?.name || '-' }} •
            {{ room.roomType?.name || 'Standard' }}
          </p>
        </div>

        <div class="flex gap-2">
          <button
            class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm"
            @click="handleEditRoom"
          >
            แก้ไขห้อง
          </button>

          <template v-if="room.status === 'OCCUPIED'">
            <button
              class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm"
              @click="handleCreateInvoice"
            >
              สร้างใบแจ้งหนี้ใหม่
            </button>
            <button
              class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium shadow-sm"
              @click="handleMoveOut"
            >
              แจ้งย้ายออก
            </button>
          </template>

          <template v-else-if="room.status === 'AVAILABLE'">
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
            >
              + รับผู้เช่าใหม่
            </button>
          </template>
        </div>
      </div>

      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in [
              { id: 'overview', name: 'ข้อมูลปัจจุบัน' },
              { id: 'invoices', name: 'ประวัติบิล' },
              { id: 'meters', name: 'ประวัติมิเตอร์' },
              { id: 'history', name: 'ประวัติผู้เช่า' },
            ]"
            :key="tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <div class="bg-white shadow rounded-lg p-6 lg:p-8 min-h-[400px]">
        <div v-show="activeTab === 'overview'">
          <div
            v-if="room.status === 'OCCUPIED' && room.currentTenant"
            class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
          >
            <!-- Left Column: ผู้เช่า + สัญญา -->
            <div class="space-y-6">
              <!-- ข้อมูลผู้เช่า -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  👤 ผู้เช่าปัจจุบัน
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-500">ชื่อ-นามสกุล</span>
                    <span class="font-medium">{{ room.currentTenant.name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">เบอร์โทร</span>
                    <span class="font-medium">{{ room.currentTenant.phone || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">สถานะ</span>
                    <span
                      class="text-xs px-2 py-0.5 rounded-full"
                      :class="
                        room.currentTenant.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      "
                    >
                      {{ room.currentTenant.status }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- ข้อมูลสัญญา -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">📄 สัญญาเช่า</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-500">เริ่มสัญญา</span>
                    <span class="font-medium">{{
                      formatDate(room.currentContract?.startDate)
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">สิ้นสุดสัญญา</span>
                    <span class="font-medium">{{ formatDate(room.currentContract?.endDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">ค่าเช่า</span>
                    <span class="font-medium"
                      >{{ formatCurrency(room.currentContract?.rentAmount) }} / เดือน</span
                    >
                  </div>
                </div>

                <!-- บริการเสริม -->
                <div v-if="room.currentContract?.services?.length" class="mt-4 pt-4 border-t">
                  <h4 class="text-sm font-medium text-gray-900 mb-2">บริการเสริม</h4>
                  <div class="space-y-2">
                    <div
                      v-for="service in room.currentContract.services"
                      :key="service.id"
                      class="flex justify-between text-sm"
                    >
                      <span class="text-gray-600">{{ service.serviceName }}</span>
                      <span class="font-medium">{{ formatCurrency(service.price) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- เงินประกัน -->
              <div v-if="room.deposit">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  💰 เงินประกัน
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-500">จำนวนเงิน</span>
                    <span class="font-medium">{{ formatCurrency(room.deposit.amount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">วันที่รับ</span>
                    <span class="font-medium">{{ formatDate(room.deposit.receivedDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">สถานะ</span>
                    <span
                      class="text-xs px-2 py-0.5 rounded-full"
                      :class="
                        room.deposit.clearanceStatus === 'REFUNDED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      "
                    >
                      {{ room.deposit.clearanceStatus }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: มิเตอร์ + อัตรา -->
            <div class="space-y-6">
              <!-- มิเตอร์ล่าสุด -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  📊 มิเตอร์ล่าสุด
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div class="text-xs text-yellow-600 mb-1">⚡ ไฟฟ้า</div>
                    <div class="text-2xl font-bold text-yellow-800">
                      {{ room.lastMeterReading?.electricity?.value || 0 }}
                    </div>
                    <div
                      v-if="room.lastMeterReading?.electricity?.date"
                      class="text-xs text-yellow-600 mt-1"
                    >
                      {{ formatDate(room.lastMeterReading.electricity.date) }}
                    </div>
                  </div>
                  <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div class="text-xs text-blue-600 mb-1">💧 น้ำประปา</div>
                    <div class="text-2xl font-bold text-blue-800">
                      {{ room.lastMeterReading?.water?.value || 0 }}
                    </div>
                    <div
                      v-if="room.lastMeterReading?.water?.date"
                      class="text-xs text-blue-600 mt-1"
                    >
                      {{ formatDate(room.lastMeterReading.water.date) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- อัตราค่าสาธารณูปโภค -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  ⚙️ อัตราค่าสาธารณูปโภค
                </h3>
                <div class="space-y-4">
                  <!-- ค่าไฟ -->
                  <div class="bg-yellow-50 p-3 rounded-lg">
                    <div class="font-medium text-yellow-900 mb-2">⚡ ไฟฟ้า</div>
                    <div class="text-sm space-y-1">
                      <div class="flex justify-between">
                        <span class="text-yellow-700">ประเภท:</span>
                        <span class="font-medium text-yellow-900">
                          {{
                            room.currentContract?.electricityBillingType === 'PER_UNIT'
                              ? 'คิดต่อหน่วย'
                              : 'อัตราคงที่'
                          }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-yellow-700">อัตรา:</span>
                        <span class="font-medium text-yellow-900">
                          {{ formatCurrency(room.currentContract?.electricityRate) }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-yellow-700">ขั้นต่ำ:</span>
                        <span class="font-medium text-yellow-900">
                          {{ formatCurrency(room.currentContract?.electricityMinimumCharge) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- ค่าน้ำ -->
                  <div class="bg-blue-50 p-3 rounded-lg">
                    <div class="font-medium text-blue-900 mb-2">💧 น้ำประปา</div>
                    <div class="text-sm space-y-1">
                      <div class="flex justify-between">
                        <span class="text-blue-700">ประเภท:</span>
                        <span class="font-medium text-blue-900">
                          {{
                            room.currentContract?.waterBillingType === 'PER_UNIT'
                              ? 'คิดต่อหน่วย'
                              : 'อัตราคงที่'
                          }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-blue-700">อัตรา:</span>
                        <span class="font-medium text-blue-900">
                          {{ formatCurrency(room.currentContract?.waterRate) }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-blue-700">ขั้นต่ำ:</span>
                        <span class="font-medium text-blue-900">
                          {{ formatCurrency(room.currentContract?.waterMinimumCharge) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ห้องว่าง -->
          <div v-else-if="room.status === 'AVAILABLE'" class="text-center py-12">
            <div class="text-gray-300 text-5xl mb-4">🏠</div>
            <h3 class="text-lg font-medium text-gray-900">ห้องว่าง</h3>
            <p class="text-gray-500 mb-6">ยังไม่มีผู้เช่าในขณะนี้</p>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              ทำสัญญาเข้าพัก
            </button>
          </div>

          <!-- ห้องจอง -->
          <div
            v-else-if="room.status === 'RESERVED' && room.activeReservation"
            class="text-center py-12"
          >
            <div class="text-blue-300 text-5xl mb-4">📅</div>
            <h3 class="text-lg font-medium text-gray-900">ห้องจองแล้ว</h3>
            <div class="mt-6 max-w-md mx-auto bg-blue-50 p-4 rounded-lg">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-blue-700">ผู้จอง:</span>
                  <span class="font-medium text-blue-900">{{
                    room.activeReservation.tenant.name
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-blue-700">เบอร์:</span>
                  <span class="font-medium text-blue-900">{{
                    room.activeReservation.tenant.phone
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-blue-700">วันเริ่ม:</span>
                  <span class="font-medium text-blue-900">{{
                    formatDate(room.activeReservation.startDate)
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- สถานะอื่นๆ -->
          <div v-else class="text-center py-12">
            <div class="text-gray-300 text-5xl mb-4">🔧</div>
            <h3 class="text-lg font-medium text-gray-900">
              {{ getStatusLabel(room.status) }}
            </h3>
            <p class="text-gray-500">ห้องอยู่ในสถานะ {{ getStatusLabel(room.status) }}</p>
          </div>
        </div>

        <div v-show="activeTab === 'invoices'">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    รอบบิล
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    ยอดรวม
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    ชำระแล้ว
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    สถานะ
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    กำหนดชำระ
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="inv in room.invoices" :key="inv.id" class="hover:bg-gray-50">
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {{ dayjs(inv.period).format('MMM BBBB') }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-right font-medium">
                    {{ formatCurrency(inv.totalAmount) }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-right">
                    {{ formatCurrency(inv.paidAmount) }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-center">
                    <span
                      class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="getInvoiceStatusColor(inv.status)"
                    >
                      {{ getInvoiceStatusLabel(inv.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(inv.dueDate) }}
                  </td>
                </tr>
                <tr v-if="!room.invoices?.length">
                  <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                    ยังไม่มีประวัติบิล
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-show="activeTab === 'meters'">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    รอบบิล
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    ⚡ ไฟฟ้า
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    💧 น้ำ
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    หน่วยไฟ
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    หน่วยน้ำ
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    วันที่จด
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="inv in room.invoices" :key="inv.id" class="hover:bg-gray-50">
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {{ dayjs(inv.period).format('MMM BBBB') }}
                  </td>
                  <td
                    class="px-4 py-4 whitespace-nowrap text-sm text-right font-mono text-yellow-700"
                  >
                    {{ inv.meterReadings?.electricity?.value || '-' }}
                  </td>
                  <td
                    class="px-4 py-4 whitespace-nowrap text-sm text-right font-mono text-blue-700"
                  >
                    {{ inv.meterReadings?.water?.value || '-' }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    <template v-if="inv.meterReadings?.electricity">
                      {{ calculateUsage(inv, 'electricity') }}
                    </template>
                    <template v-else> - </template>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    <template v-if="inv.meterReadings?.water">
                      {{ calculateUsage(inv, 'water') }}
                    </template>
                    <template v-else> - </template>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <template
                      v-if="inv.meterReadings?.electricity?.date || inv.meterReadings?.water?.date"
                    >
                      {{
                        formatDate(
                          inv.meterReadings?.electricity?.date || inv.meterReadings?.water?.date,
                        )
                      }}
                    </template>
                    <template v-else> - </template>
                  </td>
                </tr>
                <tr v-if="!room.invoices?.length">
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                    ยังไม่มีประวัติมิเตอร์
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-show="activeTab === 'history'">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ชื่อผู้เช่า
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    เบอร์โทร
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ช่วงเวลา
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="tenant in room.pastTenants"
                  :key="tenant.tenantId"
                  class="hover:bg-gray-50"
                >
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {{ tenant.name }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ tenant.phone }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(tenant.startDate) }} - {{ formatDate(tenant.endDate) }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-center">
                    <span
                      class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="
                        tenant.status === 'TERMINATED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      "
                    >
                      {{ tenant.status === 'TERMINATED' ? 'ยกเลิกสัญญา' : 'หมดสัญญา' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!room.pastTenants?.length">
                  <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                    ยังไม่มีประวัติผู้เช่าเก่า
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <!-- Modals -->
    <AddEditRoomModal ref="editRoomModalRef" @success="refresh" />
    <NoticeMoveOutModal ref="moveOutModalRef" @success="refresh" />
    <CreateInvoiceModal ref="createInvoiceModalRef" @success="refresh" />
  </div>
</template>
