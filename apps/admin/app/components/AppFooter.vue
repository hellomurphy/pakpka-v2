<script setup lang="ts">
import { ref } from "vue";
import { useNavigation } from "~/constants/navigation";

const { mobilePrimaryLinks, mobileSecondaryLinks } = useNavigation();
const isMoreMenuOpen = ref(false);
const route = useRoute();
</script>

<template>
  <div class="md:hidden">
    <footer
      class="fixed bottom-0 left-0 right-0 border-t border-gray-100 shadow-[0_-1px_4px_rgba(0,0,0,0.05)] z-40"
    >
      <div class="flex justify-around items-center h-16">
        <!-- Primary Links -->
        <NuxtLink
          v-for="item in mobilePrimaryLinks"
          :key="item.to"
          :to="item.to!"
          class="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 w-1/5 pt-1"
          active-class="!text-blue-600"
        >
          <UIcon
            :name="(route.path.startsWith(item.to!) ? item.activeIcon : item.icon) ?? item.icon"
            class="w-7 h-7"
          />
          <span class="text-xs mt-0.5">{{ item.label }}</span>
        </NuxtLink>

        <!-- More Button -->
        <button
          v-if="mobileSecondaryLinks.length > 0"
          @click="isMoreMenuOpen = true"
          class="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 w-1/5 pt-1 focus:outline-none"
          :class="{ '!text-blue-600': isMoreMenuOpen }"
        >
          <UIcon name="i-lucide-more-horizontal" class="w-7 h-7" />
          <span class="text-xs mt-0.5">เพิ่มเติม</span>
        </button>
      </div>
    </footer>

    <!-- More Menu Bottom Sheet -->
    <UModal
      v-model:open="isMoreMenuOpen"
      :ui="{
        content: 'w-full max-h-[70vh] rounded-t-2xl shadow-2xl flex flex-col fixed bottom-0 left-0 right-0 top-auto translate-y-0',
        overlay: 'fixed inset-0 bg-black/30 backdrop-blur-sm'
      }"
    >
      <template #content>
        <div class="p-4 flex flex-col">
          <div
            class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-4"
          />
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg font-semibold text-gray-800">
              เมนูเพิ่มเติม
            </h2>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              class="-mr-2 p-2"
              @click="isMoreMenuOpen = false"
            />
          </div>

          <nav class="flex flex-col space-y-2 overflow-y-auto mt-2">
            <NuxtLink
              v-for="item in mobileSecondaryLinks"
              :key="item.label"
              :to="item.to!"
              class="flex items-center gap-4 text-gray-700 hover:bg-gray-100 p-3 rounded-lg transition-colors"
              active-class="!bg-blue-50 !text-blue-600"
              @click="isMoreMenuOpen = false"
            >
              <UIcon
                :name="item.icon"
                class="w-6 h-6 shrink-0"
                :class="{ 'text-blue-600': route.path.startsWith(item.to!) }"
              />
              <span class="text-base font-medium">{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </div>
      </template>
    </UModal>
  </div>
</template>
