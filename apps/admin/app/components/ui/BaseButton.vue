<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // 'primary', 'secondary', 'danger'
  },
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
  },
  icon: {
    type: Function, // รับ Component ของ Icon เข้ามา
    default: null,
  },
  iconPosition: {
    type: String,
    default: 'left', // 'left', 'right'
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// Computed property สำหรับสร้าง class ของปุ่มแบบ Dynamic
const buttonClasses = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-x-2 rounded-lg font-semibold shadow-sm transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  // Variant Styles
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600',
    secondary: 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
  }

  // Size Styles
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  return [base, variants[props.variant], sizes[props.size]]
})
</script>

<template>
  <button :class="buttonClasses" :disabled="loading">
    <template v-if="loading">
      <svg
        class="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </template>
    <template v-else>
      <component :is="icon" v-if="icon && iconPosition === 'left'" class="h-5 w-5" />
      <slot />
      <component :is="icon" v-if="icon && iconPosition === 'right'" class="h-5 w-5" />
    </template>
  </button>
</template>
