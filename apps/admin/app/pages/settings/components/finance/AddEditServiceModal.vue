<script setup>
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useServicesStore } from '~/store/servicesStore'
import { usePropertyStore } from '~/store/propertyStore'

import { BaseInput, CurrencyInput, BaseSelect, BaseSwitch } from '~/components/form'
import { BaseModal, BaseButton } from '~/components/ui'

// --- Store Connections ---
const servicesStore = useServicesStore()
const propertyStore = usePropertyStore()

const emit = defineEmits(['success'])

// --- State ---
const isModalOpen = ref(false)
const isLoading = ref(false)
const service = ref(null)
const isEditMode = computed(() => !!service.value)

const BillingCycle = {
  ONETIME: 'ONETIME',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
}

// --- Validation ---
const serviceSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'ต้องระบุชื่อบริการ'),
    defaultPrice: z.coerce.number().min(0, 'ราคาต้องไม่ติดลบ'),
    billingCycle: z.nativeEnum(Object.values(BillingCycle)),
    isOptional: z.boolean(),
  }),
)

const { handleSubmit, resetForm, defineField } = useForm({
  validationSchema: serviceSchema,
})

const [name, nameAttrs] = defineField('name')
const [defaultPrice, defaultPriceAttrs] = defineField('defaultPrice')
const [billingCycle, billingCycleAttrs] = defineField('billingCycle')
const [isOptional, isOptionalAttrs] = defineField('isOptional')

// --- Methods ---
const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  const propertyId = propertyStore.propertyId
  let response

  if (isEditMode.value) {
    response = await servicesStore.updateService(service.value.id, values, propertyId)
  } else {
    response = await servicesStore.addService(values, propertyId)
  }

  if (response.success) {
    emit('success')
    closeModal()
  }

  isLoading.value = false
})

const open = (serviceItem) => {
  if (serviceItem) {
    service.value = serviceItem
    isEditMode.value = true
    resetForm({ values: { ...serviceItem } })
  } else {
    isEditMode.value = false
    service.value = null
    resetForm({
      values: {
        name: '',
        defaultPrice: 0,
        billingCycle: BillingCycle.MONTHLY,
        isOptional: true,
      },
    })
  }
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}
defineExpose({ open })
</script>

<template>
  <BaseModal v-model="isModalOpen" max-width="lg" :persistent="true">
    <template #title>
      {{ isEditMode ? `แก้ไขบริการ: ${service && service.name}` : 'เพิ่มบริการใหม่' }}
    </template>

    <form id="service-form" class="mt-6 space-y-5" @submit.prevent="onSubmit">
      <BaseInput
        v-model="name"
        v-bind="nameAttrs"
        label="ชื่อบริการ"
        placeholder="เช่น ค่าที่จอดรถ, ค่าอินเทอร์เน็ต"
      />
      <CurrencyInput v-model="defaultPrice" v-bind="defaultPriceAttrs" label="ราคามาตรฐาน (บาท)" />
      <BaseSelect
        v-model="billingCycle"
        v-bind="billingCycleAttrs"
        label="รอบบิล"
        :options="[
          { value: 'ONETIME', label: 'ครั้งเดียว' },
          { value: 'MONTHLY', label: 'รายเดือน' },
          { value: 'YEARLY', label: 'รายปี' },
        ]"
      />
      <BaseSwitch
        v-model="isOptional"
        v-bind="isOptionalAttrs"
        label="บริการทางเลือก"
        description="ถ้าปิด, บริการนี้จะถูกเพิ่มเข้าทุกสัญญาใหม่โดยอัตโนมัติ (เช่น ค่าส่วนกลาง)"
      />
    </form>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton variant="secondary" @click="closeModal"> ยกเลิก </BaseButton>
        <BaseButton type="submit" form="service-form" :loading="isLoading">
          {{ isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกบริการ' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
