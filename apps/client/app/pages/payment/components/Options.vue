<template>
  <div class="p-4 max-w-md mx-auto space-y-4 pb-8">
    <h1 class="text-2xl font-bold text-slate-800 text-center">ช่องทางการชำระเงิน</h1>

    <div v-if="isLoading" class="bg-white rounded-xl p-4 space-y-3 border">
      <div class="h-16 bg-slate-200 rounded-lg animate-pulse"></div>
      <div class="h-16 bg-slate-200 rounded-lg animate-pulse"></div>
      <div class="h-16 bg-slate-200 rounded-lg animate-pulse"></div>
    </div>

    <div v-else class="space-y-3">
      <div v-for="method in paymentMethods" :key="method.id">
        <div
          v-if="method.id === 'credit-card'"
          class="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <button
            @click="toggleAccordion(method.id)"
            class="w-full text-left flex items-center p-4"
          >
            <Icon :name="method.icon" class="text-3xl" :class="method.iconColor" />
            <div class="ml-4 flex-grow">
              <p class="font-semibold text-slate-700">{{ method.name }}</p>
            </div>
            <Icon
              name="ph:caret-down-bold"
              class="text-slate-400 text-lg transition-transform duration-300"
              :class="openAccordion === method.id ? '-rotate-180' : ''"
            />
          </button>

          <div
            class="transition-all duration-500 ease-in-out grid"
            :class="
              openAccordion === method.id
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0'
            "
          >
            <div class="overflow-hidden">
              <div class="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                <div v-if="savedCards.length > 0" class="space-y-2">
                  <SavedCard
                    v-for="card in savedCards"
                    :key="card.id"
                    :card="card"
                    :is-active="
                      selectedPayment?.method === 'credit-card' &&
                      selectedPayment?.provider === card.id
                    "
                    @select="selectPayment('credit-card', card.id)"
                  />
                </div>

                <NuxtLink
                  to="/cards/add"
                  class="w-full flex items-center justify-center gap-1 p-3 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 font-semibold hover:bg-slate-100 hover:border-slate-400 transition"
                >
                  <Icon name="ph:plus-bold" class="text-2xl text-indigo-500" />
                  <span class="text-sm">เพิ่มบัตร</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="method.children"
          class="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <button
            @click="toggleAccordion(method.id)"
            class="w-full text-left flex items-center p-4"
          >
            <Icon :name="method.icon" class="text-3xl" :class="method.iconColor" />
            <div class="ml-4 flex-grow">
              <p class="font-semibold text-slate-700">{{ method.name }}</p>
            </div>
            <Icon
              name="ph:caret-down-bold"
              class="text-slate-400 text-lg transition-transform duration-300"
              :class="openAccordion === method.id ? '-rotate-180' : ''"
            />
          </button>
          <div
            class="transition-all duration-500 ease-in-out grid"
            :class="
              openAccordion === method.id
                ? 'max-h-[500px] opacity-100'
                : 'grid-rows-[0fr] opacity-0'
            "
          >
            <div class="overflow-hidden">
              <div class="px-4 pb-4 pt-2 border-t border-slate-100 space-y-2">
                <button
                  v-for="bank in method.children"
                  :key="bank.id"
                  @click="selectPayment(method.id, bank.id)"
                  :disabled="bankStatus[bank.omiseId] === false"
                  class="w-full flex items-center p-3 rounded-lg border transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                  :class="
                    isSelected(method.id, bank.id)
                      ? 'bg-indigo-50 border-indigo-500'
                      : 'hover:bg-slate-50 border-slate-200'
                  "
                >
                  <Icon :name="bank.logo" class="text-2xl" />
                  <div class="ml-3 font-medium text-slate-700 flex-grow">
                    <span>{{ bank.name }}</span>
                    <p
                      v-if="bankStatus[bank.omiseId] === false"
                      class="text-xs text-red-500 font-normal"
                    >
                      ปิดปรับปรุงชั่วคราว
                    </p>
                  </div>
                  <Icon
                    v-if="isSelected(method.id, bank.id)"
                    name="ph:check-circle-fill"
                    class="text-indigo-600 text-xl"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          v-else
          @click="selectPayment(method.id)"
          class="w-full text-left flex items-center p-4 bg-white rounded-xl border transition-all"
          :class="
            isSelected(method.id)
              ? 'border-indigo-500 ring-2 ring-indigo-200'
              : 'hover:bg-slate-50 border-slate-200'
          "
        >
          <Icon :name="method.icon" class="text-3xl" :class="method.iconColor" />
          <div class="ml-4 flex-grow">
            <p class="font-semibold text-slate-700">{{ method.name }}</p>
            <p v-if="method.subtitle" class="text-xs text-slate-500">
              {{ method.subtitle }}
            </p>
          </div>
          <Icon
            v-if="isSelected(method.id)"
            name="ph:check-circle-fill"
            class="text-indigo-600 text-xl"
          />
        </button>
      </div>
    </div>

    <div class="flex items-center justify-center pt-8 space-x-2 text-sm text-slate-400">
      <UIcon name="i-lucide-lock" class="size-4" />
      <span>Secure Payments Powered by</span>
      <Icon name="simple-icons:omise" class="text-slate-600 text-lg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SavedCard from './SavedCard.vue'

const emit = defineEmits(['select'])

// --- STATE MANAGEMENT ---
const openAccordion = ref<string | null>('credit-card')
const selectedPayment = ref<{ method: string; provider: string | null } | null>(null)
const bankStatus = ref<Record<string, boolean>>({})
const isLoading = ref(true)
const savedCards = ref<any[]>([])

// --- DATA ---
const paymentMethods = ref([
  {
    id: 'credit-card',
    name: 'บัตรเครดิต / เดบิต',
    icon: 'ph:credit-card-duotone',
    iconColor: 'text-indigo-500',
  },
  {
    id: 'promptpay',
    name: 'QR พร้อมเพย์',
    subtitle: 'สแกนจ่ายผ่านแอปธนาคาร',
    icon: 'ph:qr-code-duotone',
    iconColor: 'text-cyan-600',
  },
  {
    id: 'mobile-banking',
    name: 'จ่ายผ่านแอปธนาคารโดยตรง',
    icon: 'ph:device-mobile-speaker-duotone',
    iconColor: 'text-emerald-500',
    children: [
      {
        id: 'kbank',
        name: 'K Plus',
        logo: 'cib:kakaotalk',
        omiseId: 'internet_banking_kbank',
      },
      {
        id: 'scb',
        name: 'SCB Easy',
        logo: 'ph:bank-duotone',
        omiseId: 'internet_banking_scb',
      },
      {
        id: 'ktb',
        name: 'Krungthai NEXT',
        logo: 'ph:bird-duotone',
        omiseId: 'internet_banking_ktb',
      },
    ],
  },
  {
    id: 'truemoney',
    name: 'TrueMoney Wallet',
    icon: 'simple-icons:truemoney',
    iconColor: 'text-orange-500',
  },
])

// --- LIFECYCLE HOOK ---
onMounted(() => {
  // จำลองการดึงข้อมูลพร้อมกัน
  Promise.all([fetchBankStatus(), fetchSavedCards()]).finally(() => {
    isLoading.value = false
  })
})

// --- ASYNC FUNCTIONS (mock: no client server route for payment-status) ---
async function fetchBankStatus() {
  // Placeholder: all banks enabled. Replace with admin API when backend provides status.
  bankStatus.value = {} as Record<string, boolean>
}

async function fetchSavedCards() {
  // จำลองการดึงข้อมูลบัตร
  await new Promise((resolve) => setTimeout(resolve, 800))
  const cardsFromApi = [
    {
      id: 'card_test_1',
      brand: 'Visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2028,
    },
    {
      id: 'card_test_2',
      brand: 'Mastercard',
      last4: '5555',
      exp_month: 8,
      exp_year: 2026,
    },
    {
      id: 'card_test_3',
      brand: 'JCB',
      last4: '5555',
      exp_month: 9,
      exp_year: 2026,
    },
  ]
  savedCards.value = cardsFromApi

  // เลือกบัตรใบแรกเป็นค่าเริ่มต้นถ้ามี
  if (cardsFromApi.length > 0) {
    selectPayment('credit-card', cardsFromApi[0].id)
  }
}

// --- HELPER FUNCTIONS ---
const toggleAccordion = (id: string) => {
  openAccordion.value = openAccordion.value === id ? null : id
}

const selectPayment = (methodId: string, providerId: string | null = null) => {
  if (methodId === 'mobile-banking' && providerId) {
    const bank = paymentMethods.value
      .find((m) => m.id === 'mobile-banking')
      ?.children.find((b) => b.id === providerId)
    if (bank && bankStatus.value[bank.omiseId] === false) return
  }
  const selection = { method: methodId, provider: providerId }
  selectedPayment.value = selection
  emit('select', selection)
}

const isSelected = (methodId: string, providerId: string | null = null) => {
  if (!selectedPayment.value) return false
  return selectedPayment.value.method === methodId && selectedPayment.value.provider === providerId
}
</script>

<style scoped>
.grid-rows-\[0fr\] {
  grid-template-rows: 0fr;
}
.grid-rows-\[1fr\] {
  grid-template-rows: 1fr;
}
</style>
