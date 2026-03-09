<script setup>
import { ref, computed } from 'vue'
import { toPng } from 'html-to-image'
import PrintableInvite from './components/PrintableInvite.vue'
import SocialInvite from './components/SocialInvite.vue'
import { ArrowDownTrayIcon, DocumentDuplicateIcon } from '@heroicons/vue/24/outline'

// --- State Management ---
// const { activeProperty, isSessionInitialized } = useProperty(); // สมมติว่ามีข้อมูลนี้อยู่
const isSessionInitialized = ref(true) // สำหรับแสดงผลชั่วคราว
const activeProperty = ref({ id: '12345', name: 'หอพักสุขใจ' }) // ข้อมูลจำลอง

// ✨ เปลี่ยนมาใช้ string ที่สื่อความหมายแทน index
const selectedTab = ref('social') // 'social' | 'print'

const printableComponent = ref(null)
const socialComponent = ref(null)
const isDownloading = ref(false)
const copied = ref(false)

const onboardingUrl = computed(() => {
  if (!activeProperty.value) return ''
  // ใน Nuxt 3 สามารถใช้ useRequestURL() หรือ window.location
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com'
  return `${baseUrl}/onboard?propertyId=${activeProperty.value.id}`
})

const downloadImage = async () => {
  isDownloading.value = true
  let node
  let filename

  if (selectedTab.value === 'social' && socialComponent.value?.socialArea) {
    node = socialComponent.value.socialArea
    filename = `pakpak-invite-social-${activeProperty.value.id}.png`
  } else if (selectedTab.value === 'print' && printableComponent.value?.printableArea) {
    node = printableComponent.value.printableArea
    filename = `pakpak-invite-a4-${activeProperty.value.id}.png`
  } else {
    console.error('Target element for download not found.')
    isDownloading.value = false
    return
  }

  try {
    const dataUrl = await toPng(node, {
      quality: 1,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    })
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Failed to download image:', error)
  } finally {
    isDownloading.value = false
  }
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(onboardingUrl.value).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>

<template>
  <div v-if="isSessionInitialized" class="p-6 md:px-8 bg-white rounded-xl shadow-md min-h-full">
    <header class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">เชิญผู้เช่าใหม่</h1>
      <p class="mt-1 text-sm text-gray-600">
        สร้างใบประกาศ QR Code สำหรับให้ผู้เช่าใหม่สแกนเพื่อลงทะเบียน
      </p>
    </header>

    <div class="mb-6">
      <div class="inline-flex items-center bg-gray-200/80 rounded-full p-1">
        <button
          :class="[
            'px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200',
            selectedTab === 'social'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-gray-800',
          ]"
          @click="selectedTab = 'social'"
        >
          สำหรับโซเชียล
        </button>
        <button
          :class="[
            'px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200',
            selectedTab === 'print'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-gray-800',
          ]"
          @click="selectedTab = 'print'"
        >
          สำหรับพิมพ์ A4
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 flex justify-center items-start p-6 bg-slate-200/60 rounded-xl">
        <div v-show="selectedTab === 'social'" class="w-full">
          <SocialInvite
            ref="socialComponent"
            :url="onboardingUrl"
            :property-name="activeProperty.name"
          />
        </div>
        <div v-show="selectedTab === 'print'" class="w-full">
          <PrintableInvite
            ref="printableComponent"
            :url="onboardingUrl"
            :property-name="activeProperty.name"
          />
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
          <div class="p-6">
            <h2 class="text-base font-semibold text-gray-900">ดาวน์โหลดใบประกาศ</h2>
            <p class="text-sm text-gray-600 mt-2 mb-4">
              ดาวน์โหลดใบประกาศสำหรับ
              <span class="font-bold text-blue-600">{{
                selectedTab === 'social' ? 'โซเชียล' : 'พิมพ์ A4'
              }}</span>
              เป็นไฟล์รูปภาพ (PNG)
            </p>
            <button
              :disabled="isDownloading"
              class="w-full flex items-center justify-center gap-x-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300"
              @click="downloadImage"
            >
              <svg
                v-if="isDownloading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <ArrowDownTrayIcon v-else class="h-5 w-5" />
              <span>{{
                isDownloading
                  ? 'กำลังดาวน์โหลด...'
                  : `ดาวน์โหลด (${selectedTab === 'social' ? 'โซเชียล' : 'A4'})`
              }}</span>
            </button>
          </div>
        </div>
        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
          <div class="p-6">
            <h2 class="text-base font-semibold text-gray-900">ลิงก์สำหรับลงทะเบียน</h2>
            <div class="relative mt-2 rounded-md shadow-sm">
              <input
                type="text"
                readonly
                :value="onboardingUrl"
                class="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              />
              <div class="absolute inset-y-0 right-0 flex items-center">
                <button class="p-2 text-gray-400 hover:text-gray-600" @click="copyToClipboard">
                  <DocumentDuplicateIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
            <p v-if="copied" class="text-sm text-green-600 mt-2 transition-opacity">คัดลอกแล้ว!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
