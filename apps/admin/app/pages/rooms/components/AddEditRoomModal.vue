<script setup>
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '~/store/propertyStore'
import { useRoomsStore } from '../store/roomsStore'
import { BaseSelect, BaseInput } from '~/components/form'
import { BaseModal, BaseButton } from '~/components/ui'

const emit = defineEmits(['success'])

// --- Store Connections ---
const propertyStore = usePropertyStore()
const roomStore = useRoomsStore()

const { roomTypes, floors } = storeToRefs(roomStore)
const { activeProperty, propertyId } = storeToRefs(propertyStore)

const floorOptions = computed(
  () => floors.value?.map((floor) => ({ label: floor.name, value: floor.id })) || [],
)
const roomTypeOptions = computed(
  () =>
    roomTypes.value?.map((type) => ({
      label: `${type.name} (฿${type.basePrice.toLocaleString()})`,
      value: type.id,
    })) || [],
)

// --- Local State ---
const isModalOpen = ref(false)
const isLoading = ref(false)
const editingRoom = ref(null)
const activeTab = ref('single')

const isEditMode = computed(() => !!editingRoom.value)
const roomNamingFormat = computed(() => activeProperty.value?.roomNamingFormat)

// --- Zod & VeeValidate ---

// ✨ FIX: เปลี่ยนจากการสร้าง schema แบบ const มาเป็น `computed` property
const validationSchema = computed(() => {
  const roomNumberValidation = computed(() => {
    if (roomNamingFormat.value === 'NUMERIC') {
      return z
        .string()
        .min(1, 'ต้องระบุเลขห้อง')
        .regex(/^[0-9]+$/, 'รูปแบบต้องเป็นตัวเลขเท่านั้น')
    }
    return z
      .string()
      .min(1, 'ต้องระบุเลขห้อง')
      .regex(/^[A-Z][0-9]{2,3}$/, 'รูปแบบต้องเป็น ตัวอักษรใหญ่ 1 ตัว + ตัวเลข 2-3 ตัว (เช่น A101)')
  })

  return toTypedSchema(
    z.object({
      floorId: z.string({ required_error: 'กรุณาเลือกชั้น' }),
      roomNumber: roomNumberValidation.value,
      roomTypeId: z.string({ required_error: 'ต้องเลือกประเภทห้อง' }),
    }),
  )
})

const { errors, handleSubmit, resetForm, defineField } = useForm({
  validationSchema: validationSchema, // ส่ง computed property เข้าไปตรงๆ
})
const [floorId] = defineField('floorId')
const [roomNumber] = defineField('roomNumber')
const [roomTypeId] = defineField('roomTypeId')

// --- Methods ---
const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  try {
    if (isEditMode.value) {
      // ตอน update ให้ส่ง propertyId และ floorId (ใช้ floorId จาก values)
      await roomStore.updateRoom(
        editingRoom.value.id,
        values,
        propertyId.value,
        values.floorId, // ใช้ floorId จาก form values
      )
    } else {
      await roomStore.addRoom(values, propertyId.value)
    }
    emit('success')
    closeModal()
  } finally {
    isLoading.value = false
  }
})

const blankFormState = {
  floorId: undefined,
  roomNumber: '',
  roomTypeId: undefined,
}

const open = (item = null) => {
  if (item) {
    editingRoom.value = item
    resetForm({ values: { ...item } })
  } else {
    editingRoom.value = null
    resetForm({ values: blankFormState })
    activeTab.value = 'single'
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm({ values: blankFormState })
}

defineExpose({ open })
</script>

<template>
  <BaseModal v-model="isModalOpen" max-width="lg" :persistent="isLoading">
    <template #title>
      {{ isEditMode ? `แก้ไขห้อง: ${editingRoom.roomNumber}` : 'เพิ่มห้องพักใหม่' }}
    </template>

    <div class="mt-4">
      <div v-if="!isEditMode" class="mb-4 border-b border-gray-200">
        <nav class="-mb-px flex space-x-4">
          <button
            :class="[
              activeTab === 'single'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
              'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium',
            ]"
            @click="activeTab = 'single'"
          >
            เพิ่มทีละห้อง
          </button>
          <button
            :class="[
              activeTab === 'bulk'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
              'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium',
            ]"
            @click="activeTab = 'bulk'"
          >
            สร้างเป็นชุด
          </button>
        </nav>
      </div>

      <form id="room-form" class="space-y-5" @submit.prevent="onSubmit">
        <div v-if="activeTab === 'single' || isEditMode" class="space-y-4">
          <BaseSelect
            v-model="floorId"
            label="ชั้น"
            :options="floorOptions"
            :error="errors.floorId"
            required
          />
          <BaseInput
            v-model="roomNumber"
            label="เลขห้อง"
            :placeholder="roomNamingFormat === 'NUMERIC' ? 'เช่น 101' : 'เช่น A101'"
            :error="errors.roomNumber"
            required
          />
          <BaseSelect
            v-model="roomTypeId"
            label="ประเภทห้อง"
            :options="roomTypeOptions"
            :error="errors.roomTypeId"
            required
          />
        </div>

        <div
          v-if="activeTab === 'bulk' && !isEditMode"
          class="space-y-4 p-4 bg-slate-50 rounded-lg"
        >
          <p class="text-center text-gray-500 py-8">
            ฟังก์ชันสร้างห้องเป็นชุดกำลังอยู่ในระหว่างการพัฒนา
          </p>
        </div>
      </form>
    </div>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton variant="secondary" @click="closeModal"> ยกเลิก </BaseButton>
        <BaseButton type="submit" form="room-form" :loading="isLoading">
          {{ isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึก' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
