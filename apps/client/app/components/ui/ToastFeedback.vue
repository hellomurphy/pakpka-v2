<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-y-10"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-10"
    >
      <div v-if="toast.show" class="fixed bottom-5 right-5 z-50">
        <div
          class="flex items-center gap-3 text-white font-semibold text-sm px-4 py-3 rounded-lg shadow-xl"
          :class="toastStyle.bg"
        >
          <Icon
            :name="toastStyle.icon"
            class="text-xl"
            :class="{ 'animate-spin': toast.type === 'loading' }"
          />
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  toast: {
    show: boolean
    message: string
    type: 'success' | 'error' | 'loading'
  }
}>()

const toastStyle = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return { bg: 'bg-green-500', icon: 'ph:check-circle-fill' }
    case 'error':
      return { bg: 'bg-red-500', icon: 'ph:x-circle-fill' }
    case 'loading':
    default:
      return { bg: 'bg-slate-700', icon: 'ph:spinner-duotone' }
  }
})
</script>
