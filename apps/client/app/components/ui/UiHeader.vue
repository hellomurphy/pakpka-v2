<template>
  <header
    class="sticky top-0 bg-white/80 backdrop-blur-sm px-4 py-3 border-b border-slate-200 z-20"
  >
    <div class="flex items-center justify-between h-10 max-w-4xl mx-auto">
      <div class="w-1/3">
        <button
          v-if="variant !== 'dashboard'"
          @click="goBack"
          class="flex items-center -ml-2 p-2 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="ย้อนกลับ"
        >
          <Icon name="solar:alt-arrow-left-linear" class="w-6 h-6" />
        </button>
      </div>

      <div class="w-1/3 text-center">
        <div v-if="variant === 'dashboard'" class="flex items-center justify-center gap-2">
          <!-- <img src="/logo.svg" alt="Pakpak Logo" class="w-7 h-7" /> -->
          <span class="text-xl font-bold text-slate-800">PakPak</span>
        </div>
        <h1 v-else class="text-base font-bold text-slate-800 truncate">
          {{ title }}
        </h1>
      </div>

      <div class="w-1/3 flex items-center justify-end">
        <slot name="actions">
          <NuxtLink
            v-if="variant === 'dashboard'"
            to="/additional"
            class="flex items-center rounded-full ..."
          >
            <img
              v-if="user?.pictureUrl"
              class="h-9 w-9 rounded-full object-cover"
              :src="user.pictureUrl"
              alt="User profile"
            />
            <div v-else class="h-9 w-9 ...">
              <Icon name="solar:user-bold" />
            </div>
          </NuxtLink>
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

// รับ props เพื่อกำหนดการแสดงผล
defineProps({
  title: {
    type: String,
    default: '',
  },
  variant: {
    type: String as () => 'dashboard' | 'page',
    default: 'page',
  },
})

const router = useRouter()

// ข้อมูลผู้ใช้ตัวอย่าง (ในแอปจริงควรดึงมาจาก State กลาง)
const user = {
  displayName: 'Suwit Jaidee',
  pictureUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
}

// แก้ไข Logic การย้อนกลับให้ถูกต้อง
const goBack = () => {
  router.back()
}
</script>
