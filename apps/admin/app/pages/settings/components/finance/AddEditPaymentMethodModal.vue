<script setup>
import { ref, computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useReceivingAccountsStore } from "../../store/receivingAccounts";
import { useDelayedFieldError } from "~/composables/useFieldError";
import BaseModal from "~/components/ui/BaseModal.vue";
import BaseInput from "~/components/form/BaseInput.vue";
import BaseButton from "~/components/ui/BaseButton.vue";

const props = defineProps({
  method: { type: Object, default: null },
  addType: { type: String, default: "bank_account" },
});
const emit = defineEmits(["success"]);

const store = useReceivingAccountsStore();
const isModalOpen = ref(false);

const isEditMode = computed(() => !!props.method);
const currentType = computed(() =>
  isEditMode.value ? props.method.type : props.addType
);

// --- Validation ---
const bankAccountSchema = z.object({
  bankName: z.string().min(1, "ต้องระบุชื่อธนาคาร"),
  accountName: z.string().min(1, "ต้องระบุชื่อบัญชี"),
  accountNumber: z.string().min(1, "ต้องระบุเลขที่บัญชี"),
});

const promptPaySchema = z.object({
  recipientName: z.string().min(1, "ต้องระบุชื่อผู้รับเงิน"),
  promptpayNumber: z.string().min(1, "ต้องระบุหมายเลขพร้อมเพย์"),
});

const { handleSubmit, resetForm, defineField } = useForm();

const [bankName] = defineField("bankName");
const [accountName] = defineField("accountName");
const [accountNumber] = defineField("accountNumber");
const [recipientName] = defineField("recipientName");
const [promptpayNumber] = defineField("promptpayNumber");
const bankNameError = useDelayedFieldError("bankName");
const accountNameError = useDelayedFieldError("accountName");
const accountNumberError = useDelayedFieldError("accountNumber");
const recipientNameError = useDelayedFieldError("recipientName");
const promptpayNumberError = useDelayedFieldError("promptpayNumber");

// --- Methods ---
const onSubmit = handleSubmit(async (values) => {
  const data = {
    type: currentType.value,
    details: values,
  };

  let response;
  if (isEditMode.value) {
    response = await store.updateAccount(props.method.id, data);
  } else {
    response = await store.addAccount(data);
  }

  if (response.success) {
    emit("success");
    closeModal();
  }
});

const open = () => {
  if (isEditMode.value) {
    resetForm({ values: props.method.details });
  } else {
    resetForm();
  }
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};
defineExpose({ open });
</script>

<template>
  <BaseModal v-model="isModalOpen" maxWidth="lg" :persistent="true">
    <template #title>
      <span v-if="isEditMode">แก้ไขช่องทางการชำระเงิน</span>
      <span v-else>{{
        currentType === "bank_account"
          ? "เพิ่มบัญชีธนาคาร"
          : "เพิ่มข้อมูลพร้อมเพย์"
      }}</span>
    </template>


    <form
      id="payment-method-form"
      @submit.prevent="onSubmit"
      class="mt-6 space-y-4"
    >
      <div v-if="currentType === 'bank_account'" class="space-y-4">
        <BaseInput
          v-model="bankName"
          label="ชื่อธนาคาร"
          placeholder="เช่น กสิกรไทย"
          :error="bankNameError"
        />
        <BaseInput
          v-model="accountName"
          label="ชื่อบัญชี"
          placeholder="ชื่อบัญชีตามหน้าสมุด"
          :error="accountNameError"
        />
        <BaseInput
          v-model="accountNumber"
          label="เลขที่บัญชี"
          placeholder="xxx-x-xxxxx-x"
          :error="accountNumberError"
        />
      </div>

      <div v-if="currentType === 'promptpay'" class="space-y-4">
        <BaseInput
          v-model="recipientName"
          label="ชื่อผู้รับเงิน"
          placeholder="ชื่อที่แสดงใน PromptPay"
          :error="recipientNameError"
        />
        <BaseInput
          v-model="promptpayNumber"
          label="หมายเลขพร้อมเพย์"
          placeholder="เบอร์โทรศัพท์ หรือ เลขบัตรประชาชน"
          :error="promptpayNumberError"
        />
      </div>
    </form>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton @click="closeModal" variant="secondary"
          >ยกยกเลิก</BaseButton
        >
        <BaseButton
          type="submit"
          form="payment-method-form"
          :loading="store.isLoading"
        >
          {{ isEditMode ? "บันทึกการเปลี่ยนแปลง" : "บันทึก" }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
