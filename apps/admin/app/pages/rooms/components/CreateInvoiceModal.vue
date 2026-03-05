<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseModal, BaseButton } from '~/components/ui'
import { BaseSelect, BaseInput, BaseDatePicker } from '~/components/form'
import dayjs from 'dayjs'

const emit = defineEmits(['success'])

// --- State ---
const isModalOpen = ref(false)
const roomData = ref<Record<string, unknown> | null>(null)
const isLoading = ref(false)

// Invoice Type
const invoiceType = ref<string>('')
const invoiceTypeOptions = [
  { label: 'ค่าเช่าแรกเข้า (Move-in)', value: 'MOVE_IN' },
  { label: 'ค่าซ่อมแซม / ปรับ (Damages/Fines)', value: 'DAMAGES' },
  { label: 'ค่าบริการอื่นๆ (Miscellaneous)', value: 'MISCELLANEOUS' },
  { label: 'ค่าเช่าประจำเดือน (Manual Monthly)', value: 'MANUAL_MONTHLY' },
]

// --- Move-in Fields ---
const moveInDate = ref<Date>(new Date())
const proratedRent = ref<number>(0)
const depositAmount = ref<number>(0)
const advanceAmount = ref<number>(0)

// --- Damages/Fines Fields ---
const damageDescription = ref<string>('')
const damageAmount = ref<number>(0)
const damageProof = ref<File | null>(null)

// --- Miscellaneous Fields ---
const miscItems = ref<Array<{ description: string; amount: number }>>([
  { description: '', amount: 0 },
])

// --- Manual Monthly Fields ---
const billingPeriod = ref<Date>(new Date())
const monthlyRent = ref<number>(0)
const electricityPrevious = ref<number>(0)
const electricityCurrent = ref<number>(0)
const waterPrevious = ref<number>(0)
const waterCurrent = ref<number>(0)

// --- Computed ---
const electricityUsage = computed(() => {
  const usage = electricityCurrent.value - electricityPrevious.value
  return usage > 0 ? usage : 0
})

const waterUsage = computed(() => {
  const usage = waterCurrent.value - waterPrevious.value
  return usage > 0 ? usage : 0
})

const electricityAmount = computed(() => {
  if (!roomData.value?.currentContract) return 0
  const rate = roomData.value.currentContract.electricityRate || 0
  const minCharge = roomData.value.currentContract.electricityMinimumCharge || 0
  const calculated = electricityUsage.value * rate
  return Math.max(calculated, minCharge)
})

const waterAmount = computed(() => {
  if (!roomData.value?.currentContract) return 0
  const rate = roomData.value.currentContract.waterRate || 0
  const minCharge = roomData.value.currentContract.waterMinimumCharge || 0
  const calculated = waterUsage.value * rate
  return Math.max(calculated, minCharge)
})

const totalAmount = computed(() => {
  switch (invoiceType.value) {
    case 'MOVE_IN':
      return proratedRent.value + depositAmount.value + advanceAmount.value
    case 'DAMAGES':
      return damageAmount.value
    case 'MISCELLANEOUS':
      return miscItems.value.reduce((sum, item) => sum + (item.amount || 0), 0)
    case 'MANUAL_MONTHLY':
      return monthlyRent.value + electricityAmount.value + waterAmount.value
    default:
      return 0
  }
})

// --- Methods ---
const calculateProratedRent = () => {
  if (!roomData.value?.currentContract?.rentAmount || !moveInDate.value) return

  const daysInMonth = dayjs(moveInDate.value).daysInMonth()
  const startDay = dayjs(moveInDate.value).date()
  const remainingDays = daysInMonth - startDay + 1
  const fullRent = roomData.value.currentContract.rentAmount

  proratedRent.value = Math.round((fullRent / daysInMonth) * remainingDays)
}

const addMiscItem = () => {
  miscItems.value.push({ description: '', amount: 0 })
}

const removeMiscItem = (index: number) => {
  miscItems.value.splice(index, 1)
}

const onSubmit = async () => {
  isLoading.value = true
  try {
    const payload: Record<string, unknown> = {
      roomId: roomData.value.id,
      type: invoiceType.value,
    }

    switch (invoiceType.value) {
      case 'MOVE_IN':
        payload.moveInDate = moveInDate.value
        payload.items = [
          { description: 'ค่าเช่าเดือนแรก (Prorated)', amount: proratedRent.value },
          { description: 'เงินประกัน', amount: depositAmount.value },
          { description: 'ค่าเช่าล่วงหน้า', amount: advanceAmount.value },
        ]
        break
      case 'DAMAGES':
        payload.items = [{ description: damageDescription.value, amount: damageAmount.value }]
        break
      case 'MISCELLANEOUS':
        payload.items = miscItems.value
        break
      case 'MANUAL_MONTHLY':
        payload.billingPeriod = billingPeriod.value
        payload.items = [
          { description: 'ค่าเช่าห้อง', amount: monthlyRent.value },
          {
            description: `ค่าไฟฟ้า (${electricityUsage.value} หน่วย)`,
            amount: electricityAmount.value,
          },
          {
            description: `ค่าน้ำประปา (${waterUsage.value} หน่วย)`,
            amount: waterAmount.value,
          },
        ]
        payload.meterReadings = {
          electricity: {
            previous: electricityPrevious.value,
            current: electricityCurrent.value,
          },
          water: {
            previous: waterPrevious.value,
            current: waterCurrent.value,
          },
        }
        break
    }

    // TODO: Call API to create invoice
    console.log('Creating invoice:', payload)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    emit('success')
    closeModal()
  } catch (error) {
    console.error('Failed to create invoice:', error)
  } finally {
    isLoading.value = false
  }
}

const open = (room: Record<string, unknown>) => {
  roomData.value = room
  resetForm()

  // Auto-fill some default values
  const currentContract = room.currentContract as Record<string, unknown> | undefined
  if (currentContract) {
    depositAmount.value = (currentContract.depositAmount as number) || 0
    advanceAmount.value = (currentContract.advancePayment as number) || 0
    monthlyRent.value = (currentContract.rentAmount as number) || 0
  }

  const lastMeterReading = room.lastMeterReading as
    | { electricity?: { value?: number }; water?: { value?: number } }
    | undefined
  if (lastMeterReading) {
    electricityPrevious.value = lastMeterReading.electricity?.value || 0
    waterPrevious.value = lastMeterReading.water?.value || 0
  }

  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
}

const resetForm = () => {
  invoiceType.value = ''
  moveInDate.value = new Date()
  proratedRent.value = 0
  depositAmount.value = 0
  advanceAmount.value = 0
  damageDescription.value = ''
  damageAmount.value = 0
  damageProof.value = null
  miscItems.value = [{ description: '', amount: 0 }]
  billingPeriod.value = new Date()
  monthlyRent.value = 0
  electricityPrevious.value = 0
  electricityCurrent.value = 0
  waterPrevious.value = 0
  waterCurrent.value = 0
}

defineExpose({ open })
</script>

<template>
  <BaseModal v-model="isModalOpen" max-width="2xl" :persistent="isLoading">
    <template #title> สร้างใบแจ้งหนี้ใหม่ (ห้อง {{ roomData?.roomNumber }}) </template>

    <div class="mt-4">
      <form id="invoice-form" class="space-y-6" @submit.prevent="onSubmit">
        <!-- Invoice Type Selection -->
        <BaseSelect
          v-model="invoiceType"
          label="ประเภทบิล (Invoice Type)"
          :options="invoiceTypeOptions"
          placeholder="เลือกประเภทบิล"
          required
        />

        <!-- Move-in Form -->
        <div v-if="invoiceType === 'MOVE_IN'" class="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h4 class="font-semibold text-blue-900">ค่าเช่าแรกเข้า</h4>

          <BaseDatePicker
            v-model="moveInDate"
            label="วันที่เข้าพัก"
            required
            @update:model-value="calculateProratedRent"
          />

          <BaseInput
            v-model.number="proratedRent"
            label="ค่าเช่าเดือนแรก (Prorated Rent)"
            type="number"
            placeholder="0"
            required
          />

          <BaseInput
            v-model.number="depositAmount"
            label="เงินประกัน (Deposit)"
            type="number"
            placeholder="0"
            required
          />

          <BaseInput
            v-model.number="advanceAmount"
            label="ค่าเช่าล่วงหน้า (Advance)"
            type="number"
            placeholder="0"
            required
          />
        </div>

        <!-- Damages/Fines Form -->
        <div v-if="invoiceType === 'DAMAGES'" class="space-y-4 p-4 bg-red-50 rounded-lg">
          <h4 class="font-semibold text-red-900">ค่าซ่อมแซม / ปรับ</h4>

          <BaseInput
            v-model="damageDescription"
            label="รายการ"
            placeholder="เช่น ค่าปรับทำกระจกแตก, ค่ากุญแจสำรอง"
            required
          />

          <BaseInput
            v-model.number="damageAmount"
            label="จำนวนเงิน"
            type="number"
            placeholder="0"
            required
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> หลักฐาน (Optional) </label>
            <input
              type="file"
              accept="image/*"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200"
              @change="(e) => (damageProof = (e.target as HTMLInputElement).files?.[0] || null)"
            />
          </div>
        </div>

        <!-- Miscellaneous Form -->
        <div v-if="invoiceType === 'MISCELLANEOUS'" class="space-y-4 p-4 bg-purple-50 rounded-lg">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-purple-900">ค่าบริการอื่นๆ</h4>
            <button
              type="button"
              class="text-sm text-purple-600 hover:text-purple-700 font-medium"
              @click="addMiscItem"
            >
              + เพิ่มรายการ
            </button>
          </div>

          <div v-for="(item, index) in miscItems" :key="index" class="flex gap-2 items-start">
            <div class="flex-1">
              <BaseInput
                v-model="item.description"
                :label="index === 0 ? 'รายการ' : ''"
                placeholder="เช่น ล้างแอร์, ซื้อน้ำแพ็ค"
                required
              />
            </div>
            <div class="w-32">
              <BaseInput
                v-model.number="item.amount"
                :label="index === 0 ? 'จำนวนเงิน' : ''"
                type="number"
                placeholder="0"
                required
              />
            </div>
            <button
              v-if="miscItems.length > 1"
              type="button"
              :class="['mt-7 text-red-500 hover:text-red-700']"
              @click="removeMiscItem(index)"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Manual Monthly Form -->
        <div v-if="invoiceType === 'MANUAL_MONTHLY'" class="space-y-4 p-4 bg-green-50 rounded-lg">
          <h4 class="font-semibold text-green-900">ค่าเช่าประจำเดือน</h4>

          <BaseDatePicker v-model="billingPeriod" label="รอบบิล (เดือน)" mode="month" required />

          <BaseInput
            v-model.number="monthlyRent"
            label="ค่าเช่าห้อง"
            type="number"
            placeholder="0"
            required
          />

          <div class="grid grid-cols-3 gap-3 pt-2">
            <div class="col-span-3 font-medium text-yellow-700">มิเตอร์ไฟฟ้า</div>
            <BaseInput
              v-model.number="electricityPrevious"
              label="ครั้งก่อน"
              type="number"
              placeholder="0"
              required
            />
            <BaseInput
              v-model.number="electricityCurrent"
              label="ครั้งนี้"
              type="number"
              placeholder="0"
              required
            />
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">หน่วยที่ใช้</label>
              <div class="px-3 py-2 bg-yellow-100 rounded text-yellow-900 font-mono text-center">
                {{ electricityUsage }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 pt-2">
            <div class="col-span-3 font-medium text-blue-700">มิเตอร์น้ำ</div>
            <BaseInput
              v-model.number="waterPrevious"
              label="ครั้งก่อน"
              type="number"
              placeholder="0"
              required
            />
            <BaseInput
              v-model.number="waterCurrent"
              label="ครั้งนี้"
              type="number"
              placeholder="0"
              required
            />
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">หน่วยที่ใช้</label>
              <div class="px-3 py-2 bg-blue-100 rounded text-blue-900 font-mono text-center">
                {{ waterUsage }}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <template #footer>
      <div class="w-full">
        <div class="mb-4 p-3 bg-gray-100 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-700">ยอดรวมสุทธิ:</span>
            <span class="text-2xl font-bold text-blue-600">
              {{ totalAmount.toLocaleString() }} บาท
            </span>
          </div>
        </div>
        <div class="flex justify-end gap-x-3">
          <BaseButton variant="secondary" :disabled="isLoading" @click="closeModal">
            ยกเลิก
          </BaseButton>
          <BaseButton
            type="submit"
            form="invoice-form"
            :loading="isLoading"
            :disabled="!invoiceType"
          >
            สร้างและส่งบิล
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
