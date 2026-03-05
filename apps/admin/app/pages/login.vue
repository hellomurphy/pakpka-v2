<script setup lang="ts">
import { ref } from 'vue'
import { HomeModernIcon } from '@heroicons/vue/24/solid'
import { useAppAuth } from '~/composables/useAppAuth'

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
  layout: 'blank',
})

const { signIn, fetchSession } = useAppAuth()
const isDev = import.meta.dev
const isLoadingLine = ref(false)
const isLoadingDev = ref(false)
const devError = ref<string | null>(null)

async function handleDevLogin() {
  if (!isDev) return
  isLoadingDev.value = true
  devError.value = null
  try {
    await $fetch<{
      ok: boolean
      user?: { id: string; name?: string; email?: string; image?: string }
    }>('/api/auth/dev-login')
    await fetchSession()
    await navigateTo('/')
  } catch (e: unknown) {
    const msg =
      e &&
      typeof e === 'object' &&
      'data' in e &&
      e.data &&
      typeof (e.data as { statusMessage?: string }).statusMessage === 'string'
        ? (e.data as { statusMessage: string }).statusMessage
        : 'Dev login failed'
    devError.value = msg
  } finally {
    isLoadingDev.value = false
  }
}

async function handleLineLogin() {
  isLoadingLine.value = true
  await signIn('line')
  isLoadingLine.value = false
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">
    <div class="w-full max-w-sm">
      <div class="flex flex-col items-center text-center">
        <div
          class="flex w-14 h-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30"
        >
          <HomeModernIcon class="w-8 h-8 text-white" />
        </div>
        <h1 class="mt-4 text-2xl font-bold text-gray-800 tracking-tight">ยินดีต้อนรับสู่ PakPak</h1>
        <p class="mt-2 text-sm text-gray-500">ระบบจัดการหอพักสำหรับคุณ</p>
      </div>

      <div class="mt-10 space-y-3">
        <!-- Dev: เรียก API ได้ response แล้ว refetch session แล้วนำทางไปหน้าหลัก (จำลอง flow แบบ credentials, ใช้แค่ local) -->
        <template v-if="isDev">
          <button
            type="button"
            :disabled="isLoadingDev"
            class="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:opacity-70 disabled:cursor-not-allowed"
            @click="handleDevLogin"
          >
            Login (Dev)
          </button>
          <p v-if="devError" class="text-sm text-red-600">
            {{ devError }}
          </p>
        </template>

        <!-- LINE: เทส connection กับ LINE โดยตรง -->
        <button
          type="button"
          :disabled="isLoadingLine"
          class="flex w-full items-center justify-center gap-3 rounded-lg bg-[#06C755] px-4 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#05b34d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06C755] disabled:opacity-70 disabled:cursor-not-allowed"
          @click="handleLineLogin"
        >
          <svg class="h-6 w-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M38.8256 0.00195312H9.22754C4.13086 0.00195312 0 4.13281 0 9.22949V38.8271C0 43.9238 4.13086 48.0547 9.22754 48.0547H38.8256C43.9223 48.0547 48.0532 43.9238 48.0532 38.8271V9.22949C48.0532 4.13281 43.9223 0.00195312 38.8256 0.00195312Z"
              fill="white"
            />
            <path
              d="M32.3364 22.2536C32.3364 25.0719 31.5473 27.6813 30.1225 29.8327C30.9575 30.29 31.6254 30.8874 32.0395 31.6256L32.1498 31.8102L32.0395 31.9567C31.5473 32.6486 31.0256 33.2917 30.4072 33.8248C30.2182 34.0094 30.0195 34.1842 29.8207 34.3491L30.103 34.9001V34.91C30.938 36.4362 31.2587 38.1696 31.2587 39.9586H26.3754C26.3754 38.5417 26.0742 37.1524 25.4941 35.8815H17.7719C15.0092 35.8815 12.7592 33.6217 12.7592 30.859V22.4206C12.7592 19.6579 15.0092 17.4079 17.7719 17.4079H18.7856C19.0679 15.826 20.3295 14.5641 21.9116 14.5641C23.1166 14.5641 24.1684 15.2658 24.6901 16.2985H29.1723C29.6225 15.256 30.6552 14.5641 31.8037 14.5641C33.3856 14.5641 34.6474 15.826 34.6474 17.4079H35.6323C38.3949 17.4079 40.645 19.6579 40.645 22.4206V30.859C40.645 31.9333 40.3061 32.9304 39.7358 33.7741C38.2978 31.7512 37.4062 29.1793 37.4062 26.3708C37.4062 24.4967 37.8281 22.7175 38.5663 21.0934C36.8788 19.7418 34.7275 18.8981 32.3364 18.8981Z"
              fill="#06C755"
            />
          </svg>
          <span>Sign in with LINE</span>
        </button>
      </div>
    </div>
  </div>
</template>
