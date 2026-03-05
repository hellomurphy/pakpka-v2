<script setup>
import { computed } from 'vue'
import { useFormatters } from '~/composables/useFormatters'

// ✨ 1. Import ไอคอนที่จำเป็นทั้งหมด
import {
  UserCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CalendarDaysIcon,
} from '@heroicons/vue/24/solid'

const props = defineProps({
  room: { type: Object, required: true },
})

const { currency, shortDate } = useFormatters()

// ✨ 3. ปรับปรุง statusInfo ให้ฉลาดขึ้น
const statusInfo = computed(() => {
  // ✨ ตรวจสอบสถานะ "แจ้งย้ายออก" ก่อนเป็นอันดับแรก
  if (props.room.status === 'OCCUPIED' && props.room.tenant?.status === 'NOTICE_GIVEN') {
    return {
      bgClass: 'bg-amber-500',
      icon: CalendarDaysIcon,
      textColor: 'text-amber-700',
      label: 'แจ้งย้ายออก',
    }
  }

  // Logic เดิมสำหรับสถานะอื่นๆ
  switch (props.room.status) {
    case 'OCCUPIED':
      return {
        bgClass: 'bg-blue-500',
        icon: UserCircleIcon,
        textColor: 'text-blue-700',
        label: 'ไม่ว่าง',
      }
    case 'AVAILABLE':
      return {
        bgClass: 'bg-green-500',
        icon: CheckCircleIcon,
        textColor: 'text-green-700',
        label: 'ว่าง',
      }
    case 'CLEANING':
      return {
        bgClass: 'bg-yellow-400',
        icon: SparklesIcon,
        textColor: 'text-yellow-700',
        label: 'รอทำความสะอาด',
      }
    case 'MAINTENANCE':
      return {
        bgClass: 'bg-orange-500',
        icon: WrenchScrewdriverIcon,
        textColor: 'text-orange-700',
        label: 'แจ้งซ่อม',
      }
    case 'RESERVED':
      return {
        bgClass: 'bg-sky-500',
        icon: ClockIcon,
        textColor: 'text-sky-700',
        label: 'จองแล้ว',
      }
    default:
      return {
        bgClass: 'bg-gray-400',
        icon: UserCircleIcon,
        textColor: 'text-gray-700',
        label: 'ไม่ระบุ',
      }
  }
})
</script>

<template>
  <NuxtLink
    as="div"
    class="group relative h-40 rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 overflow-hidden"
    :to="`/rooms/${room.id}`"
  >
    <div class="h-1/2 rounded-t-xl p-4 transition-colors duration-300" :class="statusInfo.bgClass">
      <p class="text-3xl font-bold text-white tracking-wider">
        {{ room.roomNumber }}
      </p>
    </div>

    <div class="h-1/2 p-4 flex flex-col justify-end">
      <p class="text-xs text-gray-500 -mt-2">{{ room.roomType.name }}</p>
      <div class="flex items-center justify-between mt-auto">
        <div class="flex items-center gap-x-2">
          <component :is="statusInfo.icon" class="h-5 w-5" :class="statusInfo.textColor" />
          <p class="text-sm font-semibold" :class="statusInfo.textColor">
            {{ statusInfo.label }}
          </p>
        </div>
        <div class="text-right">
          <div v-if="room.status === 'OCCUPIED' && room.tenant?.status === 'NOTICE_GIVEN'">
            <p class="text-sm font-semibold text-amber-700 truncate" :title="room.tenant.name">
              {{ room.tenant.name }}
            </p>
            <p class="text-xs text-gray-500">
              จะย้ายออก: {{ shortDate(room.activeContract?.endDate) }}
            </p>
          </div>
          <p
            v-else-if="room.status === 'OCCUPIED' && room.tenant"
            class="text-sm font-semibold text-gray-800 truncate"
            :title="room.tenant.name"
          >
            {{ room.tenant.name }}
          </p>
          <p v-if="room.status === 'AVAILABLE'" class="text-lg font-semibold text-green-600">
            {{ currency(room.roomType.basePrice) }}
          </p>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
