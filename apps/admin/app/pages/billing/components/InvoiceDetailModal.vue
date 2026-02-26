<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useFormatters } from "~/composables/useFormatters";
import { useServicesStore } from "~/store/servicesStore";
import { usePropertyStore } from "~/store/propertyStore";
import { useInvoicesStore } from "~/store/invoicesStore";
import { useNotification } from "~/composables/useNotification";
import BaseModal from "~/components/ui/BaseModal.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import { BaseSelect, CurrencyInput, BaseInput } from "~/components/form";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckIcon,
} from "@heroicons/vue/24/solid";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.locale("th");
dayjs.extend(buddhistEra);

const emit = defineEmits(["success"]);

// --- Stores & Composables ---
const servicesStore = useServicesStore();
const propertyStore = usePropertyStore();
const invoicesStore = useInvoicesStore();
const notify = useNotification();
const { services: serviceCatalog } = storeToRefs(servicesStore);
const { propertyId } = storeToRefs(propertyStore);
const { isLoading } = storeToRefs(invoicesStore);
const { currency, fullDate } = useFormatters();

// --- State ---
const isModalOpen = ref(false);
const invoiceData = ref(null);
const isAddingItem = ref(false);
const isEditable = ref(false); // State สำหรับควบคุมโหมด ดู/แก้ไข

const newItem = ref({
  description: "",
  amount: 0,
});

// --- Methods ---
const open = async (invoice, editable = false) => {
  if (!invoice || !invoice.id) return;

  isEditable.value = editable;
  isModalOpen.value = true;

  // ✨ Fetch ข้อมูลแบบเต็มจาก API
  try {
    const response = await useApiFetch(`/api/invoices/${invoice.id}`, {
      showNotification: false,
    });

    if (response.success) {
      invoiceData.value = response.data;
    } else {
      notify.showError("ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้");
      closeModal();
      return;
    }
  } catch (error) {
    console.error("Error fetching invoice:", error);
    notify.showError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    closeModal();
    return;
  }

  if (editable) {
    // ถ้าอยู่ในโหมดแก้ไข, ให้ดึง Service Catalog มาเตรียมไว้
    servicesStore.fetchServices(propertyId.value);
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  isAddingItem.value = false;
};
defineExpose({ open });

// คำนวณยอดรวมใหม่ทุกครั้งที่มีการเปลี่ยนแปลงรายการ
const recalculateTotal = () => {
  if (!invoiceData.value) return;
  invoiceData.value.totalAmount = invoiceData.value.items.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
};

const handleAddItem = () => {
  if (!newItem.value.description || newItem.value.amount <= 0) {
    notify.showError("กรุณากรอกรายละเอียดและจำนวนเงินให้ถูกต้อง");
    return;
  }
  invoiceData.value.items.push({
    id: `temp-${Date.now()}`, // ID ชั่วคราวสำหรับ v-for
    ...newItem.value,
  });
  recalculateTotal();
  newItem.value = { description: "", amount: 0 };
  isAddingItem.value = false;
};

const handleRemoveItem = (itemId) => {
  invoiceData.value.items = invoiceData.value.items.filter(
    (item) => item.id !== itemId
  );
  recalculateTotal();
};

const handleSaveChanges = async () => {
  if (!invoiceData.value) return;
  const response = await invoicesStore.updateInvoice(invoiceData.value.id, {
    items: invoiceData.value.items.map((item) => ({
      // ส่ง ID ไปด้วยถ้าไม่ใช่รายการที่เพิ่งเพิ่ม (ไม่มี `temp-`)
      id: item.id.startsWith("temp-") ? undefined : item.id,
      description: item.description,
      amount: item.amount,
    })),
    totalAmount: invoiceData.value.totalAmount,
  });

  if (response.success) {
    emit("success");
    closeModal();
  }
};
</script>

<template>
  <BaseModal v-model="isModalOpen" maxWidth="lg">
    <template #title>
      <span v-if="invoiceData">
        {{ isEditable ? "แก้ไข" : "รายละเอียด" }}ใบแจ้งหนี้: ห้อง
        {{ invoiceData.contract.room.roomNumber }}
      </span>
    </template>

    <div v-if="invoiceData" class="mt-4">
      <div class="p-4 bg-slate-50 rounded-lg grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-gray-500">ผู้เช่า</p>
          <p class="font-semibold text-gray-800">
            {{ invoiceData.contract.tenants[0]?.tenant.name }}
          </p>
        </div>
        <div>
          <p class="text-gray-500">รอบบิล</p>
          <p class="font-semibold text-gray-800">
            {{ dayjs(invoiceData.period).format("MMMM BBBB") }}
          </p>
        </div>
      </div>

      <div class="mt-4">
        <h4 class="font-semibold text-gray-800 mb-2">รายการ</h4>
        <div class="space-y-2 border-t border-b divide-y divide-gray-100">
          <div
            v-for="item in invoiceData.items"
            :key="item.id"
            class="flex justify-between items-center py-2"
          >
            <p class="text-sm text-gray-700">{{ item.description }}</p>
            <div class="flex items-center gap-x-2">
              <p class="text-sm font-medium text-gray-900">
                {{ currency(item.amount) }}
              </p>

              <template v-if="isEditable">
                <button
                  v-if="
                    item.description.includes('ค่าไฟ') ||
                    item.description.includes('ค่าน้ำ')
                  "
                  class="p-1 rounded-full hover:bg-blue-100 text-blue-500"
                  title="แก้ไขเลขมิเตอร์"
                >
                  <PencilSquareIcon class="h-4 w-4" />
                </button>
                <button
                  v-else-if="!item.description.includes('ค่าเช่า')"
                  @click="handleRemoveItem(item.id)"
                  class="p-1 rounded-full hover:bg-red-100 text-red-500"
                  title="ลบรายการ"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isEditable" class="mt-2">
        <div
          v-if="isAddingItem"
          class="mt-3 p-3 bg-slate-50 rounded-lg space-y-3 border border-dashed"
        >
          <BaseInput
            v-model="newItem.description"
            label="รายละเอียดรายการ"
            placeholder="เช่น ค่าปรับ..."
          />
          <CurrencyInput v-model="newItem.amount" label="จำนวนเงิน (บาท)" />
          <div class="flex justify-end gap-x-2 pt-2">
            <BaseButton
              @click="isAddingItem = false"
              variant="secondary"
              size="sm"
              >ยกเลิก</BaseButton
            >
            <BaseButton @click="handleAddItem" size="sm"
              >เพิ่มรายการ</BaseButton
            >
          </div>
        </div>
        <div v-else class="mt-2">
          <BaseButton
            @click="isAddingItem = true"
            variant="secondary"
            size="sm"
            :icon="PlusIcon"
          >
            เพิ่มรายการ
          </BaseButton>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t-2 border-dashed">
        <div class="flex justify-between items-baseline">
          <span class="text-lg font-bold text-gray-900">ยอดรวมสุทธิ</span>
          <span class="text-2xl font-bold text-blue-600">{{
            currency(invoiceData.totalAmount)
          }}</span>
        </div>
        <p class="text-right text-sm text-gray-500 mt-1">
          กำหนดชำระ: {{ fullDate(invoiceData.dueDate) }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="w-full flex justify-end gap-x-3">
        <BaseButton @click="closeModal" variant="secondary">
          {{ isEditable ? "ยกเลิก" : "ปิด" }}
        </BaseButton>
        <BaseButton
          v-if="isEditable"
          @click="handleSaveChanges"
          :loading="isLoading"
        >
          บันทึกการแก้ไข
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
