<script setup>
import { ref, computed } from 'vue'
import { usePropertyStore } from '~/store/propertyStore'
import { useSidebar } from '~/composables/useSidebar'

const propertyStore = usePropertyStore()
const { isSidebarOpen, toggleSidebar } = useSidebar()

const { allProperties, activeProperty } = storeToRefs(propertyStore)

const selectedDorm = ref(activeProperty.value)

watch(selectedDorm, (newDorm) => {
  if (newDorm) {
    propertyStore.setActiveProperty(newDorm)
  }
})
// --- Mock Data ---
// ข้อมูลจำลอง ในแอปจริงจะดึงมาจาก State Management (Pinia/Vuex) หรือ API
const user = ref({
  name: 'Admin Dorm',
  email: 'admin@dorm.app',
  avatar:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
})

const subscription = ref({
  plan: 'Enterprise', // 'Starter', 'Standard', 'Pro', 'Enterprise'
  daysLeft: '∞', // <-- ลองเปลี่ยนตัวเลขนี้เป็นค่าน้อยๆ เช่น 25 หรือ 10 เพื่อดูการแจ้งเตือน
})

// --- Helper Functions ---
// ฟังก์ชันสำหรับเปลี่ยนสี Badge และข้อความตามแพ็กเกจและวันหมดอายุ
const getPackageInfo = (plan, daysLeft) => {
  const info = {
    containerClasses: 'bg-slate-100 text-slate-700 ring-slate-500/10',
    textClasses: '',
    iconName: 'i-lucide-sparkles',
    shimmer: false,
    isUrgent: false,
  }

  switch (plan) {
    case 'Standard':
      info.containerClasses = 'bg-green-100 text-green-700 ring-green-600/20'
      info.iconName = 'i-lucide-shield-check'
      break
    case 'Pro':
      info.containerClasses =
        'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 ring-blue-600/20 shadow-md shadow-blue-500/20'
      info.iconName = 'i-lucide-star'
      break
    case 'Enterprise':
      info.containerClasses =
        'relative overflow-hidden bg-gradient-to-br from-indigo-200 to-purple-200 ring-indigo-600/20 shadow-indigo-500/30'
      info.textClasses =
        'font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent'
      info.iconName = 'i-lucide-trophy'
      info.shimmer = true
      break
  }

  if (daysLeft <= 30 && typeof daysLeft === 'number') {
    info.containerClasses = 'bg-amber-100 text-amber-800 ring-amber-600/20'
    info.textClasses = 'text-amber-800'
    info.iconName = 'i-lucide-bell'
    info.shimmer = false
    info.isUrgent = true
  }

  return info
}

const packageInfo = computed(() =>
  getPackageInfo(subscription.value.plan, subscription.value.daysLeft),
)

const propertySelectItems = computed(() =>
  allProperties.value.map((p) => ({ label: p.name, value: p })),
)

const userMenuItems = computed(() => [
  [
    {
      label: user.value.name,
      description: user.value.email,
      type: 'label',
      avatar: { src: user.value.avatar },
    },
  ],
  [
    {
      label: `แพ็กเกจ: ${subscription.value.plan}`,
      type: 'label',
    },
    {
      label: packageInfo.value.isUrgent
        ? `หมดอายุใน ${subscription.value.daysLeft} วัน`
        : `ใช้งานได้อีก ${subscription.value.daysLeft} วัน`,
      type: 'label',
    },
  ],
])
</script>

<template>
  <header
    class="relative z-30 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
  >
    <!-- ✨ Hamburger Toggle Button (Tablet Only - iPad) -->
    <button
      class="hidden md:flex lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      @click="toggleSidebar"
    >
      <UIcon v-if="!isSidebarOpen" name="i-lucide-menu" class="w-6 h-6 text-gray-600" />
      <UIcon v-else name="i-lucide-x" class="w-6 h-6 text-gray-600" />
    </button>

    <div class="flex-1 flex items-center gap-x-4 self-stretch lg:gap-x-6">
      <USelect
        v-if="allProperties.length > 1"
        v-model="selectedDorm"
        :items="propertySelectItems"
        value-key="value"
        by="id"
        icon="i-lucide-building-2"
        color="primary"
        variant="soft"
        class="w-72 min-w-0"
        :ui="{ base: 'rounded-lg bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100' }"
      />

      <div v-else class="flex items-center gap-x-3 text-sm font-semibold leading-6 text-gray-900">
        <UIcon name="i-lucide-building-2" class="h-6 w-6 text-gray-500" />
        <span>{{ selectedDorm?.name }}</span>
      </div>
    </div>

    <div class="flex items-center gap-x-4 lg:gap-x-6">
      <div class="flex items-center gap-2">
        <div
          :class="packageInfo.containerClasses"
          class="inline-flex items-center gap-x-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
        >
          <UIcon :name="packageInfo.iconName" class="h-4 w-4" />
          <span :class="packageInfo.textClasses">
            {{ subscription.plan }}
          </span>

          <div v-if="packageInfo.shimmer" class="shimmer-effect" />
        </div>
      </div>

      <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

      <UDropdownMenu :items="userMenuItems" :ui="{ content: 'w-64' }">
        <button type="button" class="-m-1.5 flex items-center p-1.5 focus:outline-none">
          <span class="sr-only">Open user menu</span>
          <img class="h-8 w-8 rounded-full bg-gray-50" :src="user.avatar" alt="User Avatar" />
          <span class="hidden lg:flex lg:items-center">
            <span class="ml-4 text-sm font-semibold leading-6 text-gray-900">
              {{ user.name }}
            </span>
            <UIcon name="i-lucide-chevron-down" class="ml-2 h-5 w-5 text-gray-400" />
          </span>
        </button>
      </UDropdownMenu>
    </div>
  </header>
</template>
