<script setup>
import { ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useRouter } from "vue-router";
import { useNotification } from "~/composables/useNotification";
import { useContractsStore } from "~/store/contractsStore";
import BaseModal from "~/components/ui/BaseModal.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import { BaseDatePicker, BaseCheckbox } from "~/components/form";
import CurrencyInput from "~/components/form/CurrencyInput.vue";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.locale("th");
dayjs.extend(buddhistEra);

const contractsStore = useContractsStore();
const { showError, showSuccess } = useNotification();
const router = useRouter();
const emit = defineEmits(["success"]);

// --- Component State ---
const isModalOpen = ref(false);
const isLoading = ref(false);
const tenant = ref(null);
const contract = ref(null);

// --- Zod & VeeValidate ---
// ✨ ใช้ ref สำหรับ validationSchema เพื่อให้สามารถอัปเดตได้แบบ dynamic
const validationSchema = ref(toTypedSchema(z.object({})));

const { values, errors, handleSubmit, defineField, resetForm } = useForm({
  validationSchema: validationSchema,
});

const [endDate, endDateAttrs] = defineField("endDate");
const [hasNewTerms, hasNewTermsAttrs] = defineField("hasNewTerms");
const [newRentAmount, newRentAmountAttrs] = defineField("newRentAmount");

// --- Methods ---
const open = (tenantData) => {
  if (!tenantData || !tenantData.activeContract) {
    showError("ไม่พบข้อมูลสัญญาปัจจุบันของผู้เช่า");
    return;
  }
  tenant.value = tenantData;
  contract.value = tenantData.activeContract;

  // ✨ อัปเดต Zod Schema ทุกครั้งที่เปิด Modal
  validationSchema.value = toTypedSchema(
    z
      .object({
        endDate: z.coerce.date({
          required_error: "ต้องระบุวันสิ้นสุดสัญญาใหม่",
        }),
        hasNewTerms: z.boolean().default(() => false),
        // ทำให้ newRentAmount เป็น field บังคับเมื่อ hasNewTerms เป็น true
        newRentAmount: z.preprocess(
          (val) => (val === "" ? undefined : val),
          z.coerce
            .number({ invalid_type_error: "กรุณากรอกค่าเช่า" })
            .positive("ค่าเช่าต้องเป็นบวก")
            .optional()
        ),
      })
      .superRefine((data, ctx) => {
        if (data.hasNewTerms && data.newRentAmount === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["newRentAmount"],
            message: "ต้องระบุค่าเช่าใหม่",
          });
        }
      })
  );

  resetForm({
    values: {
      endDate: dayjs(contract.value.endDate)
        .add(1, "year")
        .format("YYYY-MM-DD"),
      hasNewTerms: false,
      newRentAmount: Number(contract.value.rentAmount),
    },
  });

  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const onFormSubmit = handleSubmit(async (formValues) => {
  isLoading.value = true;
  try {
    let response;
    if (formValues.hasNewTerms) {
      // Logic สำหรับการสร้างสัญญาใหม่พร้อมเงื่อนไข (อาจจะซับซ้อนกว่านี้ในอนาคต)
      // ตอนนี้จะทำการ update สัญญาเดิมด้วยค่าเช่าใหม่
      router.push({
        path: "/tenants",
        query: {
          action: "renew",
          fromContractId: contract.value.id,
          tenantId: tenant.value.id,
        },
      });
      closeModal();
    } else {
      // Logic สำหรับการขยายสัญญาเดิม
      response = await contractsStore.updateContract(contract.value.id, {
        endDate: formValues.endDate,
        status: "ACTIVE",
      });
      if (response?.success) {
        showSuccess("ขยายสัญญาสำเร็จแล้ว");
        emit("success", 'ACTIVE');
        closeModal();
      }
    }
  } catch (error) {
    showError(error);
  } finally {
    isLoading.value = false;
  }
});

defineExpose({ open });
</script>

<template>
  <BaseModal v-model="isModalOpen" maxWidth="lg">
    <template #title>ขยาย / ต่อสัญญา</template>

    <div v-if="tenant && contract" class="mt-4 space-y-6">
      <div>
        <p class="text-sm text-slate-500">สำหรับผู้เช่า:</p>
        <p class="font-semibold text-lg text-slate-800">
          {{ tenant.name }} (ห้อง {{ tenant.roomNumber }})
        </p>
        <p class="text-sm text-slate-500 mt-1">
          สัญญาปัจจุบันจะสิ้นสุดในวันที่:
          <span class="font-semibold text-slate-700">{{
            dayjs(contract.endDate).format("D MMMM BBBB")
          }}</span>
        </p>
      </div>

      <form @submit="onFormSubmit" id="renew-contract-form" class="space-y-4">
        <BaseDatePicker
          v-model="endDate"
          v-bind="endDateAttrs"
          label="วันสิ้นสุดสัญญาใหม่"
          :error="errors.endDate"
        />

        <BaseCheckbox
          v-model="hasNewTerms"
          v-bind="hasNewTermsAttrs"
          label="มีการเปลี่ยนแปลงค่าเช่าหรือเงื่อนไขอื่นๆ"
        />

        <div
          v-if="values.hasNewTerms"
          class="p-4 bg-slate-50 rounded-lg border border-slate-200"
        >
          <p class="text-sm text-slate-600">
            เมื่อกด "ดำเนินการต่อ" ระบบจะนำคุณไปยังหน้าสร้างสัญญาใหม่
            โดยมีข้อมูลเดิมเป็นค่าเริ่มต้น เพื่อให้คุณกำหนดเงื่อนไขใหม่ได้
          </p>
        </div>
      </form>
    </div>

    <template #footer>
      <div class="flex-1 flex justify-end gap-x-3">
        <BaseButton @click="closeModal" variant="secondary">ยกเลิก</BaseButton>
        <BaseButton
          type="submit"
          form="renew-contract-form"
          :loading="isLoading"
        >
          {{
            values.hasNewTerms ? "✓ ยืนยันสัญญาใหม่" : "✓ ยืนยันการขยายสัญญา"
          }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
