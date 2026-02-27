<template>
  <div
    class="bg-white shadow-md rounded-xl overflow-hidden w-full transition-all hover:shadow-lg hover:-translate-y-1"
  >
    <div class="relative">
      <img
        :src="roomData.imageUrl"
        alt="Room Image"
        class="w-full h-40 object-cover"
      />

      <div
        class="absolute top-3 right-3 px-3 py-1 text-xs font-bold text-white rounded-full flex items-center gap-1.5"
        :class="statusInfo.bgColor"
      >
        <Icon :name="statusInfo.icon" />
        <span>{{ statusInfo.text }}</span>
      </div>
    </div>

    <div class="p-4 space-y-3">
      <div>
        <h3 class="text-sm text-indigo-600 font-semibold">
          {{ roomData.name }}
        </h3>
        <h2 class="text-xl font-bold text-slate-800">
          {{ roomData.roomNumber }}
        </h2>
      </div>

      <div class="text-sm space-y-1.5 text-slate-600">
        <div class="flex items-center gap-2">
          <Icon name="solar:calendar-date-linear" class="text-slate-400" />
          <span
            ><span class="font-medium text-slate-700">สัญญา:</span>
            {{ roomData.contract }}</span
          >
        </div>
        <div class="flex items-center gap-2">
          <Icon name="solar:money-bag-linear" class="text-slate-400" />
          <span
            ><span class="font-medium text-slate-700">ค่าเช่า:</span>
            {{ formatNumber(roomData.rent) }} บาท / เดือน</span
          >
        </div>
      </div>

      <div class="pt-2">
        <NuxtLink
          :to="`/room/${roomData.id}`"
          class="w-full text-center font-bold py-2.5 px-4 rounded-lg transition-all"
          :class="
            roomData.status === 'overdue'
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          "
        >
          {{
            roomData.status === "overdue" ? "ชำระเงินด่วน!" : "ดูรายละเอียดห้อง"
          }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  roomData: {
    type: Object,
    required: true,
  },
});

const { formatNumber } = useNumberFormat();

const statusInfo = computed(() => {
  switch (props.roomData.status) {
    case "paid":
      return {
        text: "ชำระแล้ว",
        icon: "solar:check-circle-bold",
        bgColor: "bg-green-500",
      };
    case "overdue":
      return {
        text: "ค้างชำระ",
        icon: "solar:danger-triangle-bold",
        bgColor: "bg-red-500",
      };
    case "pending":
      return {
        text: "รอตรวจสอบ",
        icon: "solar:clock-circle-bold",
        bgColor: "bg-yellow-500",
      };
    default:
      return {
        text: "ไม่ทราบสถานะ",
        icon: "solar:question-circle-bold",
        bgColor: "bg-slate-400",
      };
  }
});
</script>
