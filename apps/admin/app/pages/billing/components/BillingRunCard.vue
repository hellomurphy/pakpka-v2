<script setup>
import { computed } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { useFormatters } from "~/composables/useFormatters";

dayjs.locale("th");
dayjs.extend(buddhistEra);

const props = defineProps({
  run: {
    type: Object,
    required: true,
  },
});

const { currency } = useFormatters();

const statusInfo = computed(() => {
  const map = {
    COMPLETED: {
      label: "เสร็จสิ้น",
      pillClass: "bg-green-100 text-green-700 ring-green-600/20",
      progressClass: "bg-green-500",
    },
    PENDING_METER_READING: {
      label: "รอจดมิเตอร์",
      pillClass: "bg-blue-100 text-blue-700 ring-blue-600/20",
      progressClass: "bg-blue-500",
    },
    PENDING_REVIEW: {
      label: "รอตรวจสอบ",
      pillClass: "bg-sky-100 text-sky-700 ring-sky-600/20",
      progressClass: "bg-sky-500",
    },
    SENDING: {
      label: "กำลังส่ง",
      pillClass: "bg-purple-100 text-purple-700 ring-purple-600/20",
      progressClass: "bg-purple-500",
    },
    FAILED: {
      label: "ล้มเหลว",
      pillClass: "bg-red-100 text-red-700 ring-red-600/20",
      progressClass: "bg-red-500",
    },
  };
  return (
    map[props.run.status] || {
      label: "ไม่ระบุ",
      pillClass: "bg-gray-100 text-gray-800",
      progressClass: "bg-gray-500",
    }
  );
});

// ✨ Dynamic progress: Show different progress based on billing run status
// - PENDING_METER_READING: Show meter reading progress
// - Other statuses: Show payment progress
const progressPercentage = computed(() => {
  const { status, paidCount, totalInvoices, meterReadingRequired, meterReadingCompletedCount } = props.run;

  if (status === 'PENDING_METER_READING') {
    // Show meter reading progress
    if (!meterReadingRequired || meterReadingRequired === 0) {
      return 100;
    }
    return ((meterReadingCompletedCount || 0) / meterReadingRequired) * 100;
  } else {
    // Show payment progress
    if (!totalInvoices || totalInvoices === 0) {
      return 100;
    }
    return (paidCount / totalInvoices) * 100;
  }
});

const progressText = computed(() => {
  const { status, paidCount, totalInvoices, meterReadingRequired, meterReadingCompletedCount } = props.run;

  if (status === 'PENDING_METER_READING') {
    // Show meter reading progress text
    return `จดแล้ว: ${meterReadingCompletedCount || 0} / ${meterReadingRequired || 0} ห้อง`;
  } else {
    // Show payment progress text
    return `จ่ายแล้ว: ${paidCount || 0} / ${totalInvoices || 0} ห้อง`;
  }
});
</script>

<template>
  <NuxtLink
    :to="`/billing/run/${run.id}`"
    class="block bg-white rounded-xl shadow-sm ring-1 ring-slate-900/5 hover:shadow-md hover:ring-blue-500/50 transition-all duration-200"
  >
    <div class="p-5">
      <div class="flex justify-between items-start">
        <h3 class="text-lg font-bold text-slate-900">
          {{ dayjs(run.period).format("MMMM BBBB") }}
        </h3>
        <span
          :class="[
            statusInfo.pillClass,
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset',
          ]"
        >
          {{ statusInfo.label }}
        </span>
      </div>

      <div class="mt-4">
        <div
          class="flex justify-between text-sm font-medium text-slate-500 mb-1"
        >
          <span>ความคืบหน้า</span>
          <span>{{ Math.round(progressPercentage) }}%</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-2">
          <div
            :class="statusInfo.progressClass"
            class="h-2 rounded-full transition-all duration-500"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <p class="text-xs text-slate-500 mt-1">{{ progressText }}</p>
      </div>

      <div
        class="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm"
      >
        <div>
          <p class="text-slate-500">ยอดค้างชำระ</p>
          <p class="font-semibold text-amber-600">
            {{ currency(run.totalUnpaidAmount) }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-slate-500">ยอดชำระแล้ว</p>
          <p class="font-semibold text-green-600">
            {{ currency(run.totalPaidAmount) }}
          </p>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
