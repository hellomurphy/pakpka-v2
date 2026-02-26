<script setup>
import { ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useStaffStore } from "../../store/staffStore";
import { useNotification } from "~/composables/useNotification";
import { useDelayedFieldError } from "~/composables/useFieldError";
import BaseModal from "~/components/ui/BaseModal.vue";
import BaseInput from "~/components/form/BaseInput.vue";
import BaseSelect from "~/components/form/BaseSelect.vue";
import BaseButton from "~/components/ui/BaseButton.vue";

const staffStore = useStaffStore();
const notify = useNotification();
const emit = defineEmits(["success"]);

// --- Component State ---
const isModalOpen = ref(false);
const isLoading = ref(false);
const invitationLink = ref(null);

const roleOptions = [
  { value: "ADMIN", label: "ผู้ดูแลระบบ (Admin)" },
  { value: "STAFF", label: "พนักงาน (Staff)" },
];

// --- ✨ 1. VeeValidate & Zod ---
const validationSchema = toTypedSchema(
  z.object({
    nameForReference: z.string().min(1, "ต้องระบุชื่อสำหรับอ้างอิง"),
    role: z.enum(["ADMIN", "STAFF"], {
      required_error: "ต้องกำหนดบทบาท",
    }),
  })
);

const { handleSubmit, resetForm, defineField } = useForm({
  validationSchema,
  initialValues: {
    role: "STAFF", // ค่าเริ่มต้น
  },
});

const [nameForReference, nameForReferenceAttrs] =
  defineField("nameForReference");
const [role, roleAttrs] = defineField("role");
const nameForReferenceError = useDelayedFieldError("nameForReference");
const roleError = useDelayedFieldError("role");

// --- Methods ---
const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  try {
    // ✨ 2. เรียกใช้ Store Action ด้วย Format ที่ถูกต้อง
    const response = await staffStore.createInvitation(values);

    if (response.success && response.data) {
      const fullUrl = new URL(window.location.origin);
      fullUrl.pathname = `/invite/${response.data.id}`;
      invitationLink.value = fullUrl.href;
      emit("success");
    }
  } finally {
    isLoading.value = false;
  }
});

const copyLink = () => {
  if (!invitationLink.value) return;
  navigator.clipboard.writeText(invitationLink.value);
  notify.showSuccess("คัดลอกลิงก์แล้ว!");
};

const inviteAnother = () => {
  // รีเซ็ตฟอร์มเพื่อเชิญคนถัดไป
  resetForm();
  invitationLink.value = null;
};

const open = () => {
  resetForm();
  invitationLink.value = null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

defineExpose({ open });
</script>

<template>
  <BaseModal v-model="isModalOpen" maxWidth="lg">
    <template #title>เชิญทีมงานใหม่</template>

    <form
      v-if="!invitationLink"
      @submit="onSubmit"
      id="invite-staff-form"
      class="mt-6 space-y-4"
    >
      <BaseInput
        v-model="nameForReference"
        v-bind="nameForReferenceAttrs"
        label="ชื่อพนักงาน (สำหรับอ้างอิง)"
        placeholder="สมศักดิ์ ทำงานดี"
        :error="nameForReferenceError"
        required
      />
      <BaseSelect
        v-model="role"
        v-bind="roleAttrs"
        label="กำหนดบทบาท (Role)"
        :options="roleOptions"
        :error="roleError"
        required
      />
    </form>

    <div v-else class="mt-4">
      <h3 class="text-base font-semibold text-green-700">
        สร้างลิงก์คำเชิญสำเร็จ!
      </h3>
      <p class="mt-2 text-sm text-gray-600">
        กรุณาส่งลิงก์ด้านล่างนี้ให้ทีมงานของคุณ ลิงก์นี้จะหมดอายุใน 7 วัน
      </p>
      <div class="mt-4 flex items-center gap-2 rounded-md bg-slate-100 p-3">
        <p class="text-sm text-gray-800 truncate">{{ invitationLink }}</p>
        <BaseButton @click="copyLink" size="sm">คัดลอก</BaseButton>
      </div>
    </div>

    <template #footer>
      <div
        v-if="invitationLink"
        class="w-full flex justify-between items-center"
      >
        <BaseButton @click="inviteAnother" variant="secondary"
          >เชิญคนถัดไป</BaseButton
        >
        <BaseButton @click="closeModal">ปิด</BaseButton>
      </div>
      <div v-else class="w-full flex justify-end gap-x-3">
        <BaseButton @click="closeModal" variant="secondary">ยกเลิก</BaseButton>
        <BaseButton type="submit" form="invite-staff-form" :loading="isLoading"
          >สร้างลิงก์</BaseButton
        >
      </div>
    </template>
  </BaseModal>
</template>
