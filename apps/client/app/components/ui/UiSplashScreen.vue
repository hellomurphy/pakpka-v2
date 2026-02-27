<template>
  <div
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white"
  >
    <div class="relative flex flex-col items-center justify-center">
      <!-- <img
        src="/logo-white.svg"
        alt="Pakpak Logo"
        class="w-20 h-20 opacity-0 animate-logo-pop"
      /> -->

      <h1 class="text-3xl font-bold mt-4 tracking-wider opacity-0 animate-text-pop">
        PAKPAK
      </h1>
      <p class="text-sm text-slate-400 opacity-0 animate-text-pop" style="animation-delay: 0.2s">
        Loading your space...
      </p>

      <div class="absolute -bottom-16 w-48 h-1 bg-slate-700 rounded-full overflow-hidden opacity-0 animate-fade-in-long">
        <div class="w-full h-full bg-indigo-500 rounded-full animate-progress-bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// สมมติว่าคุณมี logo-white.svg สำหรับพื้นหลังสีเข้ม
</script>

<style scoped>
@keyframes logo-pop {
  0% { opacity: 0; transform: scale(0.5); }
  80% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes text-pop {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in-long {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes progress-bar {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

/* Applying animations with delays */
.animate-logo-pop {
  animation: logo-pop 0.6s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}

.animate-text-pop {
  animation: text-pop 0.5s cubic-bezier(0.76, 0, 0.24, 1) forwards;
  animation-delay: 0.1s;
}

.animate-fade-in-long {
  animation: fade-in-long 0.4s ease-out forwards;
  animation-delay: 0.5s;
}

.animate-progress-bar {
  /* ทำให้วิ่งไปกลับอย่างนุ่มนวล */
  animation: progress-bar 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
</style>