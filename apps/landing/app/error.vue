<template>
  <div class="bg-white dark:bg-slate-900">
    <main class="relative isolate min-h-screen">
      <div
        class="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <span
          class="text-[15rem] sm:text-[25rem] lg:text-[30rem] font-black text-slate-100 dark:text-slate-800/50 select-none"
        >
          {{ error.statusCode }}
        </span>
      </div>

      <div
        class="relative z-10 w-full min-h-screen flex items-center justify-center"
      >
        <div class="container mx-auto px-4 text-center">
          <p class="text-base font-semibold text-teal-600 dark:text-teal-400">
            เกิดข้อผิดพลาด {{ error.statusCode }}
          </p>
          <h1
            class="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl text-balance"
          >
            {{ errorTitle }}
          </h1>
          <p
            class="mt-6 text-base leading-7 text-slate-600 dark:text-slate-300 text-balance"
          >
            {{ errorDescription }}
          </p>
          <div class="mt-10">
            <NuxtLink
              to="/"
              @click="handleError"
              class="inline-block px-8 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-blue-500/50"
            >
              กลับสู่หน้าแรก
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  error: Object,
});

// =============================================
// === ส่วนที่แก้ไขข้อความตามที่คุณต้องการ ===
// =============================================
const errorTitle = computed(() => {
  if (props.error.statusCode === 404) {
    // FIX: เปลี่ยนเป็นข้อความใหม่ที่ดูเป็นมิตรและมีชื่อแบรนด์
    return "อุ๊ปส์! Pakpak หาหน้านี้ไม่เจอ";
  }
  return "เกิดข้อผิดพลาดบางอย่าง";
});

const errorDescription = computed(() => {
  if (props.error.statusCode === 404) {
    // FIX: เปลี่ยนเป็นข้อความที่แนะนำทางออกให้ผู้ใช้
    return "ไม่ต้องกังวลครับ ลองตรวจสอบ URL อีกครั้ง หรือกลับไปเริ่มต้นใหม่ที่หน้าแรกของเรา";
  }
  return "ขออภัยในความไม่สะดวก ทีมงานของเราได้รับแจ้งเรื่องนี้แล้วและกำลังเร่งดำเนินการแก้ไขครับ";
});
// =============================================

const handleError = () => clearError({ redirect: "/" });

useSeoMeta({
  title: `${props.error.statusCode} - ${errorTitle.value}`,
  description: "ขออภัย, เกิดข้อผิดพลาดบางอย่างบนเว็บไซต์ Pakpak",
});
</script>
