<template>
  <div class="bg-slate-50">
    <main class="max-w-2xl mx-auto py-8 px-4">
      <div class="space-y-6">
        <section class="text-center">
          <UIcon name="i-lucide-bell-ring" class="text-5xl text-indigo-500" />
          <h1 class="text-2xl font-bold text-slate-800 mt-2">ตั้งค่าการแจ้งเตือน</h1>
          <p class="text-sm text-slate-500 mt-1">เลือกรับการแจ้งเตือนที่คุณสนใจผ่าน LINE</p>
        </section>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <ul class="divide-y divide-slate-100">
            <li
              v-for="setting in notificationSettings"
              :key="setting.id"
              class="p-4 flex justify-between items-center gap-4"
            >
              <div class="min-w-0 flex-1 pr-4">
                <p class="font-semibold text-slate-800">{{ setting.label }}</p>
                <p class="text-xs text-slate-500">{{ setting.description }}</p>
              </div>
              <USwitch
                :model-value="setting.enabled"
                @update:model-value="(v: boolean) => updateSetting(setting, v)"
                color="primary"
                size="md"
              />
            </li>
          </ul>
        </div>

        <div class="text-center text-xs text-slate-400 px-4">
          <p>การเปลี่ยนแปลงการตั้งค่ามีผลทันที คุณสามารถกลับมาเปิด-ปิดการแจ้งเตือนได้ตลอดเวลา</p>
        </div>
      </div>
    </main>

    <ToastFeedback :toast="toast" />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import ToastFeedback from '~/components/ui/ToastFeedback.vue'

definePageMeta({
  title: 'ตั้งค่าการแจ้งเตือน',
  headerVariant: 'page',
  showFooter: false,
})

const notificationSettings = reactive([
  {
    id: 'bills',
    label: 'บิลและการชำระเงิน',
    description: 'แจ้งเตือนเมื่อมีบิลใหม่, ใกล้ครบกำหนด, หรือค้างชำระ',
    enabled: true,
  },
  {
    id: 'repairs',
    label: 'สถานะการแจ้งซ่อม',
    description: 'แจ้งเตือนทุกความคืบหน้าของเรื่องที่แจ้งซ่อม',
    enabled: true,
  },
  {
    id: 'parcels',
    label: 'พัสดุและจดหมาย',
    description: 'แจ้งเตือนเมื่อมีพัสดุใหม่มาถึงที่หอพัก',
    enabled: true,
  },
  {
    id: 'announcements',
    label: 'ประกาศจากที่พัก',
    description: 'รับข่าวสารและประกาศทั่วไปจากผู้จัดการหอพัก',
    enabled: true,
  },
  {
    id: 'system',
    label: 'ข่าวสารจาก PakPak',
    description: 'รับข่าวสารอัปเดตฟีเจอร์ใหม่และโปรโมชันจากเรา',
    enabled: false,
  },
])

const toast = reactive({
  show: false,
  message: '',
  type: 'loading' as 'success' | 'error' | 'loading',
})
let toastTimeout: ReturnType<typeof setTimeout>

async function updateSetting(setting: (typeof notificationSettings)[number], newValue: boolean) {
  setting.enabled = newValue

  clearTimeout(toastTimeout)
  toast.show = true
  toast.type = 'loading'
  toast.message = 'กำลังบันทึก...'

  try {
    await new Promise((resolve) => setTimeout(resolve, 1200))

    toast.type = 'success'
    toast.message = 'บันทึกแล้ว!'
  } catch (error) {
    console.error('Failed to save setting:', error)
    toast.type = 'error'
    toast.message = 'บันทึกไม่สำเร็จ'
    setting.enabled = !newValue
  } finally {
    toastTimeout = setTimeout(() => {
      toast.show = false
    }, 2000)
  }
}
</script>
