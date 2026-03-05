<script setup>
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useBillingStore } from '~/store/billingStore'
import { usePropertyStore } from '~/store/propertyStore'
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseSelect from '~/components/form/BaseSelect.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import dayjs from 'dayjs'

const emit = defineEmits(['success'])

// --- Store Connections ---
const billingStore = useBillingStore()
const propertyStore = usePropertyStore()
const { propertyId } = storeToRefs(propertyStore)

// --- State ---
const isModalOpen = ref(false)
const isLoading = ref(false)

// --- Dynamic Billing Cycle Options ---
// ✨ 1. สร้างตัวเลือกเดือนแบบ Dynamic (เดือนปัจจุบัน + 2 เดือนถัดไป)
const billingCycleOptions = computed(() => {
  const now = dayjs()
  return [
    { value: now.format('YYYY-MM'), label: now.format('MMMM BBBB') },
    {
      value: now.add(1, 'month').format('YYYY-MM'),
      label: now.add(1, 'month').format('MMMM BBBB'),
    },
    {
      value: now.add(2, 'month').format('YYYY-MM'),
      label: now.add(2, 'month').format('MMMM BBBB'),
    },
  ]
})

// --- Validation ---
const schema = toTypedSchema(
  z.object({
    period: z.string({ required_error: 'กรุณาเลือกรอบบิล' }),
  }),
)

const { handleSubmit, defineField, resetForm, errors } = useForm({
  validationSchema: schema,
})
const [period, periodAttrs] = defineField('period')

// --- Methods ---
const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true

  // ✨ 2. เรียกใช้ Action จาก Store
  const response = await billingStore.createBillingRun(propertyId.value, values.period)

  if (response.success) {
    // ✨ 3. emit 'success' พร้อมส่ง data ให้ parent component
    emit('success', response.data)

    closeModal()
  }
  // Error notification is handled by useApiFetch in the store

  isLoading.value = false
})

const open = () => {
  resetForm({
    values: {
      // ✨ 4. ตั้งค่า Default เป็นเดือนปัจจุบัน
      period: billingCycleOptions.value[0].value,
    },
  })
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
  isLoading.value = false
}
defineExpose({ open })
</script>

<template>
  <BaseModal v-model="isModalOpen" max-width="md" :persistent="true">
    <template #title> สร้างรอบบิลใหม่ </template>

    <div class="mt-4">
      <p class="text-sm text-gray-600 mb-4">
        เลือกรอบบิลที่ต้องการสร้างใบแจ้งหนี้ ระบบจะค้นหาสัญญาที่ยังใช้งานอยู่ทั้งหมดในเดือนนั้นๆ
      </p>
      <form id="create-run-form" @submit.prevent="onSubmit">
        <BaseSelect
          v-model="period"
          v-bind="periodAttrs"
          label="รอบบิล"
          :options="billingCycleOptions"
          :error="errors.period"
        />
      </form>
    </div>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton variant="secondary" @click="closeModal"> ยกเลิก </BaseButton>
        <BaseButton type="submit" form="create-run-form" :loading="isLoading">
          เริ่มสร้างรอบบิล
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
