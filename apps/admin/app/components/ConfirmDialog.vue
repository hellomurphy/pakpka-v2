<script setup>
import BaseModal from '~/components/ui/BaseModal.vue'
import { useConfirm } from '~/composables/useConfirm'

const { state, confirm, cancel } = useConfirm()

const iconName = computed(() => {
  if (state.intent === 'danger' || state.intent === 'warning') return 'i-lucide-alert-triangle'
  if (state.intent === 'success') return 'i-lucide-circle-check'
  return 'i-lucide-info'
})

const intentColors = {
  danger: 'red',
  warning: 'amber',
  success: 'green',
  info: 'blue',
}

const iconColorClass = computed(() => {
  const color = intentColors[state.intent] || 'blue'
  const colorMap = {
    red: 'text-red-500',
    amber: 'text-amber-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
  }
  return colorMap[color] || 'text-blue-500'
})

const confirmButtonClass = computed(() => {
  const color = intentColors[state.intent] || 'blue'

  const baseClasses = `
    inline-flex w-full justify-center rounded-full px-6 py-3
    text-sm font-medium text-white shadow-lg transition-all duration-200 sm:w-auto
  `

  const colorClasses = {
    red: `
      bg-gradient-to-r from-red-500 to-red-600
      hover:from-red-600 hover:to-red-700
    `,
    amber: `
      bg-gradient-to-r from-amber-500 to-amber-600
      hover:from-amber-600 hover:to-amber-700
    `,
    green: `
      bg-gradient-to-r from-green-500 to-green-600
      hover:from-green-600 hover:to-green-700
    `,
    blue: `
      bg-gradient-to-r from-blue-500 to-blue-600
      hover:from-blue-600 hover:to-blue-700
    `,
  }

  return baseClasses + ' ' + (colorClasses[color] || colorClasses.blue)
})
</script>

<template>
  <BaseModal v-model="state.show" max-width="md">
    <div class="px-6 py-8 flex flex-col items-center text-center">
      <!-- Icon -->
      <div
        :class="[
          `bg-${intentColors[state.intent] || 'blue'}-500/15`,
          'flex items-center justify-center rounded-full h-16 w-16 shadow-inner',
        ]"
      >
        <UIcon :name="iconName" :class="[iconColorClass, 'h-8 w-8']" aria-hidden="true" />
      </div>

      <!-- Title -->
      <h3 class="mt-6 text-xl font-semibold text-gray-900 tracking-tight">
        {{ state.title }}
      </h3>

      <!-- Message -->
      <p class="mt-3 text-sm text-gray-600 leading-relaxed max-w-xs">
        {{ state.message }}
      </p>

      <!-- Footer Buttons -->
      <div class="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:justify-center">
        <button
          type="button"
          class="inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-100 transition-all duration-200 sm:w-auto"
          @click="cancel"
        >
          {{ state.cancelText }}
        </button>
        <button type="button" :class="confirmButtonClass" @click="confirm">
          {{ state.confirmText }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>
