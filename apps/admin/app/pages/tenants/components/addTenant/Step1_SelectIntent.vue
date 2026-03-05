<script setup>
import { BuildingOfficeIcon, CalendarDaysIcon, UserPlusIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['intent-selected'])

const intents = [
  {
    key: 'ACTIVE',
    title: 'ทำสัญญาเข้าอยู่เลย',
    description: 'สำหรับผู้เช่าที่พร้อมกำหนดห้องพักและเริ่มสัญญา',
    icon: BuildingOfficeIcon,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'UPCOMING',
    title: 'กำหนดเข้าพัก', // ✨ ปรับปรุงคำศัพท์ตามที่เราคุยกัน
    description: 'สำหรับทำสัญญาที่มีวันย้ายเข้าในอนาคต',
    icon: CalendarDaysIcon,
    iconClass: 'bg-sky-50 text-sky-600',
  },
  {
    key: 'WAITING_LIST',
    title: 'ลงชื่อใน Waiting List',
    description: 'สำหรับผู้ที่สนใจ แต่ยังไม่มีห้องว่างหรือยังไม่พร้อมทำสัญญา',
    icon: UserPlusIcon,
    iconClass: 'bg-gray-100 text-gray-600',
  },
]
</script>

<template>
  <div class="mt-4 space-y-3">
    <p class="text-sm text-gray-600">ผู้เช่าใหม่คนนี้อยู่ในสถานการณ์ไหน?</p>

    <button
      v-for="intent in intents"
      :key="intent.key"
      class="w-full flex items-center gap-4 text-left p-4 rounded-lg border hover:bg-slate-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150"
      @click="emit('intent-selected', intent.key)"
    >
      <div
        class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg"
        :class="intent.iconClass"
      >
        <component :is="intent.icon" class="h-6 w-6" />
      </div>
      <div>
        <p class="font-semibold text-gray-900">
          {{ intent.title }}
        </p>
        <p class="text-sm text-gray-500">
          {{ intent.description }}
        </p>
      </div>
    </button>
  </div>
</template>
