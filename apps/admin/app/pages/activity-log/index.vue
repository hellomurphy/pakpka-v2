<script setup>
import { ref, reactive } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import {
  CurrencyDollarIcon,
  UserIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
  KeyIcon,
} from '@heroicons/vue/24/outline'

// --- State Management for Filters ---
const filters = reactive({
  dateRange: 'today',
  actor: 'all',
  eventType: 'all',
})

// --- Modal State for "View Details" ---
const isDetailModalOpen = ref(false)
const selectedLogDetails = ref(null)

// --- Mock Data ---
// ในแอปจริง ข้อมูลนี้จะถูก fetch มาจาก API โดยใช้ useFetch และส่ง filters ไปเป็น query params
const allLogs = ref([
  {
    id: 1,
    icon: CurrencyDollarIcon,
    iconBgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    actor: { name: 'คุณวิชัย', role: 'ผู้เช่าห้อง B-101' },
    action: 'ได้อัปโหลดสลิปสำหรับการชำระเงิน',
    target: null,
    timestamp: new Date(),
  },
  {
    id: 2,
    icon: CheckBadgeIcon,
    iconBgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    actor: { name: 'คุณสมศรี', role: 'Admin' },
    action: 'ได้ยืนยันการชำระเงินของบิลห้อง',
    target: 'B-101',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
  },
  {
    id: 3,
    icon: PencilSquareIcon,
    iconBgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    actor: { name: 'คุณสมชาย', role: 'Admin' },
    action: 'ได้แก้ไขข้อมูลค่าเช่าของ',
    target: 'ห้อง Deluxe',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    details: { before: '฿5,500', after: '฿5,800' },
  },
  {
    id: 4,
    icon: UserIcon,
    iconBgColor: 'bg-sky-50',
    iconColor: 'text-sky-600',
    actor: { name: 'คุณสมชาย', role: 'Admin' },
    action: 'ได้เพิ่มผู้เช่าใหม่:',
    target: 'คุณมานะ ใจดี',
    meta: 'เข้าสู่ห้อง A-205',
    timestamp: new Date('2025-08-10T09:41:00'),
  },
  {
    id: 5,
    icon: KeyIcon,
    iconBgColor: 'bg-gray-50',
    iconColor: 'text-gray-600',
    actor: { name: 'คุณสมศรี', role: 'Admin' },
    action: 'ได้เข้าระบบ',
    target: null,
    timestamp: new Date('2025-08-10T09:30:00'),
  },
])

// Helper function to format timestamp into a readable story
const formatTimestamp = (date) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const time = date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (date >= today) {
    return `วันนี้, ${time} น.`
  }
  if (date >= yesterday) {
    return `เมื่อวานนี้, ${time} น.`
  }
  return (
    date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + `, ${time} น.`
  )
}

const openDetailModal = (log) => {
  selectedLogDetails.value = log
  isDetailModalOpen.value = true
}
</script>

<template>
  <UnderDevelopment v-if="true" page-name="ประวัติการเคลื่อนไหว" />

  <div v-else class="p-6 md:px-8 bg-slate-50 min-h-full">
    <header class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">ประวัติการเคลื่อนไหว</h1>
      <p class="mt-1 text-sm text-gray-600">ตรวจสอบกิจกรรมทั้งหมดที่เกิดขึ้นในระบบของคุณ</p>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <BaseSelect
        v-model="filters.dateRange"
        label="ช่วงเวลา"
        :options="[
          { value: 'today', label: 'วันนี้' },
          { value: '7days', label: '7 วันที่ผ่านมา' },
        ]"
      />
      <BaseSelect
        v-model="filters.actor"
        label="ผู้กระทำ"
        :options="[{ value: 'all', label: 'ทุกคน' }]"
      />
      <BaseSelect
        v-model="filters.eventType"
        label="ประเภทกิจกรรม"
        :options="[{ value: 'all', label: 'ทุกกิจกรรม' }]"
      />
    </div>

    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <ul role="list" class="divide-y divide-gray-200">
        <li
          v-for="log in allLogs"
          :key="log.id"
          class="relative flex items-start space-x-4 px-4 py-5 sm:px-6"
        >
          <div class="flex-shrink-0">
            <span
              :class="[
                log.iconBgColor,
                'inline-flex h-10 w-10 items-center justify-center rounded-full',
              ]"
            >
              <component :is="log.icon" :class="[log.iconColor, 'h-6 w-6']" aria-hidden="true" />
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm text-gray-800">
              <span class="font-semibold">{{ log.actor.name }}</span>
              <span class="text-gray-500 text-xs ml-1">({{ log.actor.role }})</span>
              {{ log.action }}
              <span v-if="log.target" class="font-semibold">{{ log.target }}</span>
              <span v-if="log.meta" class="ml-1">{{ log.meta }}</span>
            </p>
            <p class="mt-1 text-xs text-gray-500">
              {{ formatTimestamp(log.timestamp) }}
              <template v-if="log.details">
                <span class="mx-1">·</span>
                <a
                  href="#"
                  class="font-semibold text-blue-600 hover:underline"
                  @click.prevent="openDetailModal(log)"
                >
                  ดูรายละเอียด
                </a>
              </template>
            </p>
          </div>
        </li>
      </ul>
    </div>

    <BaseModal
      v-if="selectedLogDetails"
      v-model="isDetailModalOpen"
      max-width="md"
      :persistent="true"
    >
      <template #title> รายละเอียดการแก้ไข </template>
      <div class="mt-4 text-sm">
        <p class="text-gray-500">
          <span class="font-semibold">{{ selectedLogDetails.actor.name }}</span>
          ได้แก้ไข
          <span class="font-semibold">{{ selectedLogDetails.target }}</span>
        </p>
        <div class="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
          <div>
            <p class="font-medium text-gray-500">ข้อมูลก่อนแก้ไข</p>
            <p class="font-semibold text-gray-800">
              {{ selectedLogDetails.details.before }}
            </p>
          </div>
          <div>
            <p class="font-medium text-gray-500">ข้อมูลหลังแก้ไข</p>
            <p class="font-semibold text-green-600">
              {{ selectedLogDetails.details.after }}
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          class="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          @click="isDetailModalOpen = false"
        >
          ปิด
        </button>
      </template>
    </BaseModal>
  </div>
</template>
