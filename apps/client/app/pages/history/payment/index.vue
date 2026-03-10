<template>
  <div class="bg-slate-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <Icon name="ph:spinner-duotone" class="text-4xl animate-spin text-indigo-600" />
    </div>

    <!-- Main Content -->
    <main v-else class="p-4 max-w-4xl mx-auto">
      <section class="mb-6">
        <button
          @click="openFilter"
          class="w-full flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-200"
        >
          <div class="flex items-center gap-2">
            <Icon name="solar:filter-bold-duotone" class="text-xl text-indigo-600" />
            <span class="font-semibold text-slate-700">ตัวกรอง</span>
            <div
              v-if="activeFilterCount > 0"
              class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"
            ></div>
          </div>
          <div class="text-sm text-slate-500 flex items-center gap-2">
            <span>{{ activeFilterText }}</span>
            <Icon name="solar:alt-arrow-down-linear" />
          </div>
        </button>
      </section>

      <Teleport to="body">
        <div v-if="isFilterOpen" class="fixed inset-0 z-40" @keydown.esc="isFilterOpen = false">
          <div
            @click="isFilterOpen = false"
            class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          ></div>

          <div
            class="absolute bottom-0 left-0 right-0 bg-slate-50 rounded-t-2xl p-4 shadow-xl flex flex-col max-h-[80vh]"
          >
            <div
              class="flex justify-between items-center pb-3 mb-4 border-b border-slate-200 flex-shrink-0"
            >
              <button
                @click="resetFilters"
                class="text-sm font-semibold text-slate-500 hover:text-indigo-600"
              >
                ล้างค่า
              </button>
              <h3 class="font-bold text-slate-800">ตัวกรอง</h3>
              <button @click="isFilterOpen = false" class="p-1">
                <Icon name="ph:x-bold" class="text-xl text-slate-500" />
              </button>
            </div>

            <div class="space-y-6 overflow-y-auto">
              <div class="space-y-2">
                <p class="font-bold text-slate-700">ปี</p>
                <USelect
                  v-model="tempSelectedYear"
                  :items="yearOptions"
                  value-key="value"
                  placeholder="ทุกปี"
                  color="neutral"
                  variant="outline"
                  size="md"
                  class="w-full"
                  icon="i-lucide-chevron-down"
                />
              </div>

              <div class="space-y-2">
                <p class="font-bold text-slate-700">สถานะ</p>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    v-for="status in statusOptions"
                    :key="status.value"
                    @click="tempSelectedStatus = status.value"
                    class="filter-option"
                    :class="{ active: tempSelectedStatus === status.value }"
                  >
                    {{ status.label }}
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-6 flex-shrink-0">
              <button
                @click="applyFilters"
                class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30"
              >
                แสดงผลลัพธ์
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <div class="space-y-6">
        <template v-if="filteredHistory.length > 0">
          <div v-for="group in filteredHistory" :key="group.year" class="space-y-3">
            <h2 class="text-base font-bold text-slate-500 pb-2 border-b-2 border-slate-200">
              พ.ศ. {{ convertADtoBE(group.year) }}
            </h2>
            <ul class="space-y-3">
              <li v-for="item in group.invoices" :key="item.id">
                <NuxtLink
                  :to="`/payment/${item.id}`"
                  class="block bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex flex-col items-center justify-center w-12 text-center">
                      <p class="text-xs font-semibold text-indigo-600">
                        {{ item.monthLabel }}
                      </p>
                      <p class="text-xl font-bold text-slate-800">
                        {{ item.dayLabel }}
                      </p>
                    </div>
                    <div class="flex-grow border-l border-slate-200 pl-3">
                      <p class="font-bold text-slate-800">{{ item.title }}</p>
                      <p class="text-sm text-slate-500">
                        ยอดชำระ: {{ formatNumber(item.totalAmount) }} บาท
                      </p>
                    </div>
                    <div
                      class="flex items-center gap-1.5 text-sm font-semibold"
                      :class="getStatusColorClass(item.status)"
                    >
                      <Icon :name="getStatusIcon(item.status)" />
                      <span>{{ getStatusLabel(item.status) }}</span>
                    </div>
                  </div>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </template>
        <div v-else class="text-center pt-16 px-6">
          <Icon name="solar:file-text-line-duotone" class="text-7xl text-slate-300 mb-4" />
          <h3 class="text-lg font-semibold text-slate-700">ไม่พบรายการ</h3>
          <p class="text-slate-500">ไม่พบประวัติการชำระเงินที่ตรงกับตัวกรองของคุณ</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useThaiYearConverter } from '~/composables/useThaiYearConverter'
import type { Invoice, InvoiceStatus } from '@repo/db'
definePageMeta({ title: 'ประวัติการชำระเงิน', showFooter: false })

// Composables & Stores
const { formatNumber } = useNumberFormat()
const { convertADtoBE } = useThaiYearConverter()
const invoicesStore = useInvoicesStore()

// Filter State
const isFilterOpen = ref(false)
const selectedYear = ref('all')
const selectedStatus = ref('all')
const tempSelectedYear = ref('all')
const tempSelectedStatus = ref('all')

// Computed
const isLoading = computed(() => invoicesStore.isLoading)
const invoices = computed(() => invoicesStore.invoices)

// Generate year options dynamically based on available invoice data
const yearOptions = computed(() => {
  const currentGregorianYear = dayjs().year()
  const fixedStartGregorianYear = 2024

  const options = [{ value: 'all', label: 'ทุกปี' }]

  for (
    let gregorianYear = fixedStartGregorianYear;
    gregorianYear <= currentGregorianYear;
    gregorianYear++
  ) {
    const buddhistYear = gregorianYear + 543
    options.push({
      value: String(gregorianYear),
      label: String(buddhistYear),
    })
  }

  return options
})

const statusOptions = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'PAID', label: 'ชำระแล้ว' },
  { value: 'UNPAID', label: 'รอชำระ' },
  { value: 'OVERDUE', label: 'ค้างชำระ' },
]

// Group invoices by year and format for display
const groupedInvoices = computed(() => {
  const groups = new Map<
    number,
    {
      year: number
      invoices: Array<
        Invoice & {
          dayLabel: string
          monthLabel: string
          title: string
        }
      >
    }
  >()

  invoices.value.forEach((invoice) => {
    const issueDate = dayjs(invoice.issueDate)
    const year = issueDate.year()

    if (!groups.has(year)) {
      groups.set(year, { year, invoices: [] })
    }

    const monthNames = [
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ]

    groups.get(year)!.invoices.push({
      ...invoice,
      dayLabel: issueDate.format('DD'),
      monthLabel: monthNames[issueDate.month()],
      title: `ค่าบริการรอบเดือน ${issueDate.subtract(1, 'month').format('MMM')}`,
    })
  })

  // Sort by year descending
  return Array.from(groups.values()).sort((a, b) => b.year - a.year)
})

// Apply filters
const filteredHistory = computed(() => {
  return groupedInvoices.value
    .map((group) => {
      const filteredInvoices = group.invoices.filter((invoice) => {
        const statusMatch =
          selectedStatus.value === 'all' || invoice.status === selectedStatus.value
        return statusMatch
      })
      return { ...group, invoices: filteredInvoices }
    })
    .filter((group) => {
      const yearMatch = selectedYear.value === 'all' || group.year == Number(selectedYear.value)
      return yearMatch && group.invoices.length > 0
    })
})

const activeFilterCount = computed(() => {
  let count = 0
  if (selectedYear.value !== 'all') count++
  if (selectedStatus.value !== 'all') count++
  return count
})

const activeFilterText = computed(() => {
  if (activeFilterCount.value === 0) return 'ทั้งหมด'
  const yearText = yearOptions.value.find((y) => y.value === selectedYear.value)?.label || ''
  const statusText = statusOptions.find((s) => s.value === selectedStatus.value)?.label || ''
  return (
    [yearText, statusText]
      .filter(Boolean)
      .filter((t) => t !== 'ทุกปี' && t !== 'ทั้งหมด')
      .join(', ') || 'ทั้งหมด'
  )
})

// Helper functions
const getStatusLabel = (status: InvoiceStatus): string => {
  const labels: Record<InvoiceStatus, string> = {
    PAID: 'ชำระแล้ว',
    UNPAID: 'รอชำระ',
    OVERDUE: 'ค้างชำระ',
    CANCELLED: 'ยกเลิก',
  }
  return labels[status] || status
}

const getStatusIcon = (status: InvoiceStatus): string => {
  const icons: Record<InvoiceStatus, string> = {
    PAID: 'solar:check-circle-bold',
    UNPAID: 'solar:clock-circle-bold',
    OVERDUE: 'solar:close-circle-bold',
    CANCELLED: 'solar:close-circle-bold',
  }
  return icons[status] || 'solar:question-circle-bold'
}

const getStatusColorClass = (status: InvoiceStatus): string => {
  const colors: Record<InvoiceStatus, string> = {
    PAID: 'text-green-600',
    UNPAID: 'text-yellow-600',
    OVERDUE: 'text-red-600',
    CANCELLED: 'text-slate-400',
  }
  return colors[status] || 'text-slate-600'
}

// Functions
function openFilter() {
  tempSelectedYear.value = selectedYear.value
  tempSelectedStatus.value = selectedStatus.value
  isFilterOpen.value = true
}

function applyFilters() {
  selectedYear.value = tempSelectedYear.value
  selectedStatus.value = tempSelectedStatus.value
  isFilterOpen.value = false
}

function resetFilters() {
  tempSelectedYear.value = 'all'
  tempSelectedStatus.value = 'all'
}

// Lifecycle
onMounted(async () => {
  // Fetch all invoices without filters - we'll filter client-side
  await invoicesStore.fetchInvoices()
})
</script>

<style scoped>
.filter-option {
  width: 100%;
  text-align: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border-width: 2px;
  border-color: #e2e8f0; /* slate-200 */
  background-color: #fff;
  font-weight: 600;
  color: #334155; /* slate-700 */
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-duration: 150ms;
}
.filter-option.active {
  border-color: #6366f1; /* indigo-500 */
  background-color: #eef2ff; /* indigo-50 */
  color: #4338ca; /* indigo-700 */
  box-shadow: 0 0 0 2px #c7d2fe; /* ring-2 ring-indigo-200 */
}
</style>
