<template>
  <div class="bg-slate-50">
    <svg class="absolute h-0 w-0">
      <defs>
        <clipPath id="swoosh-clip" clipPathUnits="objectBoundingBox">
          <path d="M0,0 H1 V0.9 Q0.5,1.0 0,0.9 V0 Z" />
        </clipPath>
      </defs>
    </svg>

    <section class="hero-swoosh-clip relative text-white">
      <div class="relative bg-[#477aa5] pt-20 pb-28 lg:pt-24 lg:pb-32">
        <div class="absolute inset-0 z-10 bg-black/50" />
        <div class="absolute inset-0 z-0 h-full w-full">
          <img
            src="/images/home/home-hero-bg.webp"
            alt="ภาพพื้นหลังคอนโดและหอพักยามค่ำคืนสำหรับระบบบริหารจัดการ"
            class="h-full w-full object-cover opacity-30"
          />
        </div>

        <UContainer class="container relative z-20">
          <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div class="text-center lg:text-left">
              <h1
                data-aos="fade-up"
                class="text-5xl font-bold tracking-tight text-white sm:text-6xl xl:text-7xl text-balance"
              >
                <span data-aos="fade-up" data-aos-delay="100">
                  เรื่องหอพัก,
                </span>
                <br class="hidden lg:block" />
                <span
                  data-aos="fade-up"
                  data-aos-delay="300"
                  class="mt-1 block"
                >
                  จบ ครบ<span class="text-[#00FFDE]"> ในที่เดียว</span>
                </span>
              </h1>

              <p
                data-aos="fade-up"
                data-aos-delay="500"
                class="mt-6 text-lg md:text-xl xl:text-2xl tracking-tight text-white/80 text-balance"
              >
                เปลี่ยนความวุ่นวายให้เป็นระบบที่แม่นยำ เช็กห้องว่าง, <br />
                ดูยอดเงินเข้า, ตอบผู้เช่า, ทั้งหมด... ทำได้จากทุกที่ที่คุณอยู่
              </p>

              <div
                data-aos="fade-up"
                data-aos-delay="400"
                class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
              >
                <UButton
                  to="/request-access"
                  label="รับสิทธิ์ทดลองใช้"
                  size="xl"
                  class="w-full sm:w-auto justify-center px-8 font-bold text-white bg-[#4300FF] hover:bg-cyan-500 transition-all duration-200 transform hover:scale-105"
                />
                <UButton
                  to="/features"
                  label="ดูฟีเจอร์"
                  size="xl"
                  variant="link"
                  color="white"
                  :trailing="true"
                  icon="i-heroicons-arrow-right-20-solid"
                  class="w-full sm:w-auto justify-center"
                />
              </div>
            </div>

            <div
              class="relative"
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-anchor-placement="top-bottom"
            >
              <div class="mt-[-1rem] lg:mt-0">
                <img
                  src="/images/home/phone-hero-bg.webp"
                  alt="ภาพหน้าจอมือถือแสดงแอปพลิเคชันระบบจัดการหอพัก"
                  class="mx-auto w-full max-w-xs sm:max-w-sm drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </UContainer>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// All good here
</script>

<style scoped>
h1,
p {
  text-wrap: balance;
}

@media (min-width: 1024px) {
  .hero-swoosh-clip {
    clip-path: url(#swoosh-clip);
  }
}
</style>
