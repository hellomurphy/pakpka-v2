<script setup>
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useContractsStore } from '~/store/contractsStore'
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseDatePicker from '~/components/form/BaseDatePicker.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import dayjs from 'dayjs'

const emit = defineEmits(['success'])
const contractsStore = useContractsStore() // ✨ 2. เรียกใช้ Store

const { isLoading } = storeToRefs(contractsStore)

// --- State ---
const isModalOpen = ref(false)
const contractInfo = ref(null)

const schema = toTypedSchema(
  z.object({
    noticeDate: z.coerce.date().min(dayjs().startOf('day').toDate(), {
      message: 'วันที่ต้องไม่ใช่วันในอดีต',
    }),
  }),
)

const { handleSubmit, defineField, resetForm, errors } = useForm({
  validationSchema: schema,
})
const [noticeDate, noticeDateAttrs] = defineField('noticeDate')

// --- Methods ---
const onSubmit = handleSubmit(async (values) => {
  if (!contractInfo.value?.id) return

  // ✨ 3. เรียกใช้ Action จาก Store
  const success = await contractsStore.giveNoticeOfMoveOut(contractInfo.value.id, values.noticeDate)

  if (success) {
    emit('success')
    closeModal()
  }
})

const open = (contract) => {
  contractInfo.value = contract

  resetForm({
    values: { noticeDate: dayjs(contract.endDate).toDate() },
  })
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}
defineExpose({ open })
</script>

<template>
  <BaseModal v-model="isModalOpen" max-width="md" :persistent="true">
    <template #title>
      แจ้งย้ายออก: {{ contractInfo?.tenantName }} (ห้อง {{ contractInfo?.roomNumber }})
    </template>

    <div class="mt-4">
      <p class="text-sm text-gray-600 mb-4">
        กรุณาระบุวันที่ผู้เช่าคาดว่าจะย้ายออก ระบบจะเปลี่ยนสถานะของผู้เช่าเป็น "แจ้งย้ายออก"
      </p>
      <form id="notice-form" @submit.prevent="onSubmit">
        <BaseDatePicker
          v-model="noticeDate"
          v-bind="noticeDateAttrs"
          label="วันที่กำหนดจะย้ายออก"
          :error="errors.noticeDate"
        />
      </form>
    </div>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton variant="secondary" @click="closeModal"> ยกเลิก </BaseButton>
        <BaseButton
          type="submit"
          form="notice-form"
          :loading="isLoading"
          variant="primary"
          class="bg-amber-600 hover:bg-amber-500 focus-visible:outline-amber-600"
        >
          ยืนยันการแจ้งย้ายออก
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
