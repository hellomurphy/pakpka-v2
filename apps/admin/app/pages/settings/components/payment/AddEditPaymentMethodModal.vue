<script setup>
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useReceivingAccountsStore } from '../../store/receivingAccounts'
import BaseModal from '~/components/ui/BaseModal.vue'
import { BaseInput, BaseSelect } from '~/components/form'
import BaseButton from '~/components/ui/BaseButton.vue'

const accountsStore = useReceivingAccountsStore()
const emit = defineEmits(['success'])

// --- Component State ---
const isModalOpen = ref(false)
const methodToEdit = ref(null)
const addType = ref('BANK_ACCOUNT')
const isLoading = ref(false)

const isEditMode = computed(() => !!methodToEdit.value)
const currentType = computed(() => (isEditMode.value ? methodToEdit.value.type : addType.value))

// --- Zod & VeeValidate ---
const bankSchema = z.object({
  bankName: z.string().min(1, 'ต้องระบุชื่อธนาคาร'),
  accountName: z.string().min(1, 'ต้องระบุชื่อบัญชี'),
  accountNumber: z.string().min(1, 'ต้องระบุเลขที่บัญชี'),
})
const promptpaySchema = z.object({
  recipientName: z.string().min(1, 'ต้องระบุชื่อผู้รับเงิน'),
  promptpayNumber: z.string().min(10, 'หมายเลขพร้อมเพย์ไม่ถูกต้อง'),
})

// Dynamic schema based on the current context
const validationSchema = computed(() => {
  return toTypedSchema(currentType.value === 'BANK_ACCOUNT' ? bankSchema : promptpaySchema)
})

const { handleSubmit, resetForm, defineField } = useForm({
  validationSchema: validationSchema,
})

const [bankName, bankNameAttrs] = defineField('bankName')
const [accountName, accountNameAttrs] = defineField('accountName')
const [accountNumber, accountNumberAttrs] = defineField('accountNumber')
const [recipientName, recipientNameAttrs] = defineField('recipientName')
const [promptpayNumber, promptpayNumberAttrs] = defineField('promptpayNumber')

// --- Methods ---
const open = (method = null, type = 'BANK_ACCOUNT') => {
  methodToEdit.value = method
  addType.value = type

  // Set initial form values
  if (isEditMode.value) {
    resetForm({ values: method.details })
  } else {
    resetForm()
  }
  isModalOpen.value = true
}

const closeModal = () => (isModalOpen.value = false)

const onFormSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  try {
    if (isEditMode.value) {
      await accountsStore.updateAccount(methodToEdit.value.id, {
        details: values,
      })
    } else {
      await accountsStore.createAccount({
        type: currentType.value,
        details: values,
      })
    }
    emit('success')
    closeModal()
  } finally {
    isLoading.value = false
  }
})

const thaiBanks = [
  { value: 'ธนาคารกสิกรไทย', label: 'ธนาคารกสิกรไทย (KBANK)' },
  { value: 'ธนาคารไทยพาณิชย์', label: 'ธนาคารไทยพาณิชย์ (SCB)' },
  { value: 'ธนาคารกรุงเทพ', label: 'ธนาคารกรุงเทพ (BBL)' },
  { value: 'ธนาคารกรุงไทย', label: 'ธนาคารกรุงไทย (KTB)' },
  { value: 'ธนาคารกรุงศรีอยุธยา', label: 'ธนาคารกรุงศรีอยุธยา (BAY)' },
  { value: 'ธนาคารทหารไทยธนชาต', label: 'ธนาคารทหารไทยธนชาต (TTB)' },
  { value: 'ธนาคารออมสิน', label: 'ธนาคารออมสิน (GSB)' },
  { value: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร', label: 'ธ.ก.ส. (BAAC)' },
]

defineExpose({ open })
</script>

<template>
  <BaseModal v-model="isModalOpen" max-width="lg">
    <template #title>
      <span v-if="isEditMode">แก้ไขช่องทางการชำระเงิน</span>
      <span v-else>{{
        currentType === 'BANK_ACCOUNT' ? 'เพิ่มบัญชีธนาคาร' : 'เพิ่มข้อมูลพร้อมเพย์'
      }}</span>
    </template>

    <form id="payment-method-form" class="mt-6 space-y-4" @submit="onFormSubmit">
      <div v-if="currentType === 'BANK_ACCOUNT'">
        <BaseSelect
          v-model="bankName"
          v-bind="bankNameAttrs"
          label="ชื่อธนาคาร"
          :options="thaiBanks"
          placeholder="เลือกธนาคาร"
        />
        <BaseInput
          v-model="accountName"
          v-bind="accountNameAttrs"
          label="ชื่อบัญชี"
          placeholder="ชื่อบัญชีตามหน้าสมุด"
          class="mt-4"
        />
        <BaseInput
          v-model="accountNumber"
          v-bind="accountNumberAttrs"
          label="เลขที่บัญชี"
          placeholder="xxx-x-xxxxx-x"
          class="mt-4"
        />
      </div>

      <div v-if="currentType === 'PROMPTPAY'">
        <BaseInput
          v-model="recipientName"
          v-bind="recipientNameAttrs"
          label="ชื่อผู้รับเงิน"
          placeholder="ชื่อที่แสดงใน PromptPay"
        />
        <BaseInput
          v-model="promptpayNumber"
          v-bind="promptpayNumberAttrs"
          label="หมายเลขพร้อมเพย์"
          placeholder="เบอร์โทรศัพท์ หรือ เลขบัตรประชาชน"
          class="mt-4"
        />
      </div>
    </form>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton variant="secondary" @click="closeModal"> ยกเลิก </BaseButton>
        <BaseButton type="submit" form="payment-method-form" :loading="isLoading">
          {{ isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึก' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
