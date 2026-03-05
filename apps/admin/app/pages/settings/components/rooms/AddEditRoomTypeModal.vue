<script setup>
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useDelayedFieldError } from '~/composables/useFieldError'
import { usePropertyStore } from '~/store/propertyStore'
import { BaseModal, BaseButton } from '~/components/ui'
import { BaseInput, CurrencyInput } from '~/components/form'
import { useSettingsStore } from '../../store/settingsStore'

// --- Props & Emits ---
const props = defineProps({
  roomType: { type: Object, default: null },
})
const emit = defineEmits(['success'])

// --- State & Stores ---
const isModalOpen = ref(false)
const isLoading = ref(false)
const propertyStore = usePropertyStore() // ✨ 2. เรียกใช้ Store
const settingsStore = useSettingsStore()

const isEditMode = computed(() => !!props.roomType)

// --- Validation ---
const roomTypeSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'ต้องระบุชื่อประเภทห้อง'),
    basePrice: z.coerce
      .number({ required_error: 'ต้องระบุค่าเช่า' })
      .positive('ค่าเช่าต้องมากกว่า 0'),
    deposit: z.coerce.number({ required_error: 'ต้องระบุค่ามัดจำ' }).min(0),
  }),
)

const { handleSubmit, resetForm, defineField } = useForm({
  validationSchema: roomTypeSchema,
})
const [name, nameAttrs] = defineField('name')
const [basePrice, basePriceAttrs] = defineField('basePrice')
const [deposit, depositAttrs] = defineField('deposit')
const nameError = useDelayedFieldError('name')
const basePriceError = useDelayedFieldError('basePrice')
const depositError = useDelayedFieldError('deposit')

// --- Methods ---
const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  let res = null
  try {
    if (isEditMode.value) {
      // --- Logic การแก้ไข (PUT request) ---
      res = await useApiFetch(`/api/room-types/${props.roomType.id}`, {
        method: 'PUT',
        body: values,
      })

      if (res.success) {
        const index = settingsStore.settings.roomTypes.findIndex(
          (type) => type.id === props.roomType.id,
        )
        if (index !== -1) {
          settingsStore.settings.roomTypes[index] = res.data
        }
      }
    } else {
      // --- Logic การสร้างใหม่ (POST request) ---
      res = await useApiFetch('/api/room-types', {
        method: 'POST',
        body: {
          ...values,
          propertyId: propertyStore.propertyId,
        },
      })

      if (res.success) {
        settingsStore.settings.roomTypes.push(res.data)
      }
    }

    if (res?.success) {
      emit('success')
      closeModal()
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

const open = () => {
  if (isEditMode.value) {
    resetForm({ values: { ...props.roomType } })
  } else {
    resetForm()
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
      {{ isEditMode ? `แก้ไขประเภทห้อง: ${props.roomType.name}` : 'เพิ่มประเภทห้องใหม่' }}
    </template>

    <form id="room-type-form" class="mt-6 space-y-5" @submit.prevent="onSubmit">
      <BaseInput
        v-model="name"
        v-bind="nameAttrs"
        label="ชื่อประเภทห้อง"
        placeholder="เช่น Standard แอร์ + ทีวี"
        :error="nameError"
      />
      <CurrencyInput
        v-model="basePrice"
        v-bind="basePriceAttrs"
        label="ราคาค่าเช่าพื้นฐาน (บาท)"
        :error="basePriceError"
      />
      <CurrencyInput
        v-model="deposit"
        v-bind="depositAttrs"
        label="ค่ามัดจำ (บาท)"
        :error="depositError"
      />
    </form>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton variant="secondary" @click="closeModal"> ยกเลิก </BaseButton>
        <BaseButton type="submit" form="room-type-form" :loading="isLoading">
          {{ isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึก' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
