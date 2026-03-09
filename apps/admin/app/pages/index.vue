<script setup>
import { watch } from 'vue'
import { useAppAuth } from '~/composables/useAppAuth'

definePageMeta({
  layout: 'blank',
  auth: false,
})

const { status } = useAppAuth()

watch(
  status,
  (newStatus) => {
    if (newStatus === 'loading') return

    if (newStatus === 'authenticated') {
      navigateTo('/dashboard', { replace: true })
    } else {
      navigateTo('/login', { replace: true })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-slate-50">
    <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600">
      <UIcon name="i-lucide-home" class="w-8 h-8 text-white animate-pulse" />
    </div>
    <h1 class="mt-4 text-xl font-bold text-gray-700">PakPak</h1>
    <p class="mt-2 text-gray-500">กำลังตรวจสอบสถานะ...</p>
  </div>
</template>
