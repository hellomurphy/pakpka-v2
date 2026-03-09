<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  occupancy: {
    type: Object,
    required: true,
  },
})

const donutChartData = computed(() => ({
  labels: ['ไม่ว่าง', 'ว่าง', 'รอจัดการ'],
  datasets: [
    {
      backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b'], // Blue, Green, Amber
      data: [props.occupancy.occupied, props.occupancy.available, props.occupancy.other],
      borderWidth: 3,
      borderColor: '#ffffff', // สีพื้นหลังของการ์ด
    },
  ],
}))

const donutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  plugins: { legend: { display: false } },
}
</script>

<template>
  <div class="lg:col-span-1 flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-gray-900">ภาพรวมห้องพัก</h2>
      <NuxtLink to="/rooms" class="text-sm font-semibold text-blue-600 hover:text-blue-500"
        >จัดการ →</NuxtLink
      >
    </div>
    <div class="my-auto flex items-center justify-center py-4">
      <div class="relative h-48 w-48">
        <Doughnut :data="donutChartData" :options="donutChartOptions" />
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p class="text-3xl font-bold text-gray-900">
            {{ occupancy.total }}
          </p>
          <p class="text-sm text-gray-500">ห้องทั้งหมด</p>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-2 text-center">
      <div>
        <p class="font-semibold text-blue-600">
          {{ occupancy.occupied }}
        </p>
        <p class="text-gray-500">ไม่ว่าง</p>
      </div>
      <div>
        <p class="font-semibold text-green-600">
          {{ occupancy.available }}
        </p>
        <p class="text-gray-500">ว่าง</p>
      </div>
      <div>
        <p class="font-semibold text-amber-600">
          {{ occupancy.other }}
        </p>
        <p class="text-gray-500">รอจัดการ</p>
      </div>
    </div>
  </div>
</template>
