<template>
  <section class="relative bg-slate-900 overflow-hidden">
    <div aria-hidden="true" class="absolute inset-0 z-0">
      <div
        class="absolute -top-48 -left-48 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-20 animate-blob-1"
      ></div>
      <div
        class="absolute -bottom-24 -right-12 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20 animate-blob-2"
      ></div>
      <div
        class="absolute -top-24 -right-24 w-72 h-72 bg-fuchsia-500 rounded-full blur-3xl opacity-15 animate-blob-3"
      ></div>
    </div>

    <div
      class="relative z-10 container mx-auto px-4 py-24 sm:py-32 text-center"
    >
      <div data-aos="fade-up">
        <h2
          class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
        >
          พร้อมเปลี่ยนความวุ่นวาย<br
            class="sm:hidden"
          />ให้เป็นความสำเร็จหรือยัง?
        </h2>
        <p class="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
          เริ่มต้นใช้งาน Pakpak วันนี้ ทดลองฟรี 30 วัน ไม่ต้องใช้บัตรเครดิต
        </p>
        <div class="mt-10">
          <NuxtLink
            @click="trackTrialInterest"
            to="/request-access"
            class="inline-block px-10 py-4 text-lg font-semibold text-slate-800 bg-white rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50"
          >
            เข้าร่วม Waitlist
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const trackTrialInterest = () => {
  if (process.env.NODE_ENV === "development") return;
  window.fbq?.("track", "Lead", {
    content_name: "Free Trial Button",
    category: "TrialInterest",
  });
};
</script>

<style scoped>
/* เราจะใช้ CSS Keyframes ในการสร้าง Animation การเคลื่อนไหวของแสง Aurora 
  Tailwind ไม่สามารถทำส่วนนี้ได้โดยตรง
*/

@keyframes blob-1 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

@keyframes blob-2 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(-40px, 30px) scale(1.1);
  }
  66% {
    transform: translate(30px, -20px) scale(0.9);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

@keyframes blob-3 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(50px, 50px) scale(1.1);
  }
  66% {
    transform: translate(-30px, -40px) scale(0.9);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

.animate-blob-1 {
  animation: blob-1 20s infinite alternate;
}
.animate-blob-2 {
  animation: blob-2 25s infinite alternate-reverse;
}
.animate-blob-3 {
  animation: blob-3 30s infinite alternate;
}
</style>
