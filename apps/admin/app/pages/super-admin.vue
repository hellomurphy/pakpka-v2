<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useAppAuth } from '~/composables/useAppAuth'
import { useApiFetch } from '~/composables/useApiFetch'
import { useNotification } from '~/composables/useNotification'
import BaseButton from '~/components/ui/BaseButton.vue'
import { BaseInput } from '~/components/form'
import { ArrowPathIcon, CheckCircleIcon, BuildingOffice2Icon } from '@heroicons/vue/24/outline'

// --- Page Meta & Auth ---
// หน้านี้จะถูกป้องกันโดย auth middleware โดยอัตโนมัติ
definePageMeta({
  layout: 'default', // หรือ layout ที่คุณต้องการ
})

const { data: session, status } = useAppAuth()
const notify = useNotification()
const config = useRuntimeConfig()

// --- Local State ---
const isLoading = ref(false)
const isAuthorized = ref(false)
const successData = ref(null)

// --- Zod & VeeValidate ---
const createDemoSchema = toTypedSchema(
  z.object({
    propertyName: z.string().min(1, 'ต้องระบุชื่อหอพัก'),
    userEmail: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    userPassword: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  }),
)

const { errors, handleSubmit, defineField, resetForm } = useForm({
  validationSchema: createDemoSchema,
})

const [propertyName, propertyNameAttrs] = defineField('propertyName')
const [userEmail, userEmailAttrs] = defineField('userEmail')
const [userPassword, userPasswordAttrs] = defineField('userPassword')

// --- Authorization Check ---
onMounted(() => {
  // ตรวจสอบว่าผู้ที่ล็อกอินอยู่คือ Super Admin หรือไม่
  if (
    status.value === 'authenticated' &&
    session.value?.user?.email === config.public.superAdminEmail
  ) {
    isAuthorized.value = true
  } else if (status.value === 'authenticated') {
    // ถ้าล็อกอินแล้วแต่ไม่ใช่ Super Admin, ให้ redirect กลับหน้าหลัก
    notify.showError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
    navigateTo('/')
  }
})

// --- Methods ---
const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  successData.value = null
  try {
    const response = await useApiFetch('/api/admin/create-demo', {
      method: 'POST',
      body: {
        ...values,
        adminSecret: config.public.superAdminSecret, // ส่งรหัสลับไปด้วย
      },
    })

    if (response.success) {
      notify.showSuccess('สร้างบัญชีทดลองสำเร็จ!')
      successData.value = {
        ...values,
        ...response.data,
      }
      resetForm()
    }
  } finally {
    isLoading.value = false
  }
})

const createAnother = () => {
  successData.value = null
  resetForm()
}
</script>

<template>
  <div
    v-if="isAuthorized"
    class="min-h-full bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="w-full max-w-lg space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Super Admin Panel
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">เครื่องมือสำหรับสร้างบัญชีทดลอง</p>
      </div>

      <div v-if="successData" class="bg-white p-8 rounded-xl shadow-md text-center">
        <CheckCircleIcon class="mx-auto h-12 w-12 text-green-500" />
        <h3 class="mt-4 text-lg font-semibold text-gray-900">สร้างบัญชีสำเร็จ!</h3>
        <p class="mt-2 text-sm text-gray-500">กรุณาส่งข้อมูลด้านล่างนี้ให้ลูกค้าของคุณ:</p>
        <div class="mt-4 space-y-2 text-left bg-slate-50 p-4 rounded-lg">
          <p>
            <span class="font-semibold">หอพัก:</span>
            {{ successData.property.name }}
          </p>
          <p>
            <span class="font-semibold">อีเมล (Username):</span>
            {{ successData.userEmail }}
          </p>
          <p>
            <span class="font-semibold">รหัสผ่านชั่วคราว:</span>
            {{ successData.userPassword }}
          </p>
        </div>
        <BaseButton class="mt-6" :icon="ArrowPathIcon" @click="createAnother">
          สร้างบัญชีใหม่
        </BaseButton>
      </div>

      <form v-else class="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-md" @submit="onSubmit">
        <div class="space-y-4 rounded-md">
          <BaseInput
            v-model="propertyName"
            v-bind="propertyNameAttrs"
            label="ชื่อหอพักของลูกค้า"
            placeholder="เช่น เจริญสุขแมนชั่น"
            :error="errors.propertyName"
          />
          <BaseInput
            v-model="userEmail"
            v-bind="userEmailAttrs"
            label="อีเมล (สำหรับใช้ Login)"
            type="email"
            placeholder="client@email.com"
            :error="errors.userEmail"
          />
          <BaseInput
            v-model="userPassword"
            v-bind="userPasswordAttrs"
            label="รหัสผ่านชั่วคราว"
            type="text"
            placeholder="ตั้งรหัสผ่านเริ่มต้นที่แข็งแรง"
            :error="errors.userPassword"
          />
        </div>

        <div>
          <BaseButton type="submit" class="w-full !py-3" :loading="isLoading">
            <BuildingOffice2Icon class="h-5 w-5 mr-2" />
            สร้างบัญชีและข้อมูลทดลอง
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>
