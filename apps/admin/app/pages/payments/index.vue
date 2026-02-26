<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { usePaymentsStore } from "~/store/paymentsStore";
import { usePropertyStore } from "~/store/propertyStore";
import PaymentList from "./components/PaymentList.vue";
import PaymentDetail from "./components/PaymentDetail.vue";
import RejectReasonModal from "./components/RejectReasonModal.vue"; // ✨ 1. Import component ใหม่
import BaseButton from "~/components/ui/BaseButton.vue";
import { SparklesIcon } from "@heroicons/vue/24/outline";

// --- Store Connections ---
const paymentsStore = usePaymentsStore();
const propertyStore = usePropertyStore();
const { pendingPayments, isLoading, totalPending, itemsPerPage } =
  storeToRefs(paymentsStore);
const { propertyId } = storeToRefs(propertyStore);

// --- State ---
const selectedPayment = ref(null);
const currentPage = ref(1);
const rejectModal = ref(null); // ✨ 2. สร้าง ref สำหรับ Modal

const config = useRuntimeConfig();
const isDemoMode = computed(() => config.public.appMode === "demo");

// --- Data Fetching ---
watch(
  [currentPage, propertyId],
  () => {
    if (propertyId.value) {
      paymentsStore.fetchPendingPayments({
        propertyId: propertyId.value,
        page: currentPage.value,
      });
    }
  },
  { immediate: true }
);

watch(pendingPayments, (newList) => {
  if (
    !selectedPayment.value ||
    !newList.some((p) => p.id === selectedPayment.value.id)
  ) {
    selectedPayment.value = newList[0] || null;
  }
});

// --- Action Handling ---
const handlePaymentAction = async ({ paymentId, action }) => {
  const actedPaymentIndex = pendingPayments.value.findIndex(
    (p) => p.id === paymentId
  );
  if (actedPaymentIndex === -1) return;

  // --- Optimistic UI Part 1: Remove item and store it for potential rollback ---
  const removedPayment = pendingPayments.value.splice(actedPaymentIndex, 1)[0];
  totalPending.value--; // ✨ 4. อัปเดตจำนวนที่ต้องตรวจทันที

  // Select the next available item
  selectedPayment.value =
    pendingPayments.value[actedPaymentIndex] ||
    pendingPayments.value[pendingPayments.value.length - 1] ||
    null;

  // --- Call API in the background ---
  if (action === "approve") {
    await paymentsStore.approvePayment(paymentId);
  } else if (action === "reject") {
    const reason = await rejectModal.value?.open();

    if (reason !== null) {
      // User confirmed with a reason
      await paymentsStore.rejectPayment(paymentId, reason);
    } else {
      // User canceled the modal
      // --- Optimistic UI Part 2: Rollback ---
      // Add the item back to the list and re-select it
      pendingPayments.value.splice(actedPaymentIndex, 0, removedPayment);
      totalPending.value++;
      selectedPayment.value = removedPayment;
      return; // Stop execution to prevent re-fetch
    }
  }

  // --- Re-fetch for 100% data consistency ---
  await paymentsStore.fetchPendingPayments({
    propertyId: propertyId.value,
    page: currentPage.value,
  });

  // ✨ Auto-navigate back to list on mobile after successful action
  if (window.innerWidth < 768) {
    selectedPayment.value = null;
  }
};

const handleGenerateDemo = async () => {
  await paymentsStore.generateDemoPayments();
  await paymentsStore.fetchPendingPayments({
    propertyId: propertyId.value,
    page: currentPage.value,
  });
};
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50">
    <header
      class="flex-shrink-0 p-6 md:px-8 bg-white border-b border-slate-200 md:flex md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          ตรวจสอบการชำระเงิน
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          มี
          <span class="font-bold text-blue-600">{{ totalPending }}</span>
          รายการที่ต้องตรวจสอบ
        </p>
      </div>

      <div class="mt-4 md:mt-0">
        <div v-if="isDemoMode">
          <BaseButton @click="handleGenerateDemo" variant="secondary">
            <SparklesIcon class="h-5 w-5 mr-2 text-yellow-500" />
            สร้างข้อมูลทดสอบ
          </BaseButton>
        </div>
      </div>
    </header>

    <div class="flex-1 flex flex-col md:flex-row min-h-0">
      <PaymentList
        :payments="pendingPayments"
        :selected-payment-id="selectedPayment?.id"
        :is-loading="isLoading"
        :total-pages="Math.ceil(totalPending / itemsPerPage)"
        v-model:current-page="currentPage"
        @select="selectedPayment = $event"
        class="md:flex"
        :class="selectedPayment ? 'hidden md:flex' : 'flex'"
      />
      <PaymentDetail
        :payment="selectedPayment"
        @action="handlePaymentAction"
        @back="selectedPayment = null"
        class="md:flex"
        :class="selectedPayment ? 'flex' : 'hidden md:flex'"
      />
    </div>

    <RejectReasonModal ref="rejectModal" />
    <QRScannerModal ref="qrScannerModal" @scanned="handleQRScanned" />
  </div>
</template>
