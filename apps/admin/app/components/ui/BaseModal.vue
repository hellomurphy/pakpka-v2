<script setup>
import { computed } from "vue";

const show = defineModel({ type: Boolean });

const props = defineProps({
  maxWidth: {
    type: String,
    default: "lg"
  },
  persistent: {
    type: Boolean,
    default: true
  }
});

const maxWidthClass = computed(() => {
  return {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl"
  }[props.maxWidth];
});
</script>

<template>
  <UModal
    :open="show"
    @update:open="(v) => { if (!persistent || !v) show = v; }"
    :dismissible="!persistent"
    :close="!persistent"
    :ui="{
      content: ['w-[calc(100vw-2rem)] max-h-[90vh]', maxWidthClass, 'rounded-lg shadow-lg ring ring-default flex flex-col overflow-hidden']
    }"
  >
    <template #content>
      <div
        v-if="$slots.title"
        class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 shrink-0"
      >
        <h3 class="text-base font-semibold leading-6 text-gray-900">
          <slot name="title" />
        </h3>
      </div>
      <div class="px-4 pb-4 sm:p-6 sm:pt-0 flex-1 min-h-0 overflow-y-auto">
        <slot />
      </div>
      <div
        v-if="$slots.footer"
        class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 shrink-0"
      >
        <slot name="footer" />
      </div>
    </template>
  </UModal>
</template>
