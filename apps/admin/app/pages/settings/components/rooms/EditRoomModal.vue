<script setup>
import { ref, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useNotification } from "~/composables/useNotification";
import { useDelayedFieldError } from "~/composables/useFieldError";
import BaseModal from "~/components/ui/BaseModal.vue";
import BaseSelect from "~/components/form/BaseSelect.vue";
import BaseButton from "~/components/ui/BaseButton.vue";

// --- Props & Emits ---
const props = defineProps({
  room: { type: Object, default: null },
  roomTypes: { type: Array, required: true }, // รับ List ของ RoomType มาจาก Parent
});
const emit = defineEmits(["success"]);
const { showSuccess, showError } = useNotification();

// --- State ---
const isModalOpen = ref(false);
const isLoading = ref(false);

// --- Validation ---
const editRoomSchema = toTypedSchema(
  z.object({
    typeId: z.string({ required_error: "ต้องเลือกประเภทห้อง" }),
  })
);

const { handleSubmit, resetForm, defineField } = useForm({
  validationSchema: editRoomSchema,
});
const [typeId, typeIdAttrs] = defineField("typeId");
const typeIdError = useDelayedFieldError("typeId");

// --- Methods ---
const onSubmit = handleSubmit(async (values) => {
  if (!props.room) return;
  isLoading.value = true;
  try {
    // await $fetch(`/api/rooms/${props.room.id}`, { method: 'PUT', body: values });
    console.log(
      `Updating Room ${props.room.id} with new typeId: ${values.typeId}`
    );
    showSuccess(`อัปเดตห้อง ${props.room.number} สำเร็จ`);
    emit("success", { roomId: props.room.id, ...values });
    closeModal();
  } catch (error) {
    showError("เกิดข้อผิดพลาดในการอัปเดตห้อง");
  } finally {
    isLoading.value = false;
  }
});

const open = () => {
  if (!props.room) return;
  resetForm({
    values: { typeId: props.room.typeId },
  });
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};
defineExpose({ open });

// Computed property สำหรับสร้าง options
const roomTypeOptions = computed(() => {
  return props.roomTypes.map((rt) => ({
    value: rt.id,
    label: rt.name,
  }));
});
</script>

<template>
  <BaseModal v-if="room" v-model="isModalOpen" maxWidth="md" :persistent="true">
    <template #title>แก้ไขห้อง: {{ room.number }}</template>

    <form id="edit-room-form" @submit.prevent="onSubmit" class="mt-4">
      <BaseSelect
        v-model="typeId"
        v-bind="typeIdAttrs"
        label="เปลี่ยนเป็นประเภทห้อง"
        :options="roomTypeOptions"
        :error="typeIdError"
      />
    </form>

    <template #footer>
      <BaseButton @click="closeModal" variant="secondary" class="ml-3">ยกเลิก</BaseButton>
      <BaseButton
        type="submit"
        form="edit-room-form"
        :loading="isLoading"
        class="ml-3"
      >
        บันทึกการเปลี่ยนแปลง
      </BaseButton>
    </template>
  </BaseModal>
</template>
