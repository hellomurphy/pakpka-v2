<script setup>
import { ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import BaseModal from "~/components/ui/BaseModal.vue";
import BaseDatePicker from "~/components/form/BaseDatePicker.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import dayjs from "dayjs";
import { useContractsStore } from "~/store/contractsStore";

const emit = defineEmits(["success"]);

const contractsStore = useContractsStore();

const isModalOpen = ref(false);
const isLoading = ref(false);
const contractInfo = ref(null);

const schema = toTypedSchema(
  z.object({
    noticeDate: z.coerce
      .date({ required_error: "กรุณาเลือกวันที่แจ้งย้ายออก" })
      .min(new Date(), { message: "วันที่ต้องไม่ใช่วันในอดีต" }),
  })
);

const { handleSubmit, defineField, resetForm, errors } = useForm({
  validationSchema: schema,
});
const [noticeDate, noticeDateAttrs] = defineField("noticeDate");

const onSubmit = handleSubmit(async (values) => {
  const isSuccess = await contractsStore.giveNoticeOfMoveOut(
    contractInfo.value.activeContract.id,
    values.noticeDate
  );

  if (isSuccess) {
    emit("success", "NOTICE_GIVEN");
    closeModal();
  }
});

const open = (tenant) => {
  if (!tenant) return;
  contractInfo.value = tenant;
  resetForm({
    values: {
      noticeDate: dayjs(tenant.activeContract.endDate)
        .toISOString()
        .split("T")[0],
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
  <BaseModal v-model="isModalOpen" maxWidth="md" :persistent="true">
    <template #title>
      แจ้งย้ายออกสำหรับ: {{ contractInfo?.tenantName }} (ห้อง
      {{ contractInfo?.roomNumber }})
    </template>

    <form id="notice-form" @submit.prevent="onSubmit" class="mt-4">
      <BaseDatePicker
        v-model="noticeDate"
        v-bind="noticeDateAttrs"
        label="วันที่กำหนดจะย้ายออก"
        :error="errors.noticeDate"
      />
    </form>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton @click="closeModal" variant="secondary">ยกเลิก</BaseButton>
        <BaseButton type="submit" form="notice-form" :loading="isLoading">
          ยืนยันการแจ้งย้ายออก
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
