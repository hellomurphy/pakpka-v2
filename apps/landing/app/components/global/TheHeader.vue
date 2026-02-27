<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out h-14 md:h-20',
      isScrolled ? 'bg-white backdrop-blur-lg shadow-sm' : 'bg-transparent',
    ]"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
      <div class="flex items-center justify-between h-full">
        <div class="flex-shrink-0">
          <NuxtLink
            to="/"
            class="text-2xl font-bold transition-colors duration-300"
            :class="textColorClass"
          >
            Pakpak
          </NuxtLink>
        </div>

        <nav class="hidden md:flex md:items-center md:space-x-8">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            v-slot="{ isActive, isExactActive }"
          >
            <span
              :class="[
                'nav-link transition-colors duration-300 font-semibold',
                (link.path === '/blog' ? isActive : isExactActive)
                  ? 'text-teal-500'
                  : textColorClass,
              ]"
            >
              {{ link.name }}
            </span>
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-x-2 sm:gap-x-4">
          <NuxtLink
            @click="trackTrialInterest"
            to="/request-access"
            class="flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2.5 bg-[#4300FF] text-white rounded-lg sm:text-sm font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md whitespace-nowrap"
            aria-label="รับสิทธิ์ใช้งานก่อนใคร"
          >
            ทดลองใช้
          </NuxtLink>

          <div class="md:hidden flex items-center">
            <button
              @click="isMenuOpen = !isMenuOpen"
              class="px-2 rounded-full focus:outline-none transition-colors duration-300 hover:bg-black/10 dark:hover:bg-white/10"
              :class="textColorClass"
            >
              <Icon v-if="!isMenuOpen" name="lucide:menu" class="w-7 h-7" />
              <Icon v-else name="lucide:x" class="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-if="isMenuOpen" class="md:hidden absolute top-14 inset-x-0 p-2">
        <div
          class="rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 divide-y-2 divide-gray-50"
        >
          <div class="pt-5 pb-6 px-5">
            <nav class="grid gap-y-6">
              <NuxtLink
                v-for="link in navLinks"
                :key="`mobile-${link.path}`"
                :to="link.path"
                @click="isMenuOpen = false"
                class="mobile-nav-link text-base font-medium text-gray-900 hover:text-teal-600"
                active-class="text-teal-600"
              >
                {{ link.name }}
              </NuxtLink>
            </nav>
          </div>
          <div class="py-6 px-5">
            <NuxtLink
              to="/request-access"
              class="flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2.5 bg-blue-600 text-white rounded-lg sm:text-sm font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md whitespace-nowrap"
              aria-label="รับสิทธิ์ใช้งานก่อนใคร"
            >
              รับสิทธ์ทดลองใช้เลย!
            </NuxtLink>
            <!-- <p class="text-center text-base font-medium text-gray-500">
              พร้อมแล้วใช่ไหม?
              <NuxtLink
                to="/request-access"
                @click="isMenuOpen = false"
                class="text-blue-600 hover:text-blue-500"
                >ลงทะเบียนเลย</NuxtLink
              >
            </p> -->
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

const isScrolled = ref(false);
const isMenuOpen = ref(false);
const route = useRoute();

const trackTrialInterest = () => {
  if (process.env.NODE_ENV === "development") return;
  window.fbq?.("track", "Lead", {
    content_name: "Free Trial Button",
    category: "TrialInterest",
  });
};

// รายชื่อของหน้าที่ต้องการให้ฟอนต์เป็นสีขาว
const lightThemeRoutes = ["/"];

const headerTheme = computed(() => {
  return lightThemeRoutes.includes(route.path) ? "light" : "dark";
});

const textColorClass = computed(() => {
  if (isScrolled.value) {
    return "text-slate-800";
  }
  return headerTheme.value === "light"
    ? "text-white drop-shadow-md"
    : "text-slate-800";
});

const navLinks = ref([
  { name: "ฟีเจอร์", path: "/features" },
  { name: "ราคา", path: "/pricing" },
  { name: "บทความ", path: "/blog" },
  { name: "ติดต่อเรา", path: "/contact" },
]);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.nav-link.text-teal-500 {
  font-weight: 600;
}
</style>
