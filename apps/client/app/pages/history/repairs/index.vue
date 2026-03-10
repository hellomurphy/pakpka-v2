<template>
  <div class="bg-slate-50">
    <main class="p-4 max-w-4xl mx-auto">
      <div class="mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            v-for="filter in filters"
            :key="filter.id"
            class="px-4 py-1.5 text-sm font-semibold rounded-full transition-colors whitespace-nowrap"
            :class="
              activeFilter === filter.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            "
            @click="activeFilter = filter.id"
          >
            {{ filter.name }}
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="text-center pt-24">
        <Icon name="ph:spinner-duotone" class="text-5xl animate-spin text-indigo-500 mb-3" />
        <p class="text-slate-500">กำลังโหลดรายการแจ้งซ่อม...</p>
      </div>

      <div v-else-if="filteredTickets.length > 0" class="space-y-4">
        <RepairHistoryCard v-for="ticket in filteredTickets" :key="ticket.id" :ticket="ticket" />
      </div>

      <div v-else class="text-center pt-24 px-6">
        <Icon name="ph:wrench-duotone" class="text-7xl text-slate-300 mb-4" />
        <h3 class="text-lg font-semibold text-slate-700">ไม่พบรายการแจ้งซ่อม</h3>
        <p class="text-slate-500">ประวัติการแจ้งซ่อมของคุณที่ตรงกับตัวกรองจะปรากฏที่นี่</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import RepairHistoryCard from './components/RepairCard.vue'

definePageMeta({
  title: 'รายการแจ้งซ่อม',
  headerVariant: 'page',
  showFooter: false,
})

const api = useApi()
const activeFilter = ref('all')
const isLoading = ref(true)

const filters = [
  { id: 'all', name: 'ทั้งหมด' },
  { id: 'in_progress', name: 'กำลังดำเนินการ' },
  { id: 'completed', name: 'เสร็จสิ้นแล้ว' },
  { id: 'cancelled', name: 'ยกเลิก' },
]

const repairTickets = ref<
  Array<{
    id: string
    title: string
    roomNumber: string
    timeline: Array<{ status: string; name: string; timestamp: string; reason?: string }>
  }>
>([])

function formatTimelineDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusToTimelineItem(
  status: string,
  createdAt: string | Date,
  updatedAt?: string | Date,
): { status: string; name: string; timestamp: string } {
  const ts = formatTimelineDate(updatedAt ?? createdAt)
  const map: Record<string, string> = {
    PENDING: 'แจ้งเรื่องแล้ว',
    IN_PROGRESS: 'กำลังดำเนินการ',
    COMPLETED: 'เสร็จสิ้นแล้ว',
    CANCELLED: 'ยกเลิก',
  }
  const statusKey =
    status === 'PENDING'
      ? 'submitted'
      : status === 'IN_PROGRESS'
        ? 'in_progress'
        : status === 'COMPLETED'
          ? 'completed'
          : 'cancelled'
  return { status: statusKey, name: map[status] ?? status, timestamp: ts }
}

function mapApiToTicket(raw: {
  id: string
  title: string
  description?: string
  status: string
  room?: { roomNumber: string } | null
  createdAt: string | Date
  updatedAt?: string | Date
}) {
  const roomNumber = raw.room?.roomNumber ?? '—'
  const status = raw.status as string
  const timeline = [statusToTimelineItem(status, raw.createdAt, raw.updatedAt)]
  return {
    id: raw.id,
    title: raw.title || raw.description || 'แจ้งซ่อม',
    roomNumber,
    timeline,
  }
}

const filteredTickets = computed(() => {
  if (activeFilter.value === 'all') return repairTickets.value
  return repairTickets.value.filter((ticket) => {
    const currentStatus = ticket.timeline[ticket.timeline.length - 1]?.status
    if (activeFilter.value === 'in_progress') {
      return ['submitted', 'in_progress'].includes(currentStatus)
    }
    return currentStatus === activeFilter.value
  })
})

onMounted(async () => {
  isLoading.value = true
  try {
    const res = await api.maintenance.list()
    const list = (res.data as { maintenanceRequests?: unknown[] })?.maintenanceRequests ?? []
    repairTickets.value = list.map((item: Record<string, unknown>) =>
      mapApiToTicket({
        id: String(item.id),
        title: String(item.title ?? ''),
        description: item.description as string | undefined,
        status: String(item.status ?? 'PENDING'),
        room: item.room as { roomNumber: string } | null,
        createdAt: item.createdAt as string,
        updatedAt: item.updatedAt as string | undefined,
      }),
    )
  } catch {
    repairTickets.value = []
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Utility to hide scrollbar but keep it scrollable */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
