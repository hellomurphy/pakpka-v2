<script setup lang="ts">
import { useNavigation } from '~/constants/navigation'
import type { NavigationItem } from '~/constants/navigation'
import { useAppAuth } from '~/composables/useAppAuth'
import { useSidebar } from '~/composables/useSidebar'

const { mainNavItems, userNavItems } = useNavigation()
const route = useRoute()
const { signOut } = useAppAuth()

// ✨ Use global sidebar state
const { isSidebarOpen } = useSidebar()

// ✨ 2. ฟังก์ชันสำหรับตรวจสอบว่าเมนูย่อยกำลัง Active อยู่หรือไม่
// เพื่อไฮไลท์เมนูหลักให้ถูกต้อง
const isSubMenuActive = (children: NavigationItem[] | undefined) => {
  if (!children) return false
  return children.some((child: NavigationItem) => child.to && route.path.startsWith(child.to))
}

const isItemActive = (item: NavigationItem): boolean => {
  // ถ้าเป็นเมนูหลักที่มีเมนูย่อย ให้ตรวจสอบลูกๆ
  if (item.children && item.children.length > 0) {
    return item.children.some((child) => child.to && route.path.startsWith(child.to))
  }
  // ถ้าเป็นเมนูเดี่ยวๆ ให้ตรวจสอบว่า path ปัจจุบันขึ้นต้นด้วย path ของเมนูหรือไม่
  return item.to ? route.path.startsWith(item.to) : false
}
// ✨ 3. ไม่จำเป็นต้องใช้ getIconComponent แล้ว เพราะเราส่ง Component มาโดยตรง

const handleLogout = async () => {
  // สั่ง signOut และ redirect ไปหน้า login
  await signOut({ callbackUrl: '/login' })
}

const logoSrc = '/favicon.svg'
</script>

<template>
  <!-- Sidebar Container -->
  <!-- Tablet: Toggle behavior, Desktop: Always visible -->
  <div
    class="hidden md:flex flex-col h-screen bg-white border-r border-gray-100 fixed md:transition-all md:duration-300 md:ease-in-out lg:transition-none"
    :class="[isSidebarOpen ? 'md:w-72 md:left-0' : 'md:w-0 md:-left-72', 'lg:w-72 lg:left-0']"
  >
    <!-- ส่วนหัว Sidebar -->
    <div class="flex items-center h-20 px-6 shrink-0">
      <NuxtLink to="/" class="flex items-center">
        <img :src="logoSrc" alt="Pakpak Logo" class="w-8 h-8" />
        <h1 class="ml-3 text-xl font-bold text-gray-800 tracking-tight whitespace-nowrap">
          Pakpak (พักพัก)
        </h1>
      </NuxtLink>
    </div>

    <!-- เมนูหลัก (ปรับปรุงใหม่) -->
    <nav class="flex-1 flex flex-col overflow-y-auto px-4">
      <ul class="flex-1 space-y-1">
        <li v-for="item in mainNavItems" :key="item.label">
          <!-- ✨ 4. ถ้า item ไม่มี children ให้แสดงเป็น Link ปกติ -->
          <NuxtLink
            v-if="!item.children"
            :to="item.to!"
            :class="[
              'flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group border-l-4',
              isItemActive(item)
                ? 'bg-blue-50 text-blue-600 font-semibold border-blue-500'
                : 'border-transparent',
            ]"
          >
            <UIcon
              :name="(isItemActive(item) ? item.activeIcon : item.icon) ?? item.icon"
              class="w-6 h-6 mr-3 text-gray-400 group-hover:text-gray-600 transition-colors"
              :class="{ '!text-blue-600': isItemActive(item) }"
            />
            <span class="truncate">{{ item.label }}</span>
            <span
              v-if="item.count && item.count > 0"
              class="ml-auto inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800"
            >
              {{ item.count }}
            </span>
          </NuxtLink>

          <!-- เมนูย่อย (UCollapsible) -->
          <UCollapsible
            v-else
            :default-open="isSubMenuActive(item.children)"
            class="group/collapse"
          >
            <UButton
              color="neutral"
              variant="ghost"
              class="flex items-center w-full p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 border-l-4 group-data-[state=open]/collapse:bg-blue-50 group-data-[state=open]/collapse:text-blue-600 group-data-[state=open]/collapse:border-blue-500 border-transparent justify-start"
              :class="[
                isSubMenuActive(item.children)
                  ? 'bg-blue-50 text-blue-600 font-semibold border-blue-500'
                  : '',
              ]"
            >
              <UIcon
                :name="(isSubMenuActive(item.children) ? item.activeIcon : item.icon) ?? item.icon"
                class="w-6 h-6 mr-3 text-gray-400 group-hover:text-gray-600 transition-colors"
                :class="{ '!text-blue-600': isSubMenuActive(item.children) }"
              />
              <span class="truncate flex-1 text-left">{{ item.label }}</span>
              <UIcon
                name="i-lucide-chevron-right"
                class="ml-auto h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-transform group-data-[state=open]/collapse:rotate-90"
              />
            </UButton>
            <template #content>
              <ul class="mt-1 space-y-1">
                <li v-for="subItem in item.children" :key="subItem.label">
                  <NuxtLink
                    :to="subItem.to"
                    class="flex items-center py-3 pl-12 pr-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group border-l-4 border-transparent"
                    active-class="!bg-blue-50 !text-blue-600 !font-semibold !border-blue-500"
                  >
                    <span class="truncate">{{ subItem.label }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </template>
          </UCollapsible>
        </li>
      </ul>
    </nav>

    <!-- เมนูผู้ใช้ (คงดีไซน์เดิม) -->
    <div class="p-4 border-t border-gray-100 shrink-0">
      <div class="space-y-1">
        <template v-for="item in userNavItems" :key="item.label">
          <NuxtLink
            v-if="!item.isButton"
            :to="item.to!"
            class="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group border-l-4 border-transparent"
            active-class="!bg-blue-50 !text-blue-600 !font-semibold !border-blue-500"
          >
            <UIcon
              :name="(route.path.startsWith(item.to!) ? item.activeIcon : item.icon) ?? item.icon"
              class="w-6 h-6 mr-3 text-gray-400 group-hover:text-gray-600"
              :class="{ '!text-blue-600': route.path.startsWith(item.to!) }"
            />
            <span class="text-sm truncate">{{ item.label }}</span>
          </NuxtLink>

          <button
            v-else
            class="flex items-center w-full p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group"
            @click="handleLogout"
          >
            <UIcon :name="item.icon" class="w-6 h-6 mr-3 text-gray-400 group-hover:text-gray-600" />
            <span class="text-sm truncate">{{ item.label }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
