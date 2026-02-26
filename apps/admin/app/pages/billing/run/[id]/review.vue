<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useBillingStore } from "~/store/billingStore";
import { useConfirm } from "~/composables/useConfirm";
import { useFormatters } from "~/composables/useFormatters";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue"; // ✨ Import Headless UI Menu
import {
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  EyeIcon
} from "@heroicons/vue/24/outline";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseTable from "~/components/ui/BaseTable.vue";
import { BaseSelect, BaseSearchInput } from "~/components/form";
import dayjs from "dayjs";
import InvoiceDetailModal from "../../components/InvoiceDetailModal.vue";
import { Float } from "@headlessui-float/vue";

// --- Store, Router, Composables ---
const route = useRoute();
const router = useRouter();
const billingStore = useBillingStore();
const runId = route.params.id;
const { show: showConfirm } = useConfirm();
const { currency } = useFormatters();

const { activeRun, invoicesForReview, totalInvoicesForReview, isLoading } =
  storeToRefs(billingStore);

// --- Table & Filter Logic ---
const currentPage = ref(1);
const searchQuery = ref("");
const sortBy = ref("roomNumber_asc");
const sortOptions = [
  { value: "totalAmount_desc", label: "ยอดรวมสูงสุด" },
  { value: "totalAmount_asc", label: "ยอดรวมต่ำสุด" },
  { value: "roomNumber_asc", label: "เลขห้อง (น้อยไปมาก)" },
];

const fetchInvoices = () => {
  billingStore.fetchInvoicesForReview(runId, {
    page: currentPage.value,
    q: searchQuery.value,
    sortBy: sortBy.value,
    // ✨ Tell API to fetch ALL statuses for this run
    status: "all",
  });
};

// Fetch data when filters or page changes
watch([currentPage, searchQuery, sortBy], fetchInvoices, { deep: true });

onMounted(() => {
  const initialSearch = route.query.q;
  if (initialSearch) {
    searchQuery.value = initialSearch;
  }

  fetchInvoices();
  if (!activeRun.value || activeRun.value.id !== runId) {
    billingStore.fetchActiveRun(runId);
  }
});

// ✨ NEW: Computed property for the Smart Button
const readyToSendInvoices = computed(() => {
  return invoicesForReview.value.filter((inv) => inv.isReadyToSend);
});
const readyToSendCount = computed(() => readyToSendInvoices.value.length);

// --- Table Columns ---
// ✨ UPDATED: Added a 'status' column
const columns = [
  { key: "tenantInfo", label: "ผู้เช่า / ห้อง" },
  { key: "status", label: "สถานะ" },
  { key: "utilityCost", label: "ค่าน้ำ-ไฟ", cellClass: "text-center" },
  {
    key: "totalAmount",
    label: "ยอดรวม",
    cellClass: "font-semibold text-right",
  },
  { key: "actions", label: "", cellClass: "text-right" },
];

// --- Status Helpers ---
const getStatusInfo = (invoice) => {
  if (invoice.status !== "DRAFT") {
    const statusMap = {
      UNPAID: {
        label: "ยังไม่ชำระ",
        class: "bg-amber-100 text-amber-800 ring-amber-600/20",
      },
      PAID: {
        label: "ชำระแล้ว",
        class: "bg-green-100 text-green-800 ring-green-600/20",
      },
      OVERDUE: {
        label: "เกินกำหนด",
        class: "bg-red-100 text-red-800 ring-red-600/20",
      },
      CANCELLED: {
        label: "ยกเลิก",
        class: "bg-gray-100 text-gray-800 ring-gray-600/20",
      },
    };
    return (
      statusMap[invoice.status] || {
        label: invoice.status,
        class: "bg-gray-100 text-gray-800",
      }
    );
  }
  // Logic for DRAFT status
  return invoice.isReadyToSend
    ? { label: "พร้อมส่ง", class: "bg-blue-100 text-blue-800 ring-blue-600/20" }
    : {
        label: "รอข้อมูล",
        class: "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
      };
};

// --- Actions ---
// ✨ UPDATED: The sending action is now smarter
const handleSendReadyInvoices = async () => {
  if (readyToSendCount.value === 0) return;

  const confirmed = await showConfirm({
    title: `ยืนยันการส่งใบแจ้งหนี้ ${readyToSendCount.value} ฉบับ`,
    message: `ระบบจะส่งใบแจ้งหนี้ที่ "พร้อมส่ง" เท่านั้น ส่วนที่เหลือจะยังคงอยู่ในสถานะฉบับร่าง`,
    intent: "info",
    confirmText: `ยืนยันและส่ง ${readyToSendCount.value} ฉบับ`,
  });
  if (confirmed) {
    // This store action will need to be updated to target only ready-to-send invoices
    const response = await billingStore.sendReadyInvoices(
      runId,
      readyToSendInvoices.value.map((inv) => inv.id)
    );
    if (response.success) {
      // Re-fetch data to update the view with new statuses
      fetchInvoices();
    }
  }
};

// --- Helper Functions for Template ---
const getUtilityCost = (items) => {
  if (!items) return 0;
  return items
    .filter(
      (item) =>
        item.description.includes("ค่าไฟ") ||
        item.description.includes("ค่าน้ำ")
    )
    .reduce((sum, item) => sum + Number(item.amount), 0);
};

const invoiceDetailModal = ref(null);
const openInvoiceDetailModal = (invoice) => {
  const isEditable = invoice.status === "DRAFT";

  // 2. ส่ง flag `isEditable` เป็น parameter ที่สอง
  invoiceDetailModal.value?.open(invoice, isEditable);
};

const handleSendSingleInvoice = async (invoice) => {
  if (!invoice.isReadyToSend) return;

  const confirmed = await showConfirm({
    title: `ส่งใบแจ้งหนี้ห้อง ${invoice.contract.room.roomNumber}`,
    message: `คุณต้องการยืนยันการส่งใบแจ้งหนี้สำหรับ ${invoice.contract.tenants[0]?.tenant.name} ใช่หรือไม่?`,
    intent: "info",
    confirmText: "ยืนยันและส่ง",
  });

  if (confirmed) {
    // This will require a new store action and API endpoint
    await billingStore.sendSingleInvoice(invoice.id);

    // For now, we simulate success and re-fetch
    fetchInvoices();
  }
};
</script>

<template>
  <div
    class="p-6 md:px-8 bg-white rounded-xl shadow-md min-h-full flex flex-col"
  >
    <header class="mb-4">
      <NuxtLink
        :to="`/billing/run/${runId}`"
        class="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-2 transition-colors"
      >
        <ArrowLeftIcon class="w-5 h-5" />
        กลับไปหน้าสรุปรอบบิล
      </NuxtLink>
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        ตรวจสอบใบแจ้งหนี้
      </h1>
    </header>

    <div
      class="sticky top-0 z-20 bg-white/80 backdrop-blur-sm py-4 -mx-6 md:-mx-8 px-6 md:px-8 border-b border-gray-200"
    >
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <p v-if="activeRun" class="text-lg font-semibold text-gray-800">
            รอบบิล {{ dayjs(activeRun.period).format("MMMM BBBB") }}:
            <span class="text-blue-600"
              >{{ readyToSendCount }} ฉบับพร้อมส่ง</span
            >
          </p>
        </div>
        <div class="mt-4 md:mt-0 flex-shrink-0">
          <BaseButton
            @click="handleSendReadyInvoices"
            :loading="isLoading"
            :disabled="readyToSendCount === 0"
            size="lg"
          >
            <PaperAirplaneIcon class="h-5 w-5 mr-2" />
            ส่งใบแจ้งหนี้ที่พร้อมส่ง ({{ readyToSendCount }})
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="py-4 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <BaseSearchInput
          v-model="searchQuery"
          placeholder="ค้นหาตามชื่อผู้เช่า หรือ เลขห้อง..."
        />
      </div>
      <div class="w-full sm:w-56">
        <BaseSelect
          v-model="sortBy"
          :options="sortOptions"
          label-class="hidden"
        />
      </div>
    </div>

    <div class="flex-1 -mx-6 md:-mx-8">
      <BaseTable
        :columns="columns"
        :items="invoicesForReview"
        :loading="isLoading"
        :total-items="totalInvoicesForReview"
        v-model:currentPage="currentPage"
        row-key="id"
      >
        <template #row="{ item, class: rowClass }">
          <tr
            :class="[
              rowClass,
              !item.isReadyToSend && item.status === 'DRAFT'
                ? 'bg-yellow-50/50 hover:bg-yellow-100/50'
                : 'hover:bg-slate-50',
            ]"
          ></tr>
        </template>

        <template #cell-tenantInfo="{ item }">
          <div class="font-semibold text-gray-900">
            {{ item.contract.tenants[0]?.tenant.name }}
          </div>
          <div class="text-sm text-gray-500">
            ห้อง {{ item.contract.room.roomNumber }}
          </div>
        </template>

        <template #cell-status="{ item }">
          <span
            :class="[
              getStatusInfo(item).class,
              'inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
            ]"
          >
            <ExclamationTriangleIcon
              v-if="!item.isReadyToSend && item.status === 'DRAFT'"
              class="h-3.5 w-3.5"
            />
            {{ getStatusInfo(item).label }}
          </span>
        </template>

        <template #cell-utilityCost="{ item }">
          <span class="text-gray-600">{{
            currency(getUtilityCost(item.items))
          }}</span>
        </template>

        <template #cell-totalAmount="{ item }">
          <span
            class="font-semibold"
            :class="[
              item.status === 'PAID' ? 'text-green-600' : 'text-blue-600',
            ]"
            >{{ currency(item.totalAmount) }}</span
          >
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center justify-end gap-x-2">
            <BaseButton
              @click="openInvoiceDetailModal(item)"
              variant="secondary"
              size="sm"
            >
              <component
                :is="item.status === 'DRAFT' ? PencilSquareIcon : EyeIcon"
                class="h-4 w-4 mr-1.5"
              />
              {{ item.status === "DRAFT" ? "ดู/แก้ไข" : "ดูรายละเอียด" }}
            </BaseButton>

            <Menu
              v-if="item.status === 'DRAFT' && item.isReadyToSend"
              as="div"
              class="relative inline-block text-left"
            >
              <Float
                placement="bottom-end"
                :offset="4"
                portal
              >
                <MenuButton
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <EllipsisVerticalIcon class="h-5 w-5" />
                </MenuButton>
                <MenuItems
                  class="mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div class="py-1">
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="handleSendSingleInvoice(item)"
                        :class="[
                          active ? 'bg-blue-50' : '',
                          'group flex w-full items-center gap-x-3 rounded-md px-4 py-2 text-sm text-blue-700',
                        ]"
                      >
                        <PaperAirplaneIcon class="h-5 w-5" />
                        <span>ส่งใบแจ้งหนี้นี้</span>
                      </button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Float>
            </Menu>
          </div>
        </template>
      </BaseTable>
    </div>
  </div>

  <InvoiceDetailModal ref="invoiceDetailModal" @success="fetchInvoices" />
</template>
