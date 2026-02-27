<template>
  <div>
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <button
        v-if="isVisible"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        aria-label="กลับไปด้านบนสุด"
      >
        <Icon name="lucide:arrow-up" class="w-6 h-6" />
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// State สำหรับควบคุมการมองเห็นของปุ่ม
const isVisible = ref(false);

// ฟังก์ชันสำหรับตรวจสอบตำแหน่งการ Scroll
const handleScroll = () => {
  // ถ้าเลื่อนลงมามากกว่า 400px ให้แสดงปุ่ม
  if (window.scrollY > 400) {
    isVisible.value = true;
  } else {
    isVisible.value = false;
  }
};

// ฟังก์ชันสำหรับเลื่อนกลับไปบนสุดอย่างนุ่มนวล
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

// เมื่อ Component ถูกสร้าง ให้เริ่มดักจับ Event การ Scroll
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

// เมื่อ Component ถูกทำลาย ให้หยุดดักจับ Event เพื่อคืน Memory
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
