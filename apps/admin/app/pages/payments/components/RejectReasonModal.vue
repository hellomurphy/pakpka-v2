<script setup>
import { ref } from "vue";
import BaseModal from "~/components/ui/BaseModal.vue";
import BaseButton from "~/components/ui/BaseButton.vue";

const isOpen = ref(false);
const reason = ref("");
const resolvePromise = ref(null);

// เหตุผลที่พบบ่อย
const commonReasons = [
  "ยอดเงินไม่ถูกต้อง",
  "สลิปไม่ชัดเจน",
  "แนบสลิปซ้ำ",
  "ไม่พบรายการ",
];

const open = () => {
  reason.value = ""; // รีเซ็ตค่าทุกครั้งที่เปิด
  isOpen.value = true;
  return new Promise((resolve) => {
    resolvePromise.value = resolve;
  });
};

const handleConfirm = () => {
  if (resolvePromise.value) {
    resolvePromise.value(reason.value || "ไม่ระบุเหตุผล");
  }
  isOpen.value = false;
};

const handleCancel = () => {
  if (resolvePromise.value) {
    resolvePromise.value(null); // ส่งค่า null เมื่อยกเลิก
  }
  isOpen.value = false;
};

const selectReason = (selected) => {
  reason.value = selected;
};

defineExpose({ open });
</script>

<template>
  <BaseModal v-model="isOpen" max-width="md">
    <template #title>เหตุผลที่ปฏิเสธการชำระเงิน</template>

    <div class="mt-4 space-y-4">
      <p class="text-sm text-slate-500">
        โปรดระบุเหตุผลเพื่อให้ผู้เช่าทราบและดำเนินการแก้ไข (ไม่บังคับ)
      </p>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="r in commonReasons"
          :key="r"
          @click="selectReason(r)"
          class="px-3 py-1 text-xs rounded-full transition-colors"
          :class="[
            reason === r
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
          ]"
        >
          {{ r }}
        </button>
      </div>

      <textarea
        v-model="reason"
        rows="3"
        placeholder="หรือพิมพ์เหตุผลอื่นๆ..."
        class="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
      ></textarea>
    </div>

    <template #footer>
      <div class="flex-1 flex justify-end gap-x-3">
        <BaseButton @click="handleCancel" variant="secondary"
          >ยกเลิก</BaseButton
        >
        <BaseButton @click="handleConfirm" variant="danger"
          >ยืนยันการปฏิเสธ</BaseButton
        >
      </div>
    </template>
  </BaseModal>
</template>
