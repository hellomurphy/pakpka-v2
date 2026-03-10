<template>
  <div class="bg-slate-100">
    <main class="py-8 px-4">
      <div v-if="announcement" class="max-w-3xl mx-auto">
        <div class="bg-white rounded-2xl shadow-lg border border-slate-200/80">
          <div class="p-5 border-b border-slate-100">
            <div class="flex justify-between items-center">
              <span class="px-3 py-1 text-xs font-bold rounded-full" :class="styleInfo.tagClass">
                {{ announcement.category }}
              </span>
              <span class="text-xs text-slate-400">
                {{ formattedTimestamp }}
              </span>
            </div>
            <h1 class="text-2xl font-bold text-slate-800 mt-3">
              {{ announcement.title }}
            </h1>
            <p class="text-sm text-slate-500 font-semibold">โดย: {{ announcement.author }}</p>
          </div>

          <article class="p-5 text-base text-slate-700 leading-relaxed space-y-4">
            <div v-for="(block, index) in announcement.content" :key="index">
              <h2
                v-if="block.type === 'heading'"
                class="text-xl font-bold text-slate-800 mt-6 mb-3"
              >
                {{ block.text }}
              </h2>
              <p v-else-if="block.type === 'paragraph'" class="mb-4">
                {{ block.text }}
              </p>
              <ul
                v-else-if="block.type === 'list'"
                class="list-disc list-outside pl-10 space-y-2 mb-4"
              >
                <li v-for="(item, itemIndex) in block.items" :key="itemIndex">
                  {{ item }}
                </li>
              </ul>
            </div>
          </article>

          <div v-if="announcement.attachments.length > 0" class="p-5 border-t border-slate-100">
            <h3 class="text-sm font-bold text-slate-700 mb-3">ไฟล์แนบ</h3>
            <div class="space-y-2">
              <a
                v-for="file in announcement.attachments"
                :key="file.name"
                :href="file.url"
                target="_blank"
                class="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border border-slate-200 transition-colors"
              >
                <Icon
                  name="solar:file-text-bold-duotone"
                  class="text-3xl text-indigo-500 flex-shrink-0"
                />
                <div>
                  <p class="font-semibold text-sm text-slate-800">
                    {{ file.name }}
                  </p>
                  <p class="text-xs text-slate-500">{{ file.size }}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center pt-32">
        <Icon name="ph:spinner-duotone" class="text-4xl animate-spin text-slate-400" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

definePageMeta({
  title: 'รายละเอียดประกาศ',
  headerVariant: 'page',
})

const route = useRoute()
const announcement = ref<any>(null)

// --- ✨ MOCK DATA (ใช้โครงสร้าง Content แบบใหม่) ✨ ---
const mockAnnouncements = {
  'anc-001': {
    id: 'anc-001',
    category: 'ประกาศจากหอพัก',
    type: 'announcement',
    title: 'เรื่องการพ่นยาฆ่าเชื้อและกำจัดยุง',
    author: 'ฝ่ายจัดการ The Modern Property',
    timestamp: '2025-06-14T10:30:00Z',
    content: [
      { type: 'heading', text: 'เรียนผู้พักอาศัยทุกท่าน' },
      {
        type: 'paragraph',
        text: 'เนื่องด้วยสถานการณ์การระบาดของโรคไข้เลือดออก ทางนิติบุคคลจะดำเนินการพ่นยาฆ่าเชื้อและกำจัดยุงในพื้นที่ส่วนกลาง ตามรายละเอียดดังนี้:',
      },
      {
        type: 'list',
        items: ['วันที่: วันเสาร์ที่ 21 มิถุนายน 2568', 'เวลา: 10:00 - 12:00 น.'],
      },
      {
        type: 'paragraph',
        text: 'จึงขอความกรุณาทุกท่านโปรดปิดประตูและหน้าต่างให้สนิทในช่วงเวลาดังกล่าว รวมถึงเก็บเสื้อผ้าและของใช้ส่วนตัวที่ตากไว้บริเวณระเบียง เพื่อความปลอดภัยของท่าน',
      },
      { type: 'paragraph', text: 'ขออภัยในความไม่สะดวกมา ณ ที่นี้' },
    ],
    attachments: [{ name: 'กำหนดการพ่นยา.pdf', size: '1.2 MB', url: '#' }],
  },
}

// --- COMPUTED PROPERTIES ---
const styleInfo = computed(() => {
  if (!announcement.value) return {}
  switch (announcement.value.type) {
    case 'system':
      return { tagClass: 'bg-slate-100 text-slate-600' }
    case 'announcement':
    default:
      return { tagClass: 'bg-amber-100 text-amber-700' }
  }
})

const formattedTimestamp = computed(() => {
  if (!announcement.value?.timestamp) return ''
  return (
    new Date(announcement.value.timestamp).toLocaleString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' น.'
  )
})

// --- LIFECYCLE HOOK ---
onMounted(() => {
  const notiId = route.params.id as string
  setTimeout(() => {
    announcement.value = mockAnnouncements['anc-001']
  }, 300)
})
</script>
