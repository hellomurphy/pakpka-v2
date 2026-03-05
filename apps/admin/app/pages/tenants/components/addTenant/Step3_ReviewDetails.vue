<script setup>
import { ref, computed } from 'vue'
import { useFormatters } from '~/composables/useFormatters'
import { storeToRefs } from 'pinia'
import { useServicesStore } from '~/store/servicesStore'
import { BaseDatePicker, BaseSelect } from '~/components/form'
import CurrencyInput from '~/components/form/CurrencyInput.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import {
  CheckIcon,
  PencilSquareIcon,
  XMarkIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
  SunIcon,
  CloudIcon,
} from '@heroicons/vue/24/outline'

// 1. รับ Props สำหรับแสดงข้อมูลสรุป และ VeeValidate attributes
defineProps({
  values: { type: Object, required: true },
  roomLabel: { type: String, default: 'N/A' },
  rentAmountAttrs: Object,
  depositAmountAttrs: Object,
  startDateAttrs: Object,
  endDateAttrs: Object,
  waterBillingTypeAttrs: Object,
  waterRateAttrs: Object,
  waterMinimumChargeAttrs: Object,
  elecBillingTypeAttrs: Object,
  electricityRateAttrs: Object,
  elecMinimumChargeAttrs: Object,
  servicesAttrs: Object,
})

// --- Store & Composables ---
const servicesStore = useServicesStore()
const { services: serviceCatalog } = storeToRefs(servicesStore)
const { currency, fullDate } = useFormatters()

// --- Local State ---
const editingField = ref(null)
const isAddingService = ref(false)
const newServiceId = ref(null)

// 2. ใช้ defineModel สำหรับทุก field ที่แก้ไขได้ เพื่อสร้าง two-way binding กับตัวแม่
/* eslint-disable vue/require-prop-types -- defineModel props are typed via macro */
const rentAmount = defineModel('rentAmount')
const depositAmount = defineModel('depositAmount')
const startDate = defineModel('startDate')
const endDate = defineModel('endDate')
const waterBillingType = defineModel('waterBillingType')
const waterRate = defineModel('waterRate')
const waterMinimumCharge = defineModel('waterMinimumCharge')
const electricityBillingType = defineModel('electricityBillingType')
const electricityRate = defineModel('electricityRate')
const electricityMinimumCharge = defineModel('electricityMinimumCharge')
const services = defineModel('services')

// --- Computed ---
// กรองเฉพาะ Service ที่เป็น "ทางเลือก" และ "ยังไม่ได้ถูกเพิ่ม" เพื่อแสดงใน Dropdown
const optionalServiceCatalog = computed(() => {
  if (!services.value || !serviceCatalog.value) return []
  // 1. สร้าง Set ของ ID บริการที่มีในสัญญาปัจจุบันแล้ว
  const subscribedServiceIds = new Set(services.value.map((s) => s.serviceId))
  // 2. กรอง Service Catalog ทั้งหมด เอาเฉพาะที่เป็นทางเลือก และยังไม่มีในสัญญา
  return serviceCatalog.value.filter((s) => s.isOptional && !subscribedServiceIds.has(s.id))
})

// --- Methods ---
const startEditing = (field) => {
  editingField.value = field
}
const stopEditing = () => {
  editingField.value = null
}

const handleAddService = () => {
  if (!newServiceId.value) return
  const selectedService = serviceCatalog.value.find((s) => s.id === newServiceId.value)
  if (selectedService) {
    services.value.push({
      serviceId: selectedService.id,
      name: selectedService.name,
      price: selectedService.defaultPrice,
      isOptional: selectedService.isOptional,
    })
  }
  isAddingService.value = false
  newServiceId.value = null
}

const cancelAddService = () => {
  isAddingService.value = false
  newServiceId.value = null
}

const handleRemoveService = (serviceId) => {
  services.value = services.value.filter((s) => s.serviceId !== serviceId)
}
</script>

<template>
  <div class="mt-4">
    <dl class="divide-y divide-gray-100">
      <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt class="text-sm font-medium text-gray-500">ห้อง</dt>
        <dd class="text-sm text-gray-900 sm:col-span-2 font-semibold">
          {{ roomLabel }}
        </dd>
      </div>
      <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt class="text-sm font-medium text-gray-500">ผู้เช่า</dt>
        <dd class="text-sm text-gray-900 sm:col-span-2">
          {{ values.tenantName }}
        </dd>
      </div>

      <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
        <dt class="text-sm font-medium text-gray-500">ค่าเช่า</dt>
        <dd class="sm:col-span-2">
          <div v-if="editingField !== 'rentAmount'" class="flex justify-between items-center">
            <span class="text-sm text-gray-900">{{ currency(values.rentAmount) }} / เดือน</span>
            <button
              class="p-1 rounded-full text-blue-600 hover:bg-gray-100"
              @click.prevent="startEditing('rentAmount')"
            >
              <PencilSquareIcon class="h-4 w-4" />
            </button>
          </div>
          <div v-else class="flex items-center gap-2">
            <CurrencyInput v-model="rentAmount" v-bind="rentAmountAttrs" />
            <BaseButton variant="secondary" size="sm" class="!p-2" @click="stopEditing">
              <CheckIcon class="h-4 w-4" />
            </BaseButton>
          </div>
        </dd>
      </div>

      <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
        <dt class="text-sm font-medium text-gray-500">เงินประกัน</dt>
        <dd class="sm:col-span-2">
          <div v-if="editingField !== 'depositAmount'" class="flex justify-between items-center">
            <span class="text-sm text-gray-900">{{ currency(values.depositAmount) }}</span>
            <button
              class="p-1 rounded-full text-blue-600 hover:bg-gray-100"
              @click.prevent="startEditing('depositAmount')"
            >
              <PencilSquareIcon class="h-4 w-4" />
            </button>
          </div>
          <div v-else class="flex items-center gap-2">
            <CurrencyInput v-model="depositAmount" v-bind="depositAmountAttrs" />
            <BaseButton variant="secondary" size="sm" class="!p-2" @click="stopEditing">
              <CheckIcon class="h-4 w-4" />
            </BaseButton>
          </div>
        </dd>
      </div>

      <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
        <dt class="text-sm font-medium text-gray-500">วันเริ่มสัญญา</dt>
        <dd class="sm:col-span-2">
          <div v-if="editingField !== 'startDate'" class="flex justify-between items-center">
            <span class="text-sm text-gray-900">{{ fullDate(values.startDate) }}</span>
            <button
              class="p-1 rounded-full text-blue-600 hover:bg-gray-100"
              @click.prevent="startEditing('startDate')"
            >
              <PencilSquareIcon class="h-4 w-4" />
            </button>
          </div>
          <div v-else class="flex items-center gap-2">
            <BaseDatePicker v-model="startDate" v-bind="startDateAttrs" />
            <BaseButton variant="secondary" size="sm" class="!p-2" @click="stopEditing">
              <CheckIcon class="h-4 w-4" />
            </BaseButton>
          </div>
        </dd>
      </div>

      <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
        <dt class="text-sm font-medium text-gray-500">วันสิ้นสุดสัญญา</dt>
        <dd class="sm:col-span-2">
          <div v-if="editingField !== 'endDate'" class="flex justify-between items-center">
            <span class="text-sm text-gray-900">{{ fullDate(values.endDate) }}</span>
            <button
              class="p-1 rounded-full text-blue-600 hover:bg-gray-100"
              @click.prevent="startEditing('endDate')"
            >
              <PencilSquareIcon class="h-4 w-4" />
            </button>
          </div>
          <div v-else class="flex items-center gap-2">
            <BaseDatePicker v-model="endDate" v-bind="endDateAttrs" />
            <BaseButton variant="secondary" size="sm" class="!p-2" @click="stopEditing">
              <CheckIcon class="h-4 w-4" />
            </BaseButton>
          </div>
        </dd>
      </div>

      <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
        <dt class="text-sm font-medium text-gray-500 flex items-center gap-1.5">
          <CloudIcon class="h-5 w-5 text-sky-600" />ค่าน้ำ
        </dt>
        <dd class="col-span-2">
          <div v-if="editingField !== 'water'" class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-900">
                {{ values.waterBillingType === 'FLAT_RATE' ? 'เหมาจ่าย' : 'ตามหน่วย' }}
                ({{ currency(values.waterRate)
                }}{{ values.waterBillingType === 'PER_UNIT' ? '/หน่วย' : '/เดือน' }})
              </p>
              <p
                v-if="values.waterBillingType === 'PER_UNIT' && values.waterMinimumCharge > 0"
                class="text-xs text-gray-500"
              >
                ขั้นต่ำ {{ currency(values.waterMinimumCharge) }}
              </p>
            </div>
            <button
              class="p-1 rounded-full text-blue-600 hover:bg-gray-100"
              @click.prevent="startEditing('water')"
            >
              <PencilSquareIcon class="h-4 w-4" />
            </button>
          </div>
          <div v-else class="space-y-2">
            <BaseSelect
              v-model="waterBillingType"
              :options="[
                { value: 'PER_UNIT', label: 'ตามหน่วย' },
                { value: 'FLAT_RATE', label: 'เหมาจ่าย' },
              ]"
              v-bind="waterBillingTypeAttrs"
            />
            <div class="flex items-center gap-2">
              <CurrencyInput v-model="waterRate" v-bind="waterRateAttrs" placeholder="ราคา" />
              <CurrencyInput
                v-if="values.waterBillingType === 'PER_UNIT'"
                v-model="waterMinimumCharge"
                v-bind="waterMinimumChargeAttrs"
                placeholder="ขั้นต่ำ"
              />
              <BaseButton variant="secondary" size="sm" class="!p-2" @click="stopEditing">
                <CheckIcon class="h-4 w-4" />
              </BaseButton>
            </div>
          </div>
        </dd>
      </div>

      <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
        <dt class="text-sm font-medium text-gray-500 flex items-center gap-1.5">
          <SunIcon class="h-5 w-5 text-amber-500" />ค่าไฟ
        </dt>
        <dd class="col-span-2">
          <div v-if="editingField !== 'electricity'" class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-900">
                {{ values.electricityBillingType === 'FLAT_RATE' ? 'เหมาจ่าย' : 'ตามหน่วย' }}
                ({{ currency(values.electricityRate)
                }}{{ values.electricityBillingType === 'PER_UNIT' ? '/หน่วย' : '/เดือน' }})
              </p>
              <p
                v-if="
                  values.electricityBillingType === 'PER_UNIT' &&
                  values.electricityMinimumCharge > 0
                "
                class="text-xs text-gray-500"
              >
                ขั้นต่ำ {{ currency(values.electricityMinimumCharge) }}
              </p>
            </div>
            <button
              class="p-1 rounded-full text-blue-600 hover:bg-gray-100"
              @click.prevent="startEditing('electricity')"
            >
              <PencilSquareIcon class="h-4 w-4" />
            </button>
          </div>
          <div v-else class="space-y-2">
            <BaseSelect
              v-model="electricityBillingType"
              :options="[
                { value: 'PER_UNIT', label: 'ตามหน่วย' },
                { value: 'FLAT_RATE', label: 'เหมาจ่าย' },
              ]"
              v-bind="elecBillingTypeAttrs"
            />
            <div class="flex items-center gap-2">
              <CurrencyInput
                v-model="electricityRate"
                v-bind="electricityRateAttrs"
                placeholder="ราคา"
              />
              <CurrencyInput
                v-if="values.electricityBillingType === 'PER_UNIT'"
                v-model="electricityMinimumCharge"
                v-bind="elecMinimumChargeAttrs"
                placeholder="ขั้นต่ำ"
              />
              <BaseButton variant="secondary" size="sm" class="!p-2" @click="stopEditing">
                <CheckIcon class="h-4 w-4" />
              </BaseButton>
            </div>
          </div>
        </dd>
      </div>

      <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt class="text-sm font-medium text-gray-500 pt-2 flex items-start gap-2">
          <WrenchScrewdriverIcon class="h-5 w-5 text-gray-400" />
          <span>ค่าบริการ</span>
        </dt>
        <dd class="sm:col-span-2 mt-1 sm:mt-0">
          <ul v-if="services && services.length > 0" class="space-y-2">
            <li
              v-for="service in services"
              :key="service.serviceId"
              class="flex justify-between items-center text-sm p-2 rounded-md"
              :class="service.isOptional ? 'bg-slate-50' : 'bg-green-50/70'"
            >
              <span>
                {{ service.name }}
                <span v-if="!service.isOptional" class="text-xs text-green-700 font-semibold"
                  >(บังคับ)</span
                >
              </span>
              <div class="flex items-center gap-x-2">
                <span class="font-medium text-gray-900">{{ currency(service.price) }} / เดือน</span>
                <button
                  v-if="service.isOptional"
                  class="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                  @click="handleRemoveService(service.serviceId)"
                >
                  <XMarkIcon class="h-4 w-4" />
                </button>
              </div>
            </li>
          </ul>

          <div v-if="isAddingService" class="mt-2 p-3 bg-slate-100 rounded-lg space-y-3">
            <BaseSelect
              v-model="newServiceId"
              :options="
                optionalServiceCatalog.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))
              "
              label="เลือกบริการเสริม"
              placeholder="เลือกบริการ..."
            />
            <div class="flex justify-end gap-x-2 pt-2">
              <BaseButton
                variant="secondary"
                size="sm"
                @click="cancelAddService"
              >
                ยกเลิก
              </BaseButton>
              <BaseButton size="sm" @click="handleAddService"> เพิ่มบริการ </BaseButton>
            </div>
          </div>

          <div
            v-if="!isAddingService"
            class="text-center pt-2 mt-2 border-t border-dashed border-gray-200"
          >
            <BaseButton
              variant="secondary"
              size="sm"
              :icon="PlusIcon"
              @click="isAddingService = true"
            >
              เพิ่มบริการเสริม (ทางเลือก)
            </BaseButton>
          </div>
        </dd>
      </div>
    </dl>
  </div>
</template>
