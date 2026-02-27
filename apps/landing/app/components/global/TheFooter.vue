<template>
  <footer class="bg-slate-800 dark:bg-slate-900 text-white">
    <div class="container mx-auto px-4 py-16">
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        <div class="col-span-2 lg:col-span-2">
          <a href="/" class="flex items-center space-x-2">
            <img src="/favicon.ico" class="w-8 h-8 text-emerald-400" />
            <span class="font-bold text-2xl text-white">Pakpak</span>
          </a>
          <p class="mt-4 text-slate-400 max-w-xs">
            เรื่องหอพัก จบ ครบ ในที่เดียว. ระบบปฏิบัติการสำหรับที่พักให้เช่า
            ที่จะคืนเวลาและความสบายใจให้คุณ
          </p>
          <div class="mt-6 flex space-x-4">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              class="text-slate-400 hover:text-white transition-colors duration-300"
            >
              <span class="sr-only">{{ social.name }}</span>
              <Icon :name="social.icon" class="w-6 h-6" />
            </a>
          </div>
        </div>

        <div v-for="section in footerLinks" :key="section.title">
          <h3 class="font-semibold text-white tracking-wider uppercase">
            {{ section.title }}
          </h3>
          <ul class="mt-4 space-y-3">
            <li v-for="link in section.links" :key="link.name">
              <a
                :href="link.href"
                class="text-slate-400 hover:text-white transition-colors duration-300"
              >
                {{ link.name }}
              </a>
            </li>
            <li v-if="section.title === 'กฎหมายและนโยบาย'">
              <button
                @click="openModal"
                class="text-slate-400 hover:text-white transition-colors"
              >
                ตั้งค่าคุกกี้
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="bg-slate-900/50 dark:bg-black/20 py-6">
      <div class="container mx-auto px-4 text-center text-sm text-slate-500">
        <p>
          &copy; {{ new Date().getFullYear() }} Pakpak. All Rights Reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* All styling is handled by Tailwind CSS classes. */
</style>

<script setup>
import { ref } from "vue";
const cookieControl = useCookieControl();
const showModal = cookieControl?.isModalActive;

function openModal() {
  if (showModal) {
    showModal.value = true;
  } else {
    console.warn("CookieControl not initialized yet");
  }
}

const legalLinks = ref([
  { name: "ข้อตกลงการใช้งาน", path: "/terms" },
  { name: "นโยบายความเป็นส่วนตัว", path: "/privacy" },
]);

// จัดการลิงก์ใน Footer ทั้งหมดที่นี่ ทำให้แก้ไขง่าย
const footerLinks = ref([
  {
    title: "ผลิตภัณฑ์",
    links: [
      { name: "ภาพรวมฟีเจอร์", href: "/features" },
      { name: "ราคา", href: "/pricing" },
      // { name: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "เกี่ยวกับเรา",
    links: [
      { name: "เรื่องราวของเรา", href: "/about" },
      { name: "ติดต่อเรา", href: "/contact" },
    ],
  },
  {
    title: "กฎหมายและนโยบาย",
    links: [
      // สำคัญมาก: แม้จะยังไม่เป็นบริษัท แต่การมี 2 หน้านี้จะสร้างความน่าเชื่อถือสูงมาก
      { name: "ข้อตกลงการใช้งาน", href: "/terms-of-service" },
      { name: "นโยบายความเป็นส่วนตัว", href: "/privacy-policy" },
    ],
  },
]);

// จัดการลิงก์ Social Media ที่นี่
const socialLinks = ref([
  {
    name: "Facebook",
    icon: "fa6-brands:facebook",
    href: "https://web.facebook.com/pakpakapplication",
  }, // TODO: ใส่ลิงก์ Facebook Page ของคุณ
  {
    name: "LINE Official Account",
    icon: "fa6-brands:line",
    href: "https://line.me/R/ti/p/@pakpak",
  }, // TODO: ใส่ลิงก์ LINE OA ของคุณ
]);
</script>
