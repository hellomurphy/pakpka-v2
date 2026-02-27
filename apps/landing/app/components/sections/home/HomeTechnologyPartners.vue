<template>
  <section class="bg-slate-50 dark:bg-slate-900 py-20 sm:py-24">
    <div class="container mx-auto px-4">
      <div class="text-center max-w-3xl mx-auto">
        <h3
          class="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider"
        >
          ขับเคลื่อนด้วยเทคโนโลยีที่คุณไว้วางใจ
        </h3>
        <p
          class="mt-4 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
        >
          เราเลือกใช้พาร์ทเนอร์ชั้นนำระดับประเทศและระดับโลก
          เพื่อให้คุณมั่นใจในความปลอดภัยและเสถียรภาพสูงสุด
        </p>
      </div>

      <div class="mt-12">
        <div
          class="flex flex-wrap justify-center items-center gap-x-8 sm:gap-x-12 md:gap-x-16 gap-y-8"
        >
          <div
            v-for="partner in partners"
            :key="partner.name"
            class="flex-shrink-0"
          >
            <a
              :href="partner.website"
              target="_blank"
              rel="noopener noreferrer"
              class="transition-opacity duration-300 opacity-60 hover:opacity-100"
            >
              <img
                :src="partner.logoUrl"
                :alt="partner.name + ' Logo'"
                class="h-8 sm:h-10"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* All styling is handled by Tailwind CSS classes for consistency. */
</style>

<script setup>
import { ref } from "vue";

// จัดการรายชื่อพาร์ทเนอร์ในนี้ ทำให้แก้ไขและเพิ่มเติมได้ง่ายในอนาคต
const partners = ref([
  {
    name: "LINE",
    // ใช้โลโก้ทางการของ LINE
    logoUrl:
      "https://vos.line-scdn.net/strapi-cluster-instance-bucket-84/appicon_01_f9ed1cf01f.jpeg",
    website: "https://line.me/th/",
  },
  {
    name: "Omise",
    // ใช้โลโก้ทางการของ Omise
    logoUrl: "https://cdn.prod.website-files.com/67481ca1f2e8301c5e5e3895/677d43728a9133b4cb493fd4_Logo.svg",
    website: "https://www.omise.co/th",
  },
]);
</script>
