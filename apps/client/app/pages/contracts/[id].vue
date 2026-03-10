<template>
  <div class="bg-slate-50">
    <main class="py-6 px-4">
      <div class="max-w-3xl mx-auto">
        <div v-if="isLoading" class="text-center pt-20">
          <Icon name="ph:spinner-duotone" class="text-4xl animate-spin text-slate-400" />
        </div>

        <div v-else-if="loadError" class="text-center pt-20 px-4">
          <Icon name="ph:warning-circle-duotone" class="text-5xl text-amber-500 mb-3" />
          <p class="text-slate-700 font-semibold">{{ loadError }}</p>
          <NuxtLink
            to="/my-rooms"
            class="inline-block mt-4 text-indigo-600 font-medium hover:underline"
          >
            กลับไปห้องของฉัน
          </NuxtLink>
        </div>

        <div v-else-if="contract" class="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div class="p-4 md:p-6 border-b border-slate-100">
            <h1 class="text-xl font-bold text-slate-800">
              สัญญาเช่าห้อง {{ contract.roomNumber }}
            </h1>
            <p class="text-sm text-slate-500">{{ contract.propertyName }}</p>
          </div>

          <div v-if="contract.type === 'digital'" class="p-4 md:p-6 space-y-6">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-slate-500">วันเริ่มสัญญา</p>
                  <p class="font-semibold text-slate-700">
                    {{ contract.details.startDate }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-slate-500">วันสิ้นสุดสัญญา</p>
                  <p class="font-semibold text-slate-700">
                    {{ contract.details.endDate }}
                  </p>
                </div>
              </div>
              <div class="mt-4 border-t pt-3">
                <p class="text-slate-500">ค่าเช่า</p>
                <p class="font-bold text-indigo-600 text-xl">
                  {{ formatNumber(contract.details.rentAmount) }} บาท/เดือน
                </p>
              </div>
            </div>
            <article class="text-sm text-slate-700 leading-relaxed space-y-3">
              <h3 class="font-bold text-base text-slate-800">ข้อสัญญาสำคัญ</h3>
              <p>{{ contract.details.clauses }}</p>
            </article>
          </div>

          <div v-else-if="contract.type === 'file'" class="p-4 md:p-6 space-y-4">
            <p class="text-sm text-slate-600 text-center">สัญญานี้ถูกอัปโหลดเป็นไฟล์เอกสาร</p>
            <div class="border rounded-lg overflow-hidden h-80 bg-slate-100">
              <img
                :src="contract.fileUrls[0]"
                alt="Contract Preview"
                class="w-full h-full object-cover object-top"
              />
            </div>
            <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <button @click="openViewer" class="action-button-primary w-full">
                <template v-if="contract.fileUrls.length > 1">
                  <Icon name="solar:gallery-wide-bold-duotone" />
                  <span>ดูเอกสารทั้งหมด ({{ contract.fileUrls.length }} หน้า)</span>
                </template>
                <template v-else>
                  <Icon name="solar:eye-bold-duotone" />
                  <span>ดูเอกสาร</span>
                </template>
              </button>
              <a
                :href="contract.pdfUrl"
                :download="`contract-${contract.id}.pdf`"
                class="action-button w-full"
              >
                <Icon name="solar:file-download-bold-duotone" />
                <span>ดาวน์โหลด PDF</span>
              </a>
            </div>
          </div>

          <div v-else class="p-10 text-center">
            <Icon name="solar:file-not-found-bold-duotone" class="text-6xl text-slate-300 mb-2" />
            <p class="font-semibold text-slate-600">ยังไม่มีการอัปโหลดสัญญา</p>
            <p class="text-sm text-slate-400">กรุณาติดต่อผู้จัดการที่พักเพื่อดำเนินการ</p>
          </div>
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
          v-if="isViewerOpen"
          class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col"
          @keydown.esc="closeViewer"
        >
          <div class="flex-shrink-0 p-4 flex justify-between items-center text-white">
            <h3 class="font-semibold">
              สัญญาเช่า (หน้า {{ currentPage + 1 }} / {{ contract.fileUrls.length }})
            </h3>
            <button @click="closeViewer" class="p-2 -m-2">
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
              :src="contract.fileUrls[currentPage]"
              alt="Contract Page"
              class="max-w-full max-h-full object-contain"
              @load="isImageLoading = false"
            />
          </div>

          <div class="flex-shrink-0 p-4 w-full">
            <div class="flex justify-center">
              <div class="flex gap-3 overflow-x-auto no-scrollbar p-2 bg-black/20 rounded-xl">
                <button
                  v-for="(imgUrl, index) in contract.fileUrls"
                  :key="index"
                  @click="selectPage(index)"
                  class="w-14 h-20 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200"
                  :class="
                    currentPage === index
                      ? 'border-4 border-indigo-500'
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
import { ref, onMounted, watch } from 'vue'

definePageMeta({
  title: 'รายละเอียดสัญญาเช่า',
  headerVariant: 'page',
  showFooter: false,
})

const route = useRoute()
const { formatNumber } = useNumberFormat()
const api = useApi()
const isLoading = ref(true)
const contract = ref<any>(null)
const loadError = ref<string | null>(null)

// --- Viewer State ---
const isViewerOpen = ref(false)
const currentPage = ref(0)
const isImageLoading = ref(false)

function formatContractDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// --- Viewer Functions ---
function openViewer() {
  currentPage.value = 0
  isImageLoading.value = true
  isViewerOpen.value = true
}
function closeViewer() {
  isViewerOpen.value = false
}
function selectPage(index: number) {
  currentPage.value = index
}

watch(currentPage, () => {
  isImageLoading.value = true
})

onMounted(async () => {
  const id = route.params.id as string
  if (!id) {
    loadError.value = 'ไม่พบรหัสสัญญา'
    isLoading.value = false
    return
  }
  try {
    const res = await api.contracts.getMyById(id)
    const raw = res.data as {
      id: string
      startDate: string | Date
      endDate: string | Date
      rentAmount: string | number
      propertyName?: string | null
      room?: { roomNumber: string } | null
      contractFile?: string
      contractImages?: string[]
    } | null
    if (!raw) {
      loadError.value = 'ไม่พบข้อมูลสัญญา'
      isLoading.value = false
      return
    }
    const roomNumber = raw.room?.roomNumber ?? '—'
    const propertyName = raw.propertyName ?? '—'
    const rentAmount = typeof raw.rentAmount === 'string' ? Number(raw.rentAmount) : raw.rentAmount
    const fileUrls = (raw as { contractImages?: string[] }).contractImages ?? []
    const pdfUrl = (raw as { contractFile?: string }).contractFile ?? ''
    const hasFile = fileUrls.length > 0 || !!pdfUrl

    if (hasFile && fileUrls.length > 0) {
      contract.value = {
        id: raw.id,
        type: 'file' as const,
        roomNumber,
        propertyName,
        fileUrls,
        pdfUrl: pdfUrl || fileUrls[0] || '#',
      }
    } else if (raw.id && roomNumber && propertyName) {
      contract.value = {
        id: raw.id,
        type: 'digital' as const,
        roomNumber,
        propertyName,
        details: {
          startDate: formatContractDate(raw.startDate),
          endDate: formatContractDate(raw.endDate),
          rentAmount,
          clauses:
            'ข้อความในสัญญาตามที่ตกลงกับทางหอพัก กรุณาติดต่อผู้จัดการสำหรับรายละเอียดฉบับเต็ม',
        },
      }
    } else {
      contract.value = {
        id: raw.id,
        type: 'none' as const,
        roomNumber,
        propertyName,
      }
    }
  } catch (e: unknown) {
    loadError.value = (e as { data?: { message?: string } })?.data?.message ?? 'โหลดสัญญาไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.action-button {
  flex: 1 1 0%;
  text-align: center;
  background-color: #fff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-weight: bold;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.action-button-primary {
  flex: 1 1 0%;
  text-align: center;
  background-color: #4f46e5;
  color: #fff;
  font-weight: bold;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
