<template>
  <div>
    <NuxtLoadingIndicator color="#4f46e5" :height="3" />
    <template v-if="isAppLoading">
      <UiSplashScreen />
    </template>

    <template v-else>
      <NuxtLayout>
        <NuxtPage class="bg-slate-50" />
      </NuxtLayout>
    </template>
    <Toaster
      rich-colors
      position="top-right"
      :duration="3000"
      :toast-options="{
        style: { borderRadius: '8px' },
        classNames: { toast: 'shadow-lg' },
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Toaster } from 'vue-sonner'
import UiSplashScreen from '~/components/ui/UiSplashScreen.vue'

const isAppLoading = ref(true)

onMounted(() => {
  // ปิด splash หลัง 1.2s (รันบน client อย่างเดียว)
  setTimeout(() => {
    isAppLoading.value = false
  }, 1200)
  // fallback: ปิดไม่เกิน 3s แม้มีอะไรค้าง
  setTimeout(() => {
    isAppLoading.value = false
  }, 3000)
})
</script>
