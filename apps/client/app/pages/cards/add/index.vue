<template>
  <div class="bg-slate-50">
    <main class="p-4 max-w-md mx-auto">
      <div
        class="w-full h-48 sm:h-52 rounded-2xl p-6 flex flex-col justify-between shadow-lg text-white transition-all duration-500 border border-grey/10"
        :class="cardPreviewBackground"
      >
        <div class="flex justify-between items-center">
          <Icon name="solar:sim-card-minimalistic-bold-duotone" class="text-4xl opacity-70" />
          <transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform scale-50 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
          >
            <Icon
              v-if="cardBrandLogo !== 'ph:credit-card-fill'"
              :name="cardBrandLogo"
              class="text-4xl"
            />
          </transition>
        </div>
        <div>
          <p class="text-xl sm:text-2xl font-mono tracking-widest mb-2">
            {{ formattedCardNumber }}
          </p>
          <div class="flex justify-between text-xs font-semibold uppercase">
            <span class="truncate pr-4">{{ formData.nameOnCard || 'NAME ON CARD' }}</span>
            <span>{{ formData.expiryDate || 'MM/YY' }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-4 mt-3">
        <div class="flex items-center justify-center gap-2 py-3 bg-slate-100 rounded-lg">
          <p class="text-xs font-semibold text-slate-500 mr-2">รองรับ:</p>
          <Icon name="logos:visa" class="text-2xl" />
          <Icon name="logos:mastercard" class="text-2xl" />
          <Icon name="logos:jcb" class="text-2xl" />
          <Icon name="logos:amex" class="text-2xl" />
          <Icon name="logos:unionpay" class="text-2xl" />
        </div>

        <div>
          <label for="cardNumber" class="form-label">หมายเลขบัตร</label>
          <input
            type="tel"
            id="cardNumber"
            v-model="formData.cardNumber"
            @input="formatCardNumber"
            maxlength="19"
            placeholder="0000 0000 0000 0000"
            class="form-input font-mono"
            autocomplete="off"
          />
        </div>

        <div>
          <label for="nameOnCard" class="form-label">ชื่อบนบัตร</label>
          <input
            type="text"
            id="nameOnCard"
            v-model="formData.nameOnCard"
            placeholder="JOHN DOE"
            class="form-input uppercase"
            autocomplete="off"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="expiryDate" class="form-label">วันหมดอายุ</label>
            <input
              type="tel"
              id="expiryDate"
              v-model="formData.expiryDate"
              @input="formatExpiryDate"
              maxlength="5"
              placeholder="MM/YY"
              class="form-input font-mono"
              autocomplete="off"
            />
          </div>

          <div>
            <label for="cvv" class="form-label flex items-center gap-1">
              <span>CVV</span>
              <UPopover
                :content="{ side: 'top', align: 'center' }"
                :ui="{
                  content: 'w-64 p-0 overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5',
                }"
              >
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-help-circle"
                  class="text-slate-400 hover:text-indigo-600 cursor-help p-1"
                  aria-label="คำอธิบาย CVV"
                />
                <template #content>
                  <div class="bg-slate-800 p-3 text-white">
                    <p class="text-sm font-semibold mb-2">รหัส CVV คืออะไร?</p>
                    <p class="text-xs opacity-90">
                      คือรหัสความปลอดภัย 3-4 หลัก ซึ่งมักจะอยู่ด้านหลังของบัตรเครดิต
                    </p>
                  </div>
                </template>
              </UPopover>
            </label>
            <input
              type="tel"
              id="cvv"
              v-model="formData.cvv"
              maxlength="4"
              placeholder="123"
              autocomplete="off"
              class="form-input font-mono"
            />
          </div>
        </div>
      </div>

      <div class="pt-4">
        <button
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 active:scale-95"
        >
          <Icon v-if="isSubmitting" name="ph:spinner-duotone" class="animate-spin h-5 w-5" />
          <span>{{ isSubmitting ? 'กำลังตรวจสอบ...' : 'เพิ่มบัตรด้วยตนเอง' }}</span>
        </button>
      </div>

      <div class="flex items-center justify-center pt-4 space-x-2 text-sm text-slate-400">
        <UIcon name="i-lucide-lock" class="size-4" />
        <span>Secured by Omise</span>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
definePageMeta({
  title: 'เพิ่มบัตรใหม่',
  headerVariant: 'page',
})

const formData = reactive({
  cardNumber: '',
  nameOnCard: '',
  expiryDate: '',
  cvv: '',
})

const detectedBrand = ref('default')
const isSubmitting = ref(false)
const showBrowserPayButton = ref(false) // State สำหรับควบคุมปุ่ม Payment Request API

// --- ✨ LOGIC ใหม่สำหรับ PAYMENT REQUEST API ✨ ---
onMounted(() => {
  // onMounted จะทำงานที่ฝั่ง Client เท่านั้น ทำให้เราสามารถเช็ค object `window` ได้
  // ในการใช้งานจริง เราจะใช้ Omise.js เพื่อเช็คอย่างละเอียด
  // แต่ตอนนี้ เราจะจำลองโดยการเช็คว่า `window.PaymentRequest` มีอยู่หรือไม่
  if (window.PaymentRequest) {
    // สมมติว่าถ้ามี API นี้ แสดงว่าเบราว์เซอร์อาจจะรองรับ
    showBrowserPayButton.value = true
    console.log('Browser supports Payment Request API.')
  } else {
    console.log('Browser does not support Payment Request API.')
  }
})

function triggerBrowserPayment() {
  console.log("Triggering Browser's Native Payment UI...")
  // ที่จุดนี้ คุณจะเรียกใช้ฟังก์ชันของ Omise.js เพื่อเปิด Pop-up
  // เช่น Omise.openPaymentRequest({ ... });
  alert('จำลองการเปิด Pop-up ของเบราว์เซอร์เพื่อจ่ายเงิน')
}

// --- ส่วนที่เหลือคือโค้ดเดิมทั้งหมด ไม่มีการเปลี่ยนแปลง ---
// --- Computed Properties for Interactive Card ---
const formattedCardNumber = computed(() => {
  const value = formData.cardNumber.replace(/\s/g, '')
  const groups = value.match(/.{1,4}/g) || []
  return groups.join(' ').padEnd(19, '•')
})

const cardBrandLogo = computed(() => {
  switch (detectedBrand.value) {
    case 'visa':
      return 'logos:visa'
    case 'mastercard':
      return 'logos:mastercard'
    case 'jcb':
      return 'logos:jcb'
    case 'amex':
      return 'logos:amex'
    case 'unionpay':
      return 'logos:unionpay'
    default:
      return 'ph:credit-card-fill'
  }
})

const cardPreviewBackground = computed(() => {
  switch (detectedBrand.value) {
    case 'visa':
      return 'bg-gradient-to-br from-blue-700 to-sky-500'
    case 'mastercard':
      return 'bg-gradient-to-br from-slate-700 to-orange-600'
    case 'jcb':
      return 'bg-gradient-to-br from-green-600 to-emerald-400'
    case 'amex':
      return 'bg-gradient-to-br from-cyan-600 to-blue-400'
    case 'unionpay':
      return 'bg-gradient-to-br from-blue-600 via-red-500 to-green-400'
    default:
      return 'bg-gradient-to-br from-slate-600 to-slate-800'
  }
})

// --- Watchers for Input Formatting and Detection ---
watch(
  () => formData.cardNumber,
  (newValue) => {
    const digits = newValue.replace(/\D/g, '')
    if (digits.startsWith('4')) detectedBrand.value = 'visa'
    else if (/^5[1-5]/.test(digits)) detectedBrand.value = 'mastercard'
    else if (/^35/.test(digits)) detectedBrand.value = 'jcb'
    else if (/^3[47]/.test(digits)) detectedBrand.value = 'amex'
    else if (/^62/.test(digits)) detectedBrand.value = 'unionpay'
    else detectedBrand.value = 'default'
  },
)

const formatCardNumber = (e: Event) => {
  let value = (e.target as HTMLInputElement).value.replace(/\s/g, '').replace(/\D/g, '')
  formData.cardNumber = (value.match(/.{1,4}/g) || []).join(' ')
}

const formatExpiryDate = (e: Event) => {
  let value = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  if (value.length > 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4)
  }
  formData.expiryDate = value
}

const handleSubmit = () => {
  isSubmitting.value = true
  console.log('Submitting custom form. Data to be tokenized:', formData)
  // --- OMISE.JS TOKENIZATION LOGIC GOES HERE ---
  setTimeout(() => {
    isSubmitting.value = false
    alert('จำลองการเพิ่มบัตรสำเร็จ! (ดู Token ใน Console)')
  }, 2000)
}
</script>

<style scoped>
.form-label {
  display: block;
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  color: #475569; /* text-slate-600 */
  margin-bottom: 0.25rem; /* mb-1 */
}
.form-input {
  width: 100%;
  background-color: #fff; /* bg-white */
  border: 1px solid #cbd5e1; /* border-slate-300 */
  border-radius: 0.5rem; /* rounded-lg */
  padding: 0.75rem; /* p-3 */
  color: #1e293b; /* text-slate-800 */
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.form-input:focus {
  border-color: #6366f1; /* focus:border-indigo-500 */
  box-shadow: 0 0 0 2px #c7d2fe; /* focus:ring-2 focus:ring-indigo-200 */
  outline: none;
}
</style>
