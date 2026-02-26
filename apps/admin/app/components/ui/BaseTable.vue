<script setup>
import { computed, ref } from "vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import BaseButton from "~/components/ui/BaseButton.vue";

// ✨ 1. ใช้ defineModel เพื่อให้ v-model:currentPage ทำงาน
const currentPage = defineModel("currentPage", { type: Number, default: 1 });
const selectedIndex = ref(null);

const props = defineProps({
  columns: { type: Array, required: true },
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  totalItems: { type: Number, default: 0 },
  itemsPerPage: { type: Number, default: 10 },
  height: { type: Number, default: 600 },
});

// --- Computed & Methods ---
const totalPages = computed(() => {
  if (props.itemsPerPage === 0) return 1;
  return Math.ceil(props.totalItems / props.itemsPerPage);
});

// ✨ 2. ย้าย Logic การคำนวณ start/end item มาไว้ที่นี่ เพราะเป็นเรื่องของการแสดงผล
const startItem = computed(() =>
  props.totalItems === 0 ? 0 : (currentPage.value - 1) * props.itemsPerPage + 1
);
const endItem = computed(() =>
  Math.min(currentPage.value * props.itemsPerPage, props.totalItems)
);

// ✨ 3. Methods จะอัปเดต v-model โดยตรง
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
</script>

<template>
  <div
    class="flex flex-col bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden"
    :style="{ height: `${height}px` }"
  >
    <div class="flex-1 overflow-y-auto">
      <table class="min-w-full table-auto">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="sticky top-0 z-10 border-b border-gray-200 bg-slate-50/80 backdrop-blur-sm px-6 py-3.5 text-left text-xs font-bold text-slate-600"
              :class="column.headerClass"
            >
              <slot :name="`header-${column.key}`" :column="column">
                {{ column.label }}
              </slot>
            </th>
          </tr>
        </thead>

        <tbody class="bg-white">
          <template v-if="loading">
            <tr v-for="n in 5" :key="`skel-${n}`" class="animate-pulse">
              <td :colspan="columns.length" class="py-1 px-6">
                <div class="h-6 bg-gray-200 rounded-md"></div>
              </td>
            </tr>
          </template>

          <template v-else-if="items.length === 0">
            <tr>
              <td :colspan="columns.length" class="py-16">
                <div class="text-center">
                  <slot name="empty-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="mx-auto h-12 w-12 text-gray-400"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </slot>

                  <h3 class="mt-2 text-sm font-semibold text-gray-900">
                    <slot name="empty-title">ไม่พบข้อมูล</slot>
                  </h3>

                  <p class="mt-1 text-sm text-gray-500">
                    <slot name="empty-description"
                      >ลองปรับเงื่อนไขการค้นหา หรือเพิ่มข้อมูลใหม่</slot
                    >
                  </p>

                  <div class="mt-6">
                    <slot name="empty-action"></slot>
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <template v-else>
            <tr
              v-for="(item, index) in items"
              :key="item.id"
              class="group transition-colors duration-150 even:bg-slate-50/50 hover:bg-blue-50/40"
              @click="selectedIndex = index"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                class="whitespace-nowrap px-6 py-2.5 text-sm relative"
                :class="[
                  column.cellClass,
                  selectedIndex === index ? 'bg-blue-50/50' : '',
                ]"
              >
                <div
                  v-if="selectedIndex === index"
                  class="absolute inset-y-0 left-0 w-1 bg-blue-500"
                ></div>
                <slot
                  :name="`cell-${column.key}`"
                  :item="item"
                  :value="item[column.key]"
                >
                  <span class="text-gray-700">{{ item[column.key] }}</span>
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div class="flex-shrink-0 border-t border-gray-100 px-4 py-2 sm:px-6">
      <nav class="flex items-center justify-between">
        <div class="hidden sm:block">
          <p class="text-sm text-gray-600">
            แสดง
            <span class="font-semibold text-gray-800">{{ startItem }}</span>
            -
            <span class="font-semibold text-gray-800">{{ endItem }}</span>
            จาก
            <span class="font-semibold text-gray-800">{{ totalItems }}</span>
          </p>
        </div>
        <div class="flex items-center justify-between sm:justify-end gap-x-2">
          <BaseButton
            @click="prevPage"
            :disabled="currentPage === 1"
            variant="secondary"
            size="sm"
          >
            <ChevronLeftIcon class="h-5 w-5" />
            ก่อนหน้า
          </BaseButton>
          <BaseButton
            @click="nextPage"
            :disabled="currentPage >= totalPages"
            variant="secondary"
            size="sm"
            icon-position="right"
          >
            ถัดไป
            <ChevronRightIcon class="h-5 w-5" />
          </BaseButton>
        </div>
      </nav>
    </div>
  </div>
</template>
