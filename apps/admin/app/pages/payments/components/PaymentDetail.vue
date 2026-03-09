<script setup>
import { ref, watch, computed } from 'vue'
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowsPointingOutIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/solid'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import SlipViewerModal from './SlipViewerModal.vue'
import { useFormatters } from '~/composables/useFormatters'
import dayjs from 'dayjs'

const props = defineProps({
  payment: { type: Object, default: null },
})
const emit = defineEmits(['action', 'back'])
const { currency, fullDateTime, shortDate } = useFormatters()
const slipViewerModal = ref(null)
const isImageLoading = ref(true)
const showConfirmModal = ref(false)

watch(
  () => props.payment,
  () => {
    isImageLoading.value = true
  },
  { deep: true },
)

const onImageLoad = () => {
  isImageLoading.value = false
}

const handleAction = (action) => {
  emit('action', { paymentId: props.payment.id, action: action })
}

// ✨ Show confirmation modal for approve action
const handleApprove = () => {
  showConfirmModal.value = true
}

const confirmApprove = () => {
  showConfirmModal.value = false
  handleAction('approve')
}

const cancelApprove = () => {
  showConfirmModal.value = false
}

// ✨ Mock slip image URL - ใช้รูปตัวอย่างสำหรับ demo
const mockSlipUrl = computed(() => {
  // ใช้รูป placeholder หรือรูปตัวอย่างสลิปโอนเงิน
  return props.payment?.slipUrl || 'https://placehold.co/600x800/1e293b/white?text=Payment+Slip'
})

const openSlipViewer = () => {
  slipViewerModal.value?.open(mockSlipUrl.value)
}

// ✨ NEW: Computed property to check for payment discrepancies
const paymentDifference = computed(() => {
  if (!props.payment || !props.payment.invoice) return { amount: 0, type: 'none' }
  const diff = Number(props.payment.amount) - Number(props.payment.invoice.totalAmount)
  if (diff > 0) return { amount: diff, type: 'over' }
  if (diff < 0) return { amount: Math.abs(diff), type: 'under' }
  return { amount: 0, type: 'exact' }
})
</script>

<template>
  <div class="flex-1 bg-slate-50 relative">
    <div
      v-if="!payment"
      class="h-full flex items-center justify-center text-center text-gray-500 p-8"
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="mx-auto h-12 w-12 text-gray-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-gray-900">เลือกรายการเพื่อตรวจสอบ</h3>
        <p class="mt-1 text-sm text-gray-500">เลือกรายการชำระเงินจากทางซ้ายเพื่อดูรายละเอียดสลิป</p>
      </div>
    </div>

    <div v-else class="h-full flex flex-col">
      <div class="flex-1 overflow-y-auto pb-24 md:pb-24 md:p-6 lg:p-8">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-0 md:gap-8">
          <!-- Payment Slip Image - Full width on mobile -->
          <div
            class="lg:col-span-3 bg-black/80 md:rounded-xl flex items-center justify-center p-4 md:p-4 min-h-[50vh] md:min-h-0"
          >
            <div class="relative group cursor-pointer w-full" @click="openSlipViewer">
              <div
                v-if="isImageLoading"
                class="aspect-[3/4] w-full bg-slate-700 rounded-lg animate-pulse"
              />
              <img
                :src="mockSlipUrl"
                :class="isImageLoading ? 'opacity-0' : 'opacity-100'"
                alt="Payment Slip"
                class="object-contain rounded-md w-full h-auto max-h-[calc(100vh-12rem)] transition-opacity"
                @load="onImageLoad"
              />
              <div
                class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowsPointingOutIcon class="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          <!-- Payment Details - Full width on mobile -->
          <div class="lg:col-span-2 p-4 md:p-0">
            <h2 class="text-base md:text-lg font-semibold text-slate-900 hidden md:block">
              รายละเอียดประกอบการตรวจสอบ
            </h2>
            <div
              class="md:mt-4 bg-white p-4 md:p-5 rounded-xl md:shadow-sm md:ring-1 md:ring-slate-900/5 space-y-3 md:space-y-4"
            >
              <div class="text-center">
                <p class="text-xs md:text-sm text-slate-500">ยอดชำระตามใบแจ้งหนี้</p>
                <p class="text-xl md:text-2xl font-bold text-slate-800">
                  {{ currency(payment.invoice.totalAmount) }}
                </p>
                <hr class="my-2" />
                <p class="text-xs md:text-sm text-slate-500">ยอดที่โอนจริงตามสลิป</p>
                <p class="text-2xl md:text-3xl font-bold text-blue-600">
                  {{ currency(payment.amount) }}
                </p>
              </div>

              <div
                v-if="paymentDifference.type !== 'exact'"
                class="p-3 rounded-lg flex items-start gap-3"
                :class="
                  paymentDifference.type === 'over'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                "
              >
                <ExclamationTriangleIcon
                  class="h-5 w-5 flex-shrink-0 mt-0.5"
                  :class="paymentDifference.type === 'over' ? 'text-green-500' : 'text-red-500'"
                />
                <div>
                  <p class="font-semibold text-sm">
                    {{ paymentDifference.type === 'over' ? 'ชำระเกิน' : 'ชำระขาด' }}
                    <span class="font-bold">{{ currency(paymentDifference.amount) }}</span>
                  </p>
                  <p class="text-xs">
                    {{
                      paymentDifference.type === 'over'
                        ? 'ยอดเงินเกินจะถูกบันทึกเป็นเครดิต'
                        : 'โปรดติดต่อผู้เช่าเพื่อชำระส่วนที่เหลือ'
                    }}
                  </p>
                </div>
              </div>

              <div class="text-sm space-y-2 border-t pt-4">
                <div class="flex justify-between">
                  <span class="text-slate-500">รอบบิล:</span>
                  <span class="font-medium text-slate-700">{{
                    dayjs(payment.invoice.period).format('MMMM BBBB')
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">กำหนดชำระ:</span>
                  <span class="font-medium text-slate-700">{{
                    shortDate(payment.invoice.dueDate)
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">วันที่แจ้งโอน:</span>
                  <span class="font-medium text-slate-700">{{
                    fullDateTime(payment.submittedAt)
                  }}</span>
                </div>
              </div>

              <div class="border-t pt-4">
                <p class="text-sm font-semibold text-slate-600 mb-2">รายการในใบแจ้งหนี้:</p>
                <ul class="space-y-1 text-sm">
                  <li
                    v-for="item in payment.invoice.items"
                    :key="item.id"
                    class="flex justify-between"
                  >
                    <span class="text-slate-500">{{ item.description }}</span>
                    <span class="font-mono text-slate-700">{{ currency(item.amount) }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="absolute bottom-16 md:bottom-0 left-0 right-0 flex-shrink-0 bg-white/70 backdrop-blur-sm border-t border-slate-200 p-3 md:p-4"
      >
        <div class="max-w-2xl mx-auto flex justify-end gap-2 md:gap-3">
          <BaseButton
            variant="secondary"
            size="lg"
            class="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
            @click="handleAction('reject')"
          >
            <XCircleIcon class="h-5 w-5 md:mr-2" />
            <span class="sm:inline">ปฏิเสธ</span>
          </BaseButton>
          <BaseButton
            size="lg"
            class="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 focus-visible:outline-green-600"
            @click="handleApprove"
          >
            <CheckCircleIcon class="h-5 w-5 md:mr-2" />
            <span class="sm:inline">ยืนยัน</span>
          </BaseButton>
        </div>
      </div>
    </div>

    <SlipViewerModal ref="slipViewerModal" />

    <!-- ✨ Confirmation Modal for Approve Payment -->
    <BaseModal v-model="showConfirmModal" max-width="md">
      <template #title>
        <div class="flex items-center gap-2">
          <CheckCircleIcon class="h-6 w-6 text-green-600" />
          <span>ยืนยันการชำระเงิน</span>
        </div>
      </template>

      <div class="mt-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p class="text-sm text-blue-800">
            <span class="font-semibold">ห้อง:</span> {{ payment?.roomNumber }}
          </p>
          <p class="text-sm text-blue-800">
            <span class="font-semibold">ผู้เช่า:</span>
            {{ payment?.tenantName }}
          </p>
          <p class="text-sm text-blue-800">
            <span class="font-semibold">ยอดชำระ:</span>
            {{ currency(payment?.amount) }}
          </p>
        </div>

        <div
          v-if="paymentDifference.type !== 'exact'"
          class="p-3 rounded-lg mb-4"
          :class="
            paymentDifference.type === 'over'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          "
        >
          <p
            class="text-sm font-semibold"
            :class="paymentDifference.type === 'over' ? 'text-green-800' : 'text-red-800'"
          >
            {{ paymentDifference.type === 'over' ? '⚠️ ชำระเกิน' : '⚠️ ชำระขาด' }}
            {{ currency(paymentDifference.amount) }}
          </p>
          <p
            class="text-xs mt-1"
            :class="paymentDifference.type === 'over' ? 'text-green-700' : 'text-red-700'"
          >
            {{
              paymentDifference.type === 'over'
                ? 'ยอดเงินเกินจะถูกบันทึกเป็นเครดิตให้กับผู้เช่า'
                : 'โปรดติดต่อผู้เช่าเพื่อชำระส่วนที่เหลือ'
            }}
          </p>
        </div>

        <p class="text-sm text-gray-600">
          คุณต้องการยืนยันการชำระเงินนี้ใช่หรือไม่?
          <span class="block mt-2 font-semibold text-gray-900">
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </span>
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="cancelApprove"> ยกเลิก </BaseButton>
          <BaseButton class="bg-green-600 hover:bg-green-500" @click="confirmApprove">
            <CheckCircleIcon class="h-5 w-5 mr-2" />
            ยืนยันการชำระเงิน
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
