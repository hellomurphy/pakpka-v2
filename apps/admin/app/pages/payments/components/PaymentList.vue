<script setup>
import { useFormatters } from "~/composables/useFormatters";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import BaseButton from "~/components/ui/BaseButton.vue";

const props = defineProps({
  payments: { type: Array, required: true },
  selectedPaymentId: { type: String, default: null },
  isLoading: { type: Boolean, default: false },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
});
const emit = defineEmits(["select", "update:currentPage"]);

const { timeAgo, currency } = useFormatters();

const prevPage = () => emit("update:currentPage", props.currentPage - 1);
const nextPage = () => emit("update:currentPage", props.currentPage + 1);
</script>

<template>
  <aside
    class="w-full md:w-1/3 lg:w-1/4 flex flex-col flex-shrink-0 md:border-r border-slate-200 bg-white"
  >
    <div class="flex-1 overflow-y-auto">
      <div v-if="isLoading" class="p-2 md:p-4 space-y-2">
        <div
          v-for="n in 5"
          :key="n"
          class="h-16 rounded-lg bg-gray-200 animate-pulse"
        ></div>
      </div>
      <div
        v-else-if="payments.length === 0"
        class="p-4 md:p-6 text-center text-sm text-gray-500"
      >
        ไม่มีรายการที่ต้องตรวจสอบ
      </div>
      <nav v-else class="p-2 space-y-1">
        <a
          href="#"
          v-for="payment in payments"
          :key="payment.id"
          @click.prevent="emit('select', payment)"
          class="block p-2.5 md:p-3 rounded-lg transition-colors border-l-4"
          :class="[
            selectedPaymentId === payment.id
              ? 'bg-blue-50 border-blue-500'
              : 'border-transparent hover:bg-slate-50',
          ]"
        >
          <div class="flex justify-between items-baseline gap-2">
            <p class="font-semibold text-sm md:text-base text-gray-800 truncate">
              {{ payment.tenantName }}
              <span class="font-normal text-gray-500"
                >- {{ payment.roomNumber }}</span
              >
            </p>
            <p class="text-xs text-gray-400 flex-shrink-0">
              {{ timeAgo(payment.submittedAt) }}
            </p>
          </div>
          <p class="text-lg md:text-xl font-bold text-blue-600 mt-1">
            {{ currency(payment.amount, { decimalDigits: 2 }) }}
          </p>
        </a>
      </nav>
    </div>
    <div
      v-if="totalPages > 1"
      class="flex-shrink-0 border-t p-2 pb-16 md:pb-2 flex justify-between items-center"
    >
      <BaseButton
        @click="prevPage"
        :disabled="currentPage <= 1"
        size="sm"
        variant="secondary"
        ><ChevronLeftIcon class="h-4 w-4"
      /></BaseButton>
      <p class="text-xs text-gray-500">
        หน้า {{ currentPage }} / {{ totalPages }}
      </p>
      <BaseButton
        @click="nextPage"
        :disabled="currentPage >= totalPages"
        size="sm"
        variant="secondary"
        ><ChevronRightIcon class="h-4 w-4"
      /></BaseButton>
    </div>
  </aside>
</template>
