<script setup>
import { defineProps } from 'vue'
import {
  WrenchScrewdriverIcon,
  ArrowDownOnSquareIcon,
  KeyIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline'

defineProps({
  todos: {
    type: Array,
    required: true,
  },
})

const getIconForType = (type) => {
  switch (type) {
    case 'PAYMENT':
      return WrenchScrewdriverIcon
    case 'CHECK_IN':
      return ArrowDownOnSquareIcon
    case 'CHECK_OUT':
      return KeyIcon
    case 'CONTRACT_ENDING':
      return DocumentTextIcon
    default:
      return WrenchScrewdriverIcon
  }
}
</script>

<template>
  <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <h2 class="text-base font-semibold text-gray-900">สิ่งที่ต้องทำ (To-do List)</h2>

    <div v-if="todos.length === 0" class="mt-4 text-center py-8 text-gray-500">
      <p>ไม่มีรายการที่ต้องดำเนินการในขณะนี้</p>
    </div>

    <ul v-else role="list" class="mt-4 space-y-2">
      <li v-for="item in todos" :key="item.relatedId || item.text">
        <NuxtLink
          :to="item.to"
          class="flex items-center gap-x-3 rounded-lg p-3 -mx-3 hover:bg-slate-50"
        >
          <div
            :class="[
              item.urgent ? 'bg-amber-100' : 'bg-gray-100',
              'flex h-8 w-8 flex-none items-center justify-center rounded-lg',
            ]"
          >
            <component
              :is="getIconForType(item.type)"
              :class="[item.urgent ? 'text-amber-600' : 'text-gray-600', 'h-5 w-5']"
            />
          </div>
          <p class="flex-auto text-sm text-gray-800">{{ item.text }}</p>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
