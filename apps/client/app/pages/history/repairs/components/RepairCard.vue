<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-slate-200 transition-all duration-300"
    :class="
      isExpanded
        ? 'shadow-lg border-indigo-200 ring-1 ring-indigo-200'
        : 'hover:shadow-md hover:border-slate-300'
    "
  >
    <button
      @click="isExpanded = !isExpanded"
      class="w-full flex items-center justify-between p-4 text-left"
      aria-label="ดูรายละเอียดเพิ่มเติม"
    >
      <div class="flex-grow pr-4">
        <p class="font-bold text-slate-800">{{ ticket.title }}</p>
        <p class="text-xs text-slate-500">
          เรื่อง #{{ ticket.id }} • ห้อง {{ ticket.roomNumber }}
        </p>
      </div>
      <div class="flex items-center gap-3 flex-shrink-0">
        <div
          class="text-xs font-bold px-2 py-1 rounded-full"
          :class="currentStatus.colorClass"
        >
          {{ currentStatus.text }}
        </div>
        <Icon 
          name="solar:alt-arrow-down-linear" 
          class="text-slate-400 text-xl transition-transform duration-300 ease-in-out"
          :class="{ '-rotate-180': isExpanded }"
        />
      </div>
    </button>

    <div
      class="transition-all duration-300 ease-in-out grid"
      :class="
        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      "
    >
      <div class="overflow-hidden">
        <div class="border-t border-slate-200 px-4 pt-4">
          <ul>
            <li
              v-for="(status, index) in ticket.timeline"
              :key="index"
              class="flex gap-3"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-4 h-4 rounded-full flex items-center justify-center ring-4"
                  :class="
                    index === ticket.timeline.length - 1
                      ? currentStatus.ringColorClass
                      : 'bg-slate-300 ring-slate-100'
                  "
                >
                  <Icon
                    v-if="index === ticket.timeline.length - 1"
                    :name="currentStatus.icon"
                    class="text-white text-xs"
                  />
                </div>
                <div
                  v-if="index < ticket.timeline.length - 1"
                  class="w-0.5 h-full bg-slate-200"
                ></div>
              </div>

              <div class="pb-4">
                <p
                  class="font-semibold text-sm"
                  :class="
                    index === ticket.timeline.length - 1
                      ? currentStatus.textColorClass
                      : 'text-slate-600'
                  "
                >
                  {{ status.name }}
                </p>
                <p
                  v-if="status.status === 'cancelled' && status.reason"
                  class="text-xs text-red-600 pl-1 border-l-2 border-red-200 mt-1"
                >
                  เหตุผล: {{ status.reason }}
                </p>
                <p class="text-xs text-slate-400 mt-0.5">
                  {{ status.timestamp }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// --- State for expand/collapse ---
const isExpanded = ref(false);

const props = defineProps<{ ticket: any }>();

const statusMap = {
  submitted: {
    text: "แจ้งเรื่องแล้ว",
    icon: "ph:paper-plane-tilt-fill",
    colorClass: "bg-slate-100 text-slate-600",
    ringColorClass: "bg-slate-400 ring-slate-100",
    textColorClass: "text-slate-700",
  },
  acknowledged: {
    text: "รับเรื่องแล้ว",
    icon: "ph:eye-fill",
    colorClass: "bg-blue-100 text-blue-600",
    ringColorClass: "bg-blue-500 ring-blue-100",
    textColorClass: "text-blue-700",
  },
  in_progress: {
    text: "กำลังดำเนินการ",
    icon: "ph:wrench-fill",
    colorClass: "bg-amber-100 text-amber-600",
    ringColorClass: "bg-amber-500 ring-amber-100",
    textColorClass: "text-amber-700",
  },
  completed: {
    text: "เสร็จสิ้น",
    icon: "ph:check-circle-fill",
    colorClass: "bg-green-100 text-green-600",
    ringColorClass: "bg-green-500 ring-green-100",
    textColorClass: "text-green-700",
  },
  cancelled: {
    text: "ยกเลิก",
    icon: "ph:x-circle-fill",
    colorClass: "bg-red-100 text-red-600",
    ringColorClass: "bg-red-500 ring-red-100",
    textColorClass: "text-red-700",
  },
};

const currentStatus = computed(() => {
  const lastStatus = props.ticket.timeline[props.ticket.timeline.length - 1];
  return statusMap[lastStatus.status] || statusMap.submitted;
});
</script>

<style scoped>
/* ใช้ grid และ grid-rows-[] เพื่อสร้าง Animation การสไลด์ที่นุ่มนวลด้วย CSS */
.grid-rows-\[0fr\] {
  grid-template-rows: 0fr;
}
.grid-rows-\[1fr\] {
  grid-template-rows: 1fr;
}
</style>
