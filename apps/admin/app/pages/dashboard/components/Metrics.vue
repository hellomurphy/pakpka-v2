<script setup>
import { computed } from 'vue'
import { useFormatters } from '~/composables/useFormatters'
import {
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  HomeModernIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  metrics: {
    type: Object,
    required: true,
  },
})

const { currency } = useFormatters()

// ✨ สร้าง Array สำหรับวนลูปสร้างการ์ด ทำให้ Template สะอาด
const metricCards = computed(() => [
  {
    label: 'รายรับเดือนนี้',
    value: currency(props.metrics.monthlyIncome),
    icon: CurrencyDollarIcon,
    color: 'green',
  },
  {
    label: 'ยอดค้างชำระ',
    value: currency(props.metrics.overdueBalance),
    icon: ExclamationTriangleIcon,
    color: 'amber',
  },
  {
    label: 'ห้องว่าง',
    value: `${props.metrics.availableRooms} ห้อง`,
    icon: HomeModernIcon,
    color: 'neutral',
  },
  // {
  //   label: "รายการแจ้งซ่อม",
  //   value: `${props.metrics.maintenanceRequests} รายการ`,
  //   icon: WrenchScrewdriverIcon,
  //   color: "neutral",
  // },
])

const getColorClasses = (color) => {
  switch (color) {
    case 'green':
      return {
        text: 'text-green-600',
        bg: 'bg-green-100',
        ring: 'ring-gray-900/5',
        hover: 'hover:ring-green-300 hover:shadow-md',
      }
    case 'amber':
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-100',
        ring: 'ring-amber-500/50',
        hover: 'hover:ring-amber-300 hover:shadow-md',
      }
    default:
      return {
        text: 'text-slate-700',
        bg: 'bg-blue-50',
        ring: 'ring-blue-900/5',
        hover: 'hover:ring-blue-300 hover:shadow-md',
      }
  }
}

// เก็บสถานะการ hover ของการ์ดแต่ละใบ
const hoverStates = ref(metricCards.value.map(() => false))

const setHoverState = (index, isHovering) => {
  hoverStates.value[index] = isHovering
}
</script>

<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="(card, index) in metricCards"
      :key="card.label"
      class="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 transition-all duration-300 ease-out"
      :class="[
        getColorClasses(card.color).ring,
        getColorClasses(card.color).hover,
        hoverStates[index] ? 'animate-bounce-scale shadow-lg -translate-y-1.5' : '',
      ]"
      @mouseenter="setHoverState(index, true)"
      @mouseleave="setHoverState(index, false)"
    >
      <div class="flex items-center gap-x-3">
        <div
          class="flex-none rounded-lg p-2 transition-all duration-300"
          :class="[getColorClasses(card.color).bg, hoverStates[index] ? 'scale-110' : '']"
        >
          <component
            :is="card.icon"
            class="h-6 w-6 transition-all duration-300"
            :class="[getColorClasses(card.color).text, hoverStates[index] ? 'animate-pulse' : '']"
          />
        </div>
        <p
          class="text-sm font-medium transition-all duration-300"
          :class="[getColorClasses(card.color).text, hoverStates[index] ? 'font-bold' : '']"
        >
          {{ card.label }}
        </p>
      </div>
      <p
        class="mt-3 text-3xl font-semibold tracking-tight text-gray-900 transition-all duration-300"
        :class="hoverStates[index] ? 'scale-105' : ''"
      >
        {{ card.value }}
      </p>
    </div>
  </div>
</template>

<style>
@keyframes bounce-scale {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  25% {
    transform: translateY(-6px) scale(1.02);
  }
  50% {
    transform: translateY(-3px) scale(1.03);
  }
  75% {
    transform: translateY(-1px) scale(1.02);
  }
}

.animate-bounce-scale {
  animation: bounce-scale 0.5s ease-in-out;
}
</style>
