<script setup>
import { ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useContractsStore } from "~/store/contractsStore";
import { useFormatters } from "~/composables/useFormatters";
import BaseModal from "~/components/ui/BaseModal.vue";
import BaseInput from "~/components/form/BaseInput.vue";
import CurrencyInput from "~/components/form/CurrencyInput.vue";
import BaseButton from "~/components/ui/BaseButton.vue";

const emit = defineEmits(["success"]);
const contractsStore = useContractsStore();
const { shortDate } = useFormatters();

// --- State ---
const isModalOpen = ref(false);
const isLoading = ref(false);
const tenantInfo = ref(null); // เก็บข้อมูลผู้เช่าและสัญญา

// --- Validation ---
const finalizeMoveOutSchema = toTypedSchema(
  z.object({
    deductions: z.coerce.number().min(0, "ต้องไม่ติดลบ").default(0),
    deductionNotes: z.string().optional().or(z.literal("")),
  })
);

const { handleSubmit, resetForm, defineField, errors } = useForm({
  validationSchema: finalizeMoveOutSchema,
});

const [deductions, deductionsAttrs] = defineField("deductions");
const [deductionNotes, deductionNotesAttrs] = defineField("deductionNotes");

// --- Methods ---
const onSubmit = handleSubmit(async (formValues) => {
  console.log(tenantInfo.value)
  if (!tenantInfo.value?.activeContract?.id) return;
  isLoading.value = true;

  const contractId = tenantInfo.value.activeContract.id;
  const success = await contractsStore.finalizeMoveOut(contractId, formValues);

  if (success) {
    emit("success", "MOVED_OUT");
    closeModal();
  }

  isLoading.value = false;
});

const open = (tenant) => {
  tenantInfo.value = tenant;
  resetForm({
    values: {
      deductions: 0,
      deductionNotes: "",
    },
  });
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};
defineExpose({ open });
</script>

<template>
  <BaseModal v-if="tenantInfo" v-model="isModalOpen" maxWidth="lg" :persistent="true">
    <template #title> จัดการการย้ายออก: {{ tenantInfo.name }} </template>

    <div class="mt-4">
      <form id="finalize-form" @submit.prevent="onSubmit" class="space-y-4">
        <div class="p-4 bg-slate-50 rounded-lg text-sm">
          <p>
            <span class="font-medium">ห้อง:</span> {{ tenantInfo.roomNumber }}
          </p>
          <p>
            <span class="font-medium">กำหนดสิ้นสุดสัญญา:</span>
            {{ shortDate(tenantInfo.contractEndDate) }}
          </p>
        </div>
        <CurrencyInput
          v-model="deductions"
          v-bind="deductionsAttrs"
          label="ยอดหักจากเงินประกัน (บาท)"
          :error="errors.deductions"
        />
        <BaseInput
          v-model="deductionNotes"
          v-bind="deductionNotesAttrs"
          label="หมายเหตุการหักเงิน"
          placeholder="เช่น ค่าซ่อมแซม, ค่าทำความสะอาด"
          :error="errors.deductionNotes"
        />
      </form>
    </div>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton @click="closeModal" variant="secondary">ยกเลิก</BaseButton>
        <BaseButton
          type="submit"
          form="finalize-form"
          :loading="isLoading"
          variant="primary"
        >
          ยืนยันการย้ายออก
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
