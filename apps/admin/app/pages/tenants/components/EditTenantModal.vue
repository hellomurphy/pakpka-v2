<script setup>
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useTenantsStore } from '../store/tenantsStore'

import BaseModal from '~/components/ui/BaseModal.vue'
import BaseInput from '~/components/form/BaseInput.vue'
import BaseButton from '~/components/ui/BaseButton.vue'

const props = defineProps({
  tenant: { type: Object, default: null },
})
const emit = defineEmits(['success'])
const tenantsStore = useTenantsStore()

// --- State ---
const isModalOpen = ref(false)

// --- Validation (Schema เดียวที่เรียบง่าย) ---
const editTenantSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'ต้องระบุชื่อ'),
    phone: z
      .string()
      .regex(/^0[0-9]{8,9}$/, 'เบอร์โทรไม่ถูกต้อง')
      .optional()
      .or(z.literal('')),
  }),
)

const { handleSubmit, resetForm, defineField, errors } = useForm({
  validationSchema: editTenantSchema,
})

const [name, nameAttrs] = defineField('name')
const [phone, phoneAttrs] = defineField('phone')

// --- Methods ---
const onSubmit = handleSubmit(async (formValues) => {
  if (!props.tenant) return
  const response = await tenantsStore.updateTenant(props.tenant.id, formValues)

  if (response.success) {
    emit('success')
    closeModal()
  }
})

const open = () => {
  if (!props.tenant) return

  resetForm({
    values: {
      name: props.tenant.name,
      phone: props.tenant.phone,
    },
  })
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}
defineExpose({ open })
</script>

<template>
  <BaseModal v-if="tenant" v-model="isModalOpen" max-width="lg" :persistent="true">
    <template #title> แก้ไขข้อมูล: {{ tenant.name }} </template>

    <div class="mt-4">
      <form id="edit-tenant-form" class="space-y-4" @submit.prevent="onSubmit">
        <BaseInput v-model="name" v-bind="nameAttrs" label="ชื่อ-นามสกุล" :error="errors.name" />
        <BaseInput
          v-model="phone"
          v-bind="phoneAttrs"
          label="เบอร์โทรศัพท์"
          type="tel"
          :error="errors.phone"
        />
      </form>
    </div>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton variant="secondary" @click="closeModal"> ยกเลิก </BaseButton>
        <BaseButton type="submit" form="edit-tenant-form"> บันทึกการเปลี่ยนแปลง </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
