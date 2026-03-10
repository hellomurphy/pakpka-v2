<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#4679A3] to-[#87B3D9] p-4"
  >
    <div class="w-full max-w-md">
      <!-- Logo/Title -->
      <div class="text-center mb-8">
        <h1 class="text-white text-4xl font-bold mb-2">PakPak</h1>
        <p class="text-white/80 text-sm">ระบบจัดการหอพักสำหรับผู้เช่า</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-slate-800">เข้าสู่ระบบ</h2>
          <p class="text-slate-500 text-sm mt-1">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
        </div>

        <!-- Dev Mode: one-click bypass (same as admin dev-login) -->
        <div v-if="isDevMode" class="space-y-4">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p class="text-xs text-yellow-800 font-semibold">
              🔧 DEV MODE: กดปุ่มด้านล่างเพื่อล็อกอิน (ใช้ user ที่มี tenant จาก seed)
            </p>
          </div>

          <button
            v-if="isDevBypassAvailable"
            type="button"
            class="w-full flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed"
            :disabled="isLoadingBypass"
            @click="handleDevLoginBypass"
          >
            <Icon
              v-if="isLoadingBypass"
              name="ph:spinner-duotone"
              class="animate-spin mr-2 size-5"
            />
            <span>{{ isLoadingBypass ? 'กำลังเข้าสู่ระบบ...' : 'Login (Dev)' }}</span>
          </button>
          <p v-if="bypassError" class="text-sm text-red-600 text-center">{{ bypassError }}</p>
        </div>

        <!-- LINE Login (Production) -->
        <div v-else class="space-y-4">
          <button
            class="w-full bg-[#06C755] text-white font-semibold py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 hover:bg-[#05b04d] transition-all"
            @click="handleLineLogin"
          >
            <img
              src="https://scdn.line-apps.com/n/line_login/btn_login_base.png"
              alt="LINE"
              class="w-6 h-6"
            />
            <span>Login with LINE</span>
          </button>

          <p class="text-xs text-slate-400 text-center">
            การเข้าสู่ระบบถือว่าคุณยอมรับ
            <a href="#" class="text-indigo-600 underline">เงื่อนไขการใช้งาน</a>
          </p>
        </div>
      </div>

      <!-- Dev Mode Toggle (for testing) -->
      <div v-if="canToggleDevMode" class="text-center mt-4">
        <button
          class="text-white/60 text-xs hover:text-white transition-colors"
          @click="isDevMode = !isDevMode"
        >
          {{ isDevMode ? 'Switch to LINE Login' : 'Switch to Dev Mode' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'splash',
})

const userStore = useUserStore()
onMounted(async () => {
  if (userStore.isLoggedIn) {
    await navigateTo('/dashboard', { replace: true })
  }
})
const isLoadingBypass = ref(false)
const bypassError = ref('')

// Check if dev mode based on environment
const isDevMode = ref(
  process.env.NODE_ENV === 'development' || process.env.NUXT_PUBLIC_APP_MODE === 'demo',
)

// One-click dev bypass (same as admin): only in development
const isDevBypassAvailable = computed(() => process.env.NODE_ENV === 'development')

// Allow toggling in development
const canToggleDevMode = computed(() => process.env.NODE_ENV === 'development')

// Dev bypass: GET admin /api/auth/dev-login → cookie set → fetchProfile → dashboard (เหมือน admin)
async function handleDevLoginBypass() {
  if (!isDevBypassAvailable.value) return
  isLoadingBypass.value = true
  bypassError.value = ''
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl as string
  try {
    await $fetch<{ ok?: boolean; user?: unknown }>(`${apiBaseUrl}/auth/dev-login`, {
      credentials: 'include',
    })
    await userStore.fetchProfile()
    if (userStore.isLoggedIn) {
      await navigateTo('/dashboard')
    } else {
      bypassError.value = 'ไม่พบข้อมูลผู้เช่า (รัน seed ใน admin ก่อน: POST /api/dev/seed)'
    }
  } catch (e: unknown) {
    const msg =
      e &&
      typeof e === 'object' &&
      'data' in e &&
      e.data &&
      typeof (e.data as { statusMessage?: string }).statusMessage === 'string'
        ? (e.data as { statusMessage: string }).statusMessage
        : 'Dev login failed'
    bypassError.value = msg
  } finally {
    isLoadingBypass.value = false
  }
}

// LINE login handler (placeholder for future)
const handleLineLogin = () => {
  // TODO: Implement LINE Login with LIFF
  alert('LINE Login will be implemented later')
}
</script>
