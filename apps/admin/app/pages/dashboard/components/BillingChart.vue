<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  billing: {
    type: Object,
    required: true,
  },
})

const barChartData = computed(() => ({
  labels: ['การชำระบิล'],
  datasets: [
    {
      label: 'ชำระแล้ว',
      backgroundColor: '#3b82f6',
      data: [props.billing.paid],
      barThickness: 24,
      borderRadius: 6,
    },
    {
      label: 'ค้างชำระ',
      backgroundColor: '#e5e7eb',
      data: [props.billing.unpaid],
      barThickness: 24,
      borderRadius: 6,
    },
  ],
}))
const barChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true, display: false },
    y: { stacked: true, display: false },
  },
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
}
</script>

<template>
  <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-gray-900">สรุปการชำระบิล (รอบบิลนี้)</h2>
      <NuxtLink to="/billing" class="text-sm font-semibold text-blue-600 hover:text-blue-500"
        >จัดการ →</NuxtLink
      >
    </div>
    <div class="mt-4">
      <div class="mb-1 flex justify-between text-sm">
        <p class="font-medium text-gray-800">
          ชำระแล้ว:
          <span class="font-bold">{{ billing.paid }}/{{ billing.paid + billing.unpaid }}</span>
          บิล
        </p>
      </div>
      <div class="h-6 w-full">
        <Bar :data="barChartData" :options="barChartOptions" />
      </div>
    </div>
  </div>
</template>
