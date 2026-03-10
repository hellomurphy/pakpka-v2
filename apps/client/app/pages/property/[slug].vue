<template>
  <div class="bg-slate-50">
    <main class="pb-8">
      <section class="relative">
        <img
          :src="propertyData.coverImage"
          alt="Property Cover Image"
          class="w-full h-64 object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div class="absolute bottom-4 right-4">
          <button
            @click="openGallery"
            class="bg-white/80 backdrop-blur-sm text-slate-800 font-bold text-sm py-2.5 px-4 rounded-lg flex items-center gap-2 shadow-md hover:bg-white transition-all active:scale-95"
          >
            <Icon name="solar:gallery-wide-bold-duotone" />
            <span>ดูรูปภาพทั้งหมด ({{ propertyData.galleryImages.length }})</span>
          </button>
        </div>
      </section>

      <div class="p-4 md:p-6 space-y-6 max-w-4xl mx-auto mt-1">
        <div class="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
          <div class="p-5">
            <h1 class="text-2xl font-bold text-slate-800">
              {{ propertyData.name }}
            </h1>
            <p class="text-slate-500 mt-1">{{ propertyData.address }}</p>
            <a
              :href="propertyData.googleMapsUrl"
              target="_blank"
              class="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline mt-2"
            >
              <Icon name="solar:map-point-wave-bold-duotone" />
              <span>ดูบนแผนที่</span>
            </a>
          </div>
          <div class="p-5 border-t border-slate-100 text-slate-700 leading-relaxed text-sm">
            {{ propertyData.description }}
          </div>
        </div>

        <section class="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
          <h2 class="section-title">สิ่งอำนวยความสะดวก</h2>
          <div class="p-5 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
            <div
              v-for="facility in propertyData.facilities"
              :key="facility.name"
              class="flex items-center gap-3 text-sm"
            >
              <Icon
                :name="facility.icon"
                class="text-xl"
                :class="facility.available ? 'text-green-600' : 'text-slate-400'"
              />
              <span
                :class="facility.available ? 'text-slate-700' : 'text-slate-400 line-through'"
                >{{ facility.name }}</span
              >
            </div>
          </div>
        </section>

        <div class="grid md:grid-cols-2 gap-6">
          <section
            class="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden"
          >
            <h2 class="section-title">อัตราค่าบริการ</h2>
            <div class="p-5 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">ค่าไฟฟ้า</span>
                <span class="font-semibold text-slate-800"
                  >{{ propertyData.rates.electricity }} บาท / หน่วย</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">ค่าน้ำประปา</span>
                <span class="font-semibold text-slate-800"
                  >{{ propertyData.rates.water }} บาท / หน่วย</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">ค่าอินเทอร์เน็ต</span>
                <span class="font-semibold text-slate-800"
                  >{{ propertyData.rates.internet }} บาท / เดือน</span
                >
              </div>
            </div>
          </section>

          <section
            class="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden"
          >
            <h2 class="section-title">กฎระเบียบเบื้องต้น</h2>
            <ul class="p-5 space-y-2 list-disc list-inside text-sm text-slate-700">
              <li v-for="rule in propertyData.rules" :key="rule">{{ rule }}</li>
            </ul>
          </section>
        </div>
      </div>
    </main>

    <Teleport to="body">
      <transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isGalleryOpen"
          class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col"
          @keydown.esc="closeGallery"
        >
          <div class="flex-shrink-0 p-4 flex justify-between items-center text-white">
            <h3 class="font-semibold">
              รูปภาพโครงการ ({{ currentGalleryIndex + 1 }} /
              {{ propertyData.galleryImages.length }})
            </h3>
            <button @click="closeGallery" class="p-2 -m-2">
              <Icon name="ph:x-bold" class="text-2xl" />
            </button>
          </div>

          <div class="flex-grow flex items-center justify-center relative overflow-hidden h-full">
            <div
              v-if="isImageLoading"
              class="w-full h-full max-w-lg max-h-full p-4 flex items-center justify-center"
            >
              <div class="w-full h-full bg-slate-700/50 rounded-lg animate-pulse"></div>
            </div>
            <img
              v-show="!isImageLoading"
              :src="propertyData.galleryImages[currentGalleryIndex]"
              alt="Gallery Image"
              class="max-w-full max-h-full object-contain transition-opacity duration-300"
              @load="isImageLoading = false"
            />
          </div>

          <div class="flex-shrink-0 p-4 w-full">
            <div class="flex justify-center">
              <div class="flex gap-3 overflow-x-auto no-scrollbar p-2 bg-black/20 rounded-xl">
                <button
                  v-for="(imgUrl, index) in propertyData.galleryImages"
                  :key="index"
                  @click="selectPage(index)"
                  class="w-14 h-20 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200"
                  :class="
                    currentGalleryIndex === index
                      ? 'border-4 border-indigo-500 scale-105'
                      : 'border-4 border-transparent opacity-60 hover:opacity-100'
                  "
                >
                  <img :src="imgUrl" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

definePageMeta({
  title: 'ข้อมูลโครงการ',
  headerVariant: 'page',
  showFooter: false,
})

// --- MOCK DATA ---
const propertyData = ref({
  name: 'The Modern Property',
  slug: 'the-modern-property',
  coverImage: 'https://picsum.photos/seed/property-cover/1280/720',
  address: '123 ถ.สุขุมวิท, แขวงคลองเตย, เขตคลองเตย, กรุงเทพมหานคร 10110',
  googleMapsUrl: 'https://maps.app.goo.gl/example',
  description:
    'ที่พักสไตล์โมเดิร์นใจกลางเมือง พร้อมสิ่งอำนวยความสะดวกครบครัน ตอบโจทย์ไลฟ์สไตล์คนรุ่นใหม่ เดินทางสะดวกสบายใกล้รถไฟฟ้า BTS และศูนย์การค้าชั้นนำ',
  facilities: [
    { name: 'อินเทอร์เน็ต Wi-Fi', icon: 'solar:wifi-bold', available: true },
    { name: 'ที่จอดรถยนต์', icon: 'solar:car-bold', available: true },
    { name: 'ฟิตเนส', icon: 'solar:barbell-bold', available: true },
    { name: 'อนุญาตให้เลี้ยงสัตว์', icon: 'solar:cat-bold', available: false },
    { name: 'สระว่ายน้ำ', icon: 'solar:waves-bold', available: false },
    {
      name: 'เครื่องซักผ้าหยอดเหรียญ',
      icon: 'solar:washing-machine-bold',
      available: true,
    },
  ],
  rates: { electricity: '8', water: '18', internet: '300' },
  rules: [
    'ห้ามส่งเสียงดังหลังเวลา 22:00 น.',
    'ไม่อนุญาตให้เลี้ยงสัตว์ทุกชนิดภายในห้องพัก',
    'กรุณาทิ้งขยะในบริเวณที่จัดเตรียมไว้เท่านั้น',
  ],
  galleryImages: [
    'https://picsum.photos/seed/property1/800/600',
    'https://picsum.photos/seed/property2/800/600',
    'https://picsum.photos/seed/property3/800/600',
    'https://picsum.photos/seed/property4/800/600',
    'https://picsum.photos/seed/property5/800/600',
  ],
})

// --- Gallery Modal State & Functions ---
const isGalleryOpen = ref(false)
const currentGalleryIndex = ref(0)
const isImageLoading = ref(false)

const openGallery = () => {
  isGalleryOpen.value = true
  currentGalleryIndex.value = 0
  isImageLoading.value = true
}
const closeGallery = () => {
  isGalleryOpen.value = false
}
const selectPage = (index: number) => {
  currentGalleryIndex.value = index
}

watch(currentGalleryIndex, () => {
  isImageLoading.value = true
})
</script>

<style scoped>
.section-title {
  font-size: 1rem; /* text-base */
  font-weight: 700; /* font-bold */
  color: #1e293b; /* text-slate-800 */
  padding: 1rem; /* p-4 */
  border-bottom: 1px solid #f1f5f9; /* border-b border-slate-100 */
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
