<template>
  <div class="bg-slate-50">
    <main class="max-w-3xl mx-auto py-8 px-4 space-y-10">
      <section
        class="text-center bg-gradient-to-b from-white to-slate-100 rounded-3xl p-8 shadow-sm border border-slate-200/80"
      >
        <div class="inline-block p-4 bg-indigo-100 rounded-full">
          <UIcon name="i-lucide-headphones" class="text-4xl text-indigo-600" />
        </div>

        <h1 class="text-3xl font-bold text-slate-900 mt-4">เราพร้อมช่วยเหลือ</h1>
        <p class="text-base text-slate-500 mt-2 max-w-md mx-auto">
          มีข้อสงสัยเกี่ยวกับการใช้งานหรือการชำระเงิน? ค้นหาคำตอบได้ที่นี่
        </p>
      </section>

      <section class="space-y-4">
        <div class="text-center">
          <h2 class="text-xl font-bold text-slate-800">คำถามที่พบบ่อย</h2>
          <div class="mt-2 w-20 h-1 bg-indigo-200 mx-auto rounded-full" />
        </div>

        <div class="space-y-3 pt-4">
          <UCollapsible
            v-for="(faq, index) in faqs"
            :key="index"
            class="group bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80"
          >
            <UButton
              color="neutral"
              variant="ghost"
              class="w-full flex justify-between items-center text-left gap-4 font-semibold text-slate-800"
              :ui="{
                trailingIcon:
                  'transition-transform duration-300 group-data-[state=open]:rotate-180 flex-shrink-0',
              }"
              trailing-icon="i-lucide-chevron-down"
            >
              <span class="flex-1">{{ faq.question }}</span>
            </UButton>
            <template #content>
              <div
                class="overflow-hidden pt-3 mt-3 border-t border-slate-100 text-sm text-slate-600 leading-relaxed"
              >
                {{ faq.answer }}
              </div>
            </template>
          </UCollapsible>
        </div>
      </section>

      <section>
        <div class="p-5 bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <h2 class="text-lg font-bold text-slate-800 text-center">
            คุณต้องการความช่วยเหลือเรื่องอะไร?
          </h2>
          <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <NuxtLink to="/my-rooms" class="triage-card">
              <UIcon name="i-lucide-home" class="triage-icon text-green-600 bg-green-100" />
              <div class="text-left">
                <p class="font-bold text-slate-700">ปัญหาเกี่ยวกับที่พัก</p>
                <p class="text-xs text-slate-500">แจ้งซ่อม, สอบถามเรื่องบิล, พัสดุ</p>
              </div>
              <UIcon name="i-lucide-chevron-right" class="triage-chevron" />
            </NuxtLink>

            <button type="button" class="triage-card" @click="revealContactSection">
              <UIcon name="i-lucide-laptop" class="triage-icon text-indigo-600 bg-indigo-100" />
              <div class="text-left">
                <p class="font-bold text-slate-700">ปัญหาการใช้งานแอป</p>
                <p class="text-xs text-slate-500">รายงานบั๊ก, ข้อเสนอแนะ</p>
              </div>
              <UIcon name="i-lucide-chevron-right" class="triage-chevron" />
            </button>
          </div>
        </div>
      </section>

      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
      >
        <section v-if="showPakpakContact" ref="contactSection" class="text-center pt-2">
          <h2 class="text-xl font-bold text-slate-800">ติดต่อทีมงาน PakPak</h2>
          <p class="text-slate-500 mt-1">เราจะตอบกลับโดยเร็วที่สุด</p>
          <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <a
              :href="`https://line.me/R/ti/p/${contact.lineOA}`"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-button bg-green-500 text-white"
            >
              <UIcon name="i-simple-icons-line" class="text-xl" />
              <span>แชทผ่าน LINE</span>
            </a>
            <a :href="`mailto:${contact.email}`" class="contact-button bg-slate-600 text-white">
              <UIcon name="i-lucide-mail" class="text-xl" />
              <span>ส่งอีเมล</span>
            </a>
          </div>
        </section>
      </transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showPakpakContact = ref(false)

definePageMeta({
  title: 'ศูนย์ช่วยเหลือ',
  headerVariant: 'page',
})

const contactSection = ref<HTMLElement | null>(null)
const revealContactSection = async () => {
  showPakpakContact.value = true
  await nextTick()
  contactSection.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const faqs = ref([
  {
    question: 'ฉันจะเพิ่ม/ลบบัตรเครดิตได้อย่างไร?',
    answer:
      'คุณสามารถจัดการบัตรเครดิตได้ที่หน้า "การชำระเงิน" จากเมนู "เพิ่มเติม" ซึ่งคุณสามารถเพิ่มหรือลบข้อมูลบัตรที่บันทึกไว้ได้อย่างปลอดภัย',
  },
  {
    question: 'หากจ่ายเงินแล้ว แต่สถานะไม่เปลี่ยน?',
    answer:
      'โดยปกติสถานะจะอัปเดตทันที หากเกิน 15 นาทีแล้วยังไม่เปลี่ยนแปลง กรุณาติดต่อเราพร้อมแสดงหลักฐานการชำระเงินเพื่อให้ทีมงานตรวจสอบโดยเร็วที่สุด',
  },
  {
    question: 'ฉันสามารถมีหลายห้องในบัญชีเดียวได้หรือไม่?',
    answer: 'ได้แน่นอน! คุณสามารถเพิ่มห้องพักใหม่ได้จากหน้าแดชบอร์ด โดยกดที่ปุ่ม "เพิ่มห้อง"',
  },
  {
    question: 'การแจ้งซ่อมใช้เวลานานเท่าไหร่?',
    answer:
      'ระยะเวลาจะขึ้นอยู่กับความซับซ้อนของปัญหาและตารางงานของช่างเทคนิค โดยปกติเจ้าหน้าที่จะติดต่อกลับเพื่อประเมินและนัดหมายภายใน 24 ชั่วโมงทำการ',
  },
])

const contact = ref({
  lineOA: '@pakpak.support',
  email: 'support@pakpak.app',
  showFooter: false,
})
</script>

<style scoped>
.triage-card {
  width: 100%;
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-width: 2px;
  border-color: transparent;
  background-color: #fff;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition:
    border-color 0.2s,
    background-color 0.2s;
}
.triage-card:hover {
  border-color: #6366f1;
  background-color: #eef2ff;
}
.triage-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}
.triage-chevron {
  color: #94a3b8;
  font-size: 1.25rem;
  margin-left: auto;
}
.contact-button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: bold;
  transition: all 0.2s;
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.08);
}
.contact-button:active {
  transform: scale(0.95);
}
.contact-button:hover {
  box-shadow: 0 4px 16px 0 rgb(0 0 0 / 0.12);
  transform: translateY(-2px);
}
</style>
