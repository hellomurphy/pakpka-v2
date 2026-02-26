<script setup>
import { ref, computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useInvoicesStore } from "~/store/invoicesStore";
import BaseModal from "~/components/ui/BaseModal.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import { BoltIcon, CloudIcon } from "@heroicons/vue/24/outline";

const emit = defineEmits(["success"]);
const invoicesStore = useInvoicesStore();

const isModalOpen = ref(false);
const readingData = ref(null); // State สำหรับเก็บข้อมูล

// --- Validation ---
const { handleSubmit, defineField, resetForm, errors } = useForm();
const [newValue, newValueAttrs] = defineField("newValue");

// --- Methods ---
const onSubmit = handleSubmit(async (values) => {
  if (!readingData.value) return;

  const response = await invoicesStore.updateMeterReading(
    readingData.value.meterReadingId,
    { readingValue: values.newValue }
  );

  if (response.success) {
    emit("success");
    closeModal();
  }
});

const open = (data) => {
  readingData.value = { ...data };
  // สร้าง Zod schema แบบ dynamic เพื่อ validate ว่าเลขใหม่ต้องไม่น้อยกว่าเลขเก่า
  const schema = toTypedSchema(
    z.object({
      newValue: z.coerce
        .number()
        .min(
          data.oldValue,
          `เลขมิเตอร์ใหม่ต้องไม่น้อยกว่าครั้งก่อน (${data.oldValue})`
        ),
    })
  );
  resetForm({ validationSchema: schema, values: { newValue: data.newValue } });
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};
defineExpose({ open });

const utilityInfo = computed(() => {
  if (readingData.value?.utilityType === "ELECTRICITY") {
    return { label: "ค่าไฟฟ้า", icon: BoltIcon, iconClass: "text-yellow-500" };
  }
  return { label: "ค่าน้ำประปา", icon: CloudIcon, iconClass: "text-sky-500" };
});
</script>

<template>
  <BaseModal v-if="readingData" v-model="isModalOpen" maxWidth="md">
    <template #title> แก้ไขการจดมิเตอร์: {{ utilityInfo.label }} </template>
    <div class="mt-4">
      <p class="text-sm text-gray-600 mb-4">
        ห้อง: <span class="font-semibold">{{ readingData.roomNumber }}</span>
      </p>
      <form id="edit-meter-form" @submit.prevent="onSubmit">
        <div class="flex items-center gap-3">
          <div class="flex-1 text-center bg-gray-100 rounded-lg p-3">
            <p class="text-xs text-gray-500">ครั้งก่อน</p>
            <p class="text-lg font-mono text-gray-700">
              {{ readingData.oldValue }}
            </p>
          </div>
          <p class="text-2xl text-gray-300">→</p>
          <div class="flex-1">
            <input
              type="number"
              v-model.number="newValue"
              v-bind="newValueAttrs"
              class="w-full text-center rounded-lg border-gray-300 shadow-sm text-lg p-3"
            />
          </div>
        </div>
        <p v-if="errors.newValue" class="mt-2 text-sm text-red-600">
          {{ errors.newValue }}
        </p>
      </form>
    </div>
    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton @click="closeModal" variant="secondary">ยกเลิก</BaseButton>
        <BaseButton
          type="submit"
          form="edit-meter-form"
          :loading="invoicesStore.isLoading"
        >
          บันทึกและคำนวณใหม่
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
