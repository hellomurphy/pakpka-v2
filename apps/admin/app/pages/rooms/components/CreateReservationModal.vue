<script setup>
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useReservationsStore } from '~/store/reservationsStore'
import { useTenantsStore } from '~/pages/tenants/store/tenantsStore'
import { usePropertyStore } from '~/store/propertyStore'
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseSelect from '~/components/form/BaseSelect.vue'
import BaseDatePicker from '~/components/form/BaseDatePicker.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import dayjs from 'dayjs'

const emit = defineEmits(['success'])

// --- Store Connections ---
const reservationsStore = useReservationsStore()
const tenantsStore = useTenantsStore()
const propertyStore = usePropertyStore()

const { tenants: waitingListTenants } = storeToRefs(tenantsStore)
const { propertyId } = storeToRefs(propertyStore)

// --- State ---
const isModalOpen = ref(false)
const roomToReserve = ref(null)

// --- Validation ---
const reservationSchema = toTypedSchema(
  z.object({
    tenantId: z.string({ required_error: 'กรุณาเลือกผู้ที่สนใจจอง' }).cuid(),
    endDate: z.coerce.date().min(new Date(), { message: 'วันที่หมดอายุต้องไม่ใช่วันในอดีต' }),
  }),
)

const { handleSubmit, resetForm, defineField, errors } = useForm({
  validationSchema: reservationSchema,
})
const [tenantId, tenantIdAttrs] = defineField('tenantId')
const [endDate, endDateAttrs] = defineField('endDate')

// --- Computed Properties ---
const waitingListOptions = computed(() => {
  return waitingListTenants.value.map((tenant) => ({
    value: tenant.id,
    label: tenant.name,
  }))
})

// --- Methods ---
const onSubmit = handleSubmit(async (values) => {
  if (!roomToReserve.value) return

  const payload = {
    ...values,
    propertyId: propertyId.value,
    roomId: roomToReserve.value.id,
    startDate: new Date(),
  }

  const response = await reservationsStore.createReservation(payload)

  if (response.success) {
    emit('success')
    closeModal()
  }
})

const open = (room) => {
  roomToReserve.value = room

  // Fetch waiting list tenants if not already loaded
  tenantsStore.fetchTenants({
    propertyId: propertyId.value,
    status: 'WAITING_LIST',
  })

  resetForm({
    values: {
      tenantId: null,
      endDate: dayjs().add(1, 'day').endOf('day').toDate(), // Default หมดอายุใน 24 ชม.
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
  <BaseModal v-if="roomToReserve" v-model="isModalOpen" max-width="md">
    <template #title> สร้างการจองสำหรับห้อง: {{ roomToReserve.roomNumber }} </template>

    <div class="mt-4">
      <p class="text-sm text-gray-600 mb-4">
        การจองจะเปลี่ยนสถานะห้องเป็น "จองแล้ว" ชั่วคราว เพื่อป้องกันไม่ให้คนอื่นทำสัญญา
      </p>
      <form id="reservation-form" class="space-y-4" @submit.prevent="onSubmit">
        <BaseSelect
          v-model="tenantId"
          v-bind="tenantIdAttrs"
          label="ผู้จอง (จาก Waiting List)"
          :options="waitingListOptions"
          :error="errors.tenantId"
          no-options-text="ไม่มีผู้สนใจใน Waiting List"
        />
        <BaseDatePicker
          v-model="endDate"
          v-bind="endDateAttrs"
          label="การจองนี้จะสิ้นสุดในวันที่"
          :error="errors.endDate"
        />
      </form>
    </div>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton variant="secondary" @click="closeModal"> ยกเลิก </BaseButton>
        <BaseButton type="submit" form="reservation-form" :loading="reservationsStore.isLoading">
          ยืนยันการจอง
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
