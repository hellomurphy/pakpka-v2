<script setup>
import YouTubePlayer from "~/components/YouTubePlayer.vue";
const videoId = "kDR49rapoTw"; // Replace with your actual video ID
</script>

<template>
  <div class="relative isolate bg-slate-50">
    <div
      class="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
      aria-hidden="true"
    >
      <div
        class="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-10 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
        style="
          clip-path: polygon(
            74.1% 44.1%,
            100% 61.6%,
            97.5% 26.9%,
            85.5% 0.1%,
            80.7% 2%,
            72.5% 32.5%,
            60.2% 62.4%,
            52.4% 68.1%,
            47.5% 58.3%,
            45.2% 34.5%,
            27.5% 76.7%,
            0.1% 64.9%,
            17.9% 100%,
            27.6% 76.8%,
            76.1% 97.7%,
            74.1% 44.1%
          );
        "
      />
    </div>

    <div class="px-6 py-16 sm:py-24 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          นี่คือ 'หัวใจ' ของแอปเรา
        </h2>
        <p class="mt-6 text-lg leading-8 text-gray-600">
          เราเชื่อว่าแอปที่ดีต้องมีแก่นที่แข็งแรง
          วิดีโอนี้จะโชว์ให้เห็นระบบหลักที่เราภูมิใจนำเสนอ
          ซึ่งเป็นพื้นฐานของฟีเจอร์ทั้งหมดที่คุณจะได้ใช้ในอนาคต
        </p>
      </div>
      <div class="mt-16 flow-root sm:mt-20">
        <div
          class="mx-auto max-w-4xl rounded-xl shadow-2xl ring-1 ring-gray-900/10"
        >
          <YouTubePlayer
            :video-id="videoId"
            uploadDate="2025-08-22"
            
          />
        </div>
      </div>
    </div>
  </div>
</template>
