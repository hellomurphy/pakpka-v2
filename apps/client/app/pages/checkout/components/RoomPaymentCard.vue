<template>
  <div
    class="bg-white rounded-2xl shadow-sm transition-all duration-300 border-2 overflow-hidden"
    :class="
      isSelected
        ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
        : 'border-transparent'
    "
  >
    <div class="bg-stone-50">
      <div class="p-5 flex justify-between items-start gap-3">
        <div class="flex-grow">
          <h2 class="font-bold text-slate-800 text-lg">{{ dorm.name }}</h2>
          <p class="font-semibold text-slate-600">ห้อง {{ dorm.room }}</p>
          <p class="text-xs text-slate-500 mt-1">
            รอบบิล: {{ dorm.billingCycle }}
          </p>
        </div>

        <div class="flex-shrink-0 pt-1">
          <input
            :id="`card-${dorm.id}`"
            type="checkbox"
            :checked="isSelected"
            @change="$emit('select', dorm.id)"
            class="w-6 h-6 rounded-md text-indigo-600 border-gray-300 shadow-sm cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          />
        </div>
      </div>
      <div class="p-5 mt-4 pt-4 border-t border-slate-100">
        <ul class="text-sm space-y-2.5">
          <li
            v-for="item in dorm.lineItems"
            :key="item.id"
            class="flex justify-between items-start"
          >
            <span class="flex items-center gap-2.5 text-slate-600">
              <Icon :name="item.icon" class="text-lg" :class="item.iconColor" />
              <div>
                <span>{{ item.label }}</span>
                <p v-if="item.details" class="text-xs text-slate-400">
                  {{ item.details }}
                </p>
              </div>
            </span>
            <span class="font-mono font-semibold text-slate-800"
              >{{ formatNumber(item.amount) }} บาท</span
            >
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t-2 border-dashed border-slate-300 bg-slate-50/50">
      <div class="p-4 flex justify-between items-end">
        <div class="text-left">
          <div
            class="text-xs font-bold uppercase tracking-wider px-3 py-1.5 border-2 rounded w-fit"
            :class="statusInfo.style"
          >
            <span>{{ statusInfo.text }}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            ครบกำหนด: {{ dorm.dueDate }}
          </p>
        </div>

        <div class="text-right">
          <p class="text-sm font-medium text-slate-500">ยอดรวมสุทธิ</p>
          <p class="text-2xl font-bold font-mono text-indigo-700">
            {{ formatNumber(dorm.totalPrice) }} บาท
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  dorm: any;
  isSelected: boolean;
}>();

defineEmits(["select"]);

const { formatNumber } = useNumberFormat();

const statusInfo = computed(() => {
  switch (props.dorm.status) {
    case "overdue":
      return {
        text: "เกินกำหนด",
        style: "bg-red-50 text-red-700 border-red-300",
      };
    case "pending":
    default:
      return {
        text: "รอชำระ",
        style: "bg-slate-100 text-slate-600 border-slate-300",
      };
  }
});
</script>
