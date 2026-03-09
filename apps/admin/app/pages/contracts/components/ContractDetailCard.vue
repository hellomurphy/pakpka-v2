<script setup>
import { ref, reactive, watch } from 'vue'
import { useFormatters } from '~/composables/useFormatters'
import { useContractsStore } from '~/store/contractsStore'
import BaseButton from '~/components/ui/BaseButton.vue'
import { BaseDatePicker, CurrencyInput, BaseSelect } from '~/components/form'
import {
  CheckIcon,
  PencilSquareIcon,
  SunIcon,
  CloudIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  contract: { type: Object, required: true },
})
const emit = defineEmits(['success'])

const { currency, fullDate } = useFormatters()
const contractsStore = useContractsStore()

const editingField = ref(null)
// สร้าง "ร่าง" ของ contract ขึ้นมาใน component เพื่อให้แก้ไขได้โดยไม่กระทบ prop โดยตรง
const editableContract = reactive({})

// เมื่อ prop contract เริ่มต้นหรือเปลี่ยนแปลง, ให้อัปเดต "ร่าง" ของเรา
watch(
  () => props.contract,
  (newContract) => {
    if (newContract) {
      Object.assign(editableContract, JSON.parse(JSON.stringify(newContract)))
    }
  },
  { immediate: true, deep: true },
)

const startEditing = (field) => {
  editingField.value = field
}

const saveField = async (field) => {
  editingField.value = null // ปิดโหมดแก้ไข

  // สร้าง object ข้อมูลที่จะส่งไปอัปเดต
  let payload = {}
  if (field === 'water') {
    payload = {
      waterBillingType: editableContract.waterBillingType,
      waterRate: editableContract.waterRate,
      waterMinimumCharge: editableContract.waterMinimumCharge,
    }
  } else if (field === 'electricity') {
    payload = {
      electricityBillingType: editableContract.electricityBillingType,
      electricityRate: editableContract.electricityRate,
      electricityMinimumCharge: editableContract.electricityMinimumCharge,
    }
  } else {
    payload = { [field]: editableContract[field] }
  }

  const response = await contractsStore.updateContract(props.contract.id, payload)
  if (response.success) {
    emit('success') // แจ้งให้หน้าแม่ refresh ข้อมูลทั้งหมด
  } else {
    // ถ้าล้มเหลว, rollback การเปลี่ยนแปลงใน UI กลับไปเป็นข้อมูลเดิม
    Object.assign(editableContract, JSON.parse(JSON.stringify(props.contract)))
  }
}

const cancelEdit = (field) => {
  // Rollback changes for the specific field
  if (field === 'water') {
    editableContract.waterBillingType = props.contract.waterBillingType
    editableContract.waterRate = props.contract.waterRate
    editableContract.waterMinimumCharge = props.contract.waterMinimumCharge
  } else if (field === 'electricity') {
    editableContract.electricityBillingType = props.contract.electricityBillingType
    editableContract.electricityRate = props.contract.electricityRate
    editableContract.electricityMinimumCharge = props.contract.electricityMinimumCharge
  } else {
    editableContract[field] = props.contract[field]
  }
  editingField.value = null
}
</script>

<template>
  <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-base font-semibold leading-7 text-gray-900">ข้อมูลสัญญาหลัก</h3>
      <p class="mt-1 text-sm text-gray-500">
        รายละเอียดทางการเงิน, ระยะเวลา, และค่าสาธารณูปโภคของสัญญา
      </p>
    </div>
    <div v-if="contract" class="border-t border-gray-200">
      <dl class="divide-y divide-gray-100">
        <div class="p-4 sm:p-6 grid grid-cols-3 gap-4 items-center">
          <dt class="text-sm font-medium text-gray-600">ค่าเช่า</dt>
          <dd class="col-span-2">
            <div v-if="editingField !== 'rentAmount'" class="flex justify-between items-center">
              <span class="text-sm text-gray-900 font-semibold"
                >{{ currency(contract.rentAmount) }} / เดือน</span
              >
              <button
                class="p-1 rounded-full text-blue-600 hover:bg-gray-100"
                @click="startEditing('rentAmount')"
              >
                <PencilSquareIcon class="h-4 w-4" />
              </button>
            </div>
            <div v-else class="flex items-center gap-2">
              <CurrencyInput v-model="editableContract.rentAmount" />
              <BaseButton
                variant="secondary"
                size="sm"
                class="!p-2"
                @click="cancelEdit('rentAmount')"
              >
                <XMarkIcon class="h-4 w-4" />
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="sm"
                class="!p-2"
                @click="saveField('rentAmount')"
              >
                <CheckIcon class="h-4 w-4" />
              </BaseButton>
            </div>
          </dd>
        </div>

        <div class="p-4 sm:p-6 grid grid-cols-3 gap-4 items-center">
          <dt class="text-sm font-medium text-gray-600">วันสิ้นสุดสัญญา</dt>
          <dd class="col-span-2">
            <div v-if="editingField !== 'endDate'" class="flex justify-between items-center">
              <span class="text-sm text-gray-900">{{ fullDate(contract.endDate) }}</span>
              <button
                class="p-1 rounded-full text-blue-600 hover:bg-gray-100"
                @click="startEditing('endDate')"
              >
                <PencilSquareIcon class="h-4 w-4" />
              </button>
            </div>
            <div v-else class="flex items-center gap-2">
              <BaseDatePicker v-model="editableContract.endDate" />
              <BaseButton variant="secondary" size="sm" class="!p-2" @click="cancelEdit('endDate')">
                <XMarkIcon class="h-4 w-4" />
              </BaseButton>
              <BaseButton variant="secondary" size="sm" class="!p-2" @click="saveField('endDate')">
                <CheckIcon class="h-4 w-4" />
              </BaseButton>
            </div>
          </dd>
        </div>

        <div class="p-4 sm:p-6 grid grid-cols-3 gap-4 items-start">
          <dt class="text-sm font-medium text-gray-600 flex items-center gap-1.5 pt-2">
            <CloudIcon class="h-5 w-5 text-sky-600" />ค่าน้ำ
          </dt>
          <dd class="col-span-2">
            <div v-if="editingField !== 'water'" class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-900">
                  {{ contract.waterBillingType === 'FLAT_RATE' ? 'เหมาจ่าย' : 'ตามหน่วย' }}
                  ({{ currency(contract.waterRate) }}/{{
                    contract.waterBillingType === 'PER_UNIT' ? 'หน่วย' : 'เดือน'
                  }})
                </p>
                <p
                  v-if="contract.waterBillingType === 'PER_UNIT' && contract.waterMinimumCharge > 0"
                  class="text-xs text-gray-500"
                >
                  ขั้นต่ำ {{ currency(contract.waterMinimumCharge) }}
                </p>
              </div>
              <button
                class="p-1 rounded-full text-blue-600 hover:bg-gray-100"
                @click="startEditing('water')"
              >
                <PencilSquareIcon class="h-4 w-4" />
              </button>
            </div>
            <div v-else class="space-y-2">
              <BaseSelect
                v-model="editableContract.waterBillingType"
                :options="[
                  { value: 'PER_UNIT', label: 'ตามหน่วย' },
                  { value: 'FLAT_RATE', label: 'เหมาจ่าย' },
                ]"
              />
              <div class="flex items-center gap-2">
                <CurrencyInput v-model="editableContract.waterRate" placeholder="ราคา" />
                <CurrencyInput
                  v-if="editableContract.waterBillingType === 'PER_UNIT'"
                  v-model="editableContract.waterMinimumCharge"
                  placeholder="ขั้นต่ำ"
                />
                <BaseButton variant="secondary" size="sm" class="!p-2" @click="cancelEdit('water')">
                  <XMarkIcon class="h-4 w-4" />
                </BaseButton>
                <BaseButton variant="secondary" size="sm" class="!p-2" @click="saveField('water')">
                  <CheckIcon class="h-4 w-4" />
                </BaseButton>
              </div>
            </div>
          </dd>
        </div>

        <div class="p-4 sm:p-6 grid grid-cols-3 gap-4 items-start">
          <dt class="text-sm font-medium text-gray-600 flex items-center gap-1.5 pt-2">
            <SunIcon class="h-5 w-5 text-amber-500" />ค่าไฟ
          </dt>
          <dd class="col-span-2">
            <div v-if="editingField !== 'electricity'" class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-900">
                  {{ contract.electricityBillingType === 'FLAT_RATE' ? 'เหมาจ่าย' : 'ตามหน่วย' }}
                  ({{ currency(contract.electricityRate) }}/{{
                    contract.electricityBillingType === 'PER_UNIT' ? 'หน่วย' : 'เดือน'
                  }})
                </p>
                <p
                  v-if="
                    contract.electricityBillingType === 'PER_UNIT' &&
                    contract.electricityMinimumCharge > 0
                  "
                  class="text-xs text-gray-500"
                >
                  ขั้นต่ำ {{ currency(contract.electricityMinimumCharge) }}
                </p>
              </div>
              <button
                class="p-1 rounded-full text-blue-600 hover:bg-gray-100"
                @click="startEditing('electricity')"
              >
                <PencilSquareIcon class="h-4 w-4" />
              </button>
            </div>
            <div v-else class="space-y-2">
              <BaseSelect
                v-model="editableContract.electricityBillingType"
                :options="[
                  { value: 'PER_UNIT', label: 'ตามหน่วย' },
                  { value: 'FLAT_RATE', label: 'เหมาจ่าย' },
                ]"
              />
              <div class="flex items-center gap-2">
                <CurrencyInput v-model="editableContract.electricityRate" placeholder="ราคา" />
                <CurrencyInput
                  v-if="editableContract.electricityBillingType === 'PER_UNIT'"
                  v-model="editableContract.electricityMinimumCharge"
                  placeholder="ขั้นต่ำ"
                />
                <BaseButton
                  variant="secondary"
                  size="sm"
                  class="!p-2"
                  @click="cancelEdit('electricity')"
                >
                  <XMarkIcon class="h-4 w-4" />
                </BaseButton>
                <BaseButton
                  variant="secondary"
                  size="sm"
                  class="!p-2"
                  @click="saveField('electricity')"
                >
                  <CheckIcon class="h-4 w-4" />
                </BaseButton>
              </div>
            </div>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
