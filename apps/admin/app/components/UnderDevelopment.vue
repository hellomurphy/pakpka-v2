<template>
  <div
    class="min-h-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center"
  >
    <div
      class="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-gray-200"
    >
      <div class="flex justify-center mb-6">
        <svg
          class="w-16 h-16 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          ></path>
        </svg>
      </div>

      <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ pageName }}</h1>
      <p class="text-gray-600 mb-6">หน้านี้กำลังอยู่ระหว่างการพัฒนา</p>

      <div class="bg-blue-50 rounded-lg p-4 mb-6">
        <p class="text-blue-700 text-sm">
          เรากำลังทำงานอย่างหนักเพื่อให้คุณได้รับประสบการณ์ที่ดีที่สุด
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  pageName: {
    type: String,
    default: "หน้านี้",
  },
});
</script>

<style scoped>
/* Animation for the icon */
svg {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
