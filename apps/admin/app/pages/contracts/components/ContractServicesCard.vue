<script setup>
import { ref, computed, watch } from 'vue'
import { useServicesStore } from '~/store/servicesStore'
import { useConfirm } from '~/composables/useConfirm'
import { useFormatters } from '~/composables/useFormatters'
import BaseButton from '~/components/ui/BaseButton.vue'
import { CurrencyInput, BaseSelect } from '~/components/form'
import { XMarkIcon, PlusIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  contractId: String,
  contractServices: Array,
  serviceCatalog: Array,
})
const emit = defineEmits(['success'])

const servicesStore = useServicesStore()
const { show: showConfirm } = useConfirm()
const { currency } = useFormatters()

const isAddingService = ref(false)
const newService = ref({
  serviceId: null,
  customPrice: null,
})

watch(
  () => newService.value.serviceId,
  (newId) => {
    if (newId) {
      const selectedService = props.serviceCatalog.find((s) => s.id === newId)
      if (selectedService) {
        newService.value.customPrice = selectedService.defaultPrice
      }
    } else {
      newService.value.customPrice = null
    }
  },
)

// ✨ 1. แบ่ง Service ในสัญญาออกเป็น 2 กลุ่ม
const mandatoryServices = computed(
  () => props.contractServices?.filter((cs) => !cs.service.isOptional) || [],
)
const optionalServices = computed(
  () => props.contractServices?.filter((cs) => cs.service.isOptional) || [],
)

// ✨ 2. ปรับปรุง Dropdown ให้แสดงเฉพาะ Service ที่เป็น "ทางเลือก" และยังไม่ได้เพิ่ม
const filteredServiceCatalog = computed(() => {
  if (!props.contractServices || !props.serviceCatalog) return []
  const subscribedServiceIds = new Set(props.contractServices.map((cs) => cs.service.id))
  // เพิ่ม .filter(service => service.isOptional)
  return props.serviceCatalog.filter(
    (service) => service.isOptional && !subscribedServiceIds.has(service.id),
  )
})

const handleAddService = async () => {
  if (!newService.value.serviceId || !props.contractId) return
  const response = await servicesStore.addServiceToContract(props.contractId, newService.value)
  if (response.success) {
    isAddingService.value = false
    newService.value = { serviceId: null, customPrice: null }
    emit('success')
  }
}

const cancelAddService = () => {
  isAddingService.value = false
  newService.value = { serviceId: null, customPrice: null }
}

const handleRemoveService = async (contractServiceId) => {
  const confirmed = await showConfirm({
    title: 'ยืนยันการลบบริการเสริม',
    message: 'คุณแน่ใจหรือไม่ว่าต้องการลบบริการเสริมนี้ออกจากสัญญา?',
    confirmText: 'ลบ',
    intent: 'danger',
  })
  if (!confirmed) return
  const response = await servicesStore.removeServiceFromContract(contractServiceId)
  if (response.success) {
    emit('success')
  }
}
</script>

<template>
  <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-base font-semibold leading-7 text-gray-900 flex items-center gap-2">
        <WrenchScrewdriverIcon class="h-5 w-5 text-gray-400" />
        ค่าบริการเสริม
      </h3>
    </div>
    <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
      <div v-if="!isAddingService" class="space-y-4">
        <div v-if="contractServices && contractServices.length > 0" class="space-y-3">
          <ul v-if="mandatoryServices.length > 0" class="space-y-2">
            <li
              v-for="cs in mandatoryServices"
              :key="cs.id"
              class="flex justify-between items-center text-sm p-2 bg-green-50/70 rounded-md"
            >
              <span
                >{{ cs.service.name }}
                <span class="text-xs text-green-700 font-semibold">(บังคับ)</span></span
              >
              <span class="font-medium text-gray-900"
                >{{ currency(cs.customPrice || cs.service.defaultPrice) }} / เดือน</span
              >
            </li>
          </ul>
          <ul v-if="optionalServices.length > 0" class="space-y-2">
            <li
              v-for="cs in optionalServices"
              :key="cs.id"
              class="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-md"
            >
              <span>{{ cs.service.name }}</span>
              <div class="flex items-center gap-x-2">
                <span class="font-medium text-gray-900"
                  >{{ currency(cs.customPrice || cs.service.defaultPrice) }} / เดือน</span
                >
                <button
                  class="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                  @click="handleRemoveService(cs.id)"
                >
                  <XMarkIcon class="h-4 w-4" />
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div v-else class="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
          <p class="text-sm text-gray-500">ยังไม่มีบริการเสริมในสัญญา</p>
        </div>

        <div
          v-if="filteredServiceCatalog.length > 0"
          class="text-center pt-2 border-t border-dashed border-gray-200"
        >
          <BaseButton
            variant="secondary"
            size="sm"
            :icon="PlusIcon"
            @click="isAddingService = true"
          >
            เพิ่มบริการเสริม
          </BaseButton>
        </div>
      </div>

      <div v-else class="p-3 bg-slate-50 rounded-lg space-y-3">
        <BaseSelect
          v-model="newService.serviceId"
          :options="filteredServiceCatalog.map((s) => ({ value: s.id, label: s.name }))"
          label="เลือกบริการ"
        />
        <CurrencyInput
          v-model="newService.customPrice"
          placeholder="ราคาพิเศษ (ถ้ามี)"
          label="ราคาที่กำหนดเอง"
        />
        <div class="flex justify-end gap-x-2 pt-2">
          <BaseButton variant="secondary" size="sm" @click="cancelAddService"> ยกเลิก </BaseButton>
          <BaseButton size="sm" @click="handleAddService"> เพิ่มบริการ </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
