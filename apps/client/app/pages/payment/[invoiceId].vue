<template>
  <div class="bg-slate-50 flex flex-col min-h-screen">
    <!-- Loading State -->
    <div v-if="isLoadingInvoice" class="flex items-center justify-center pt-20">
      <div class="text-center">
        <Icon
          name="ph:spinner-duotone"
          class="text-4xl text-slate-400 animate-spin mb-3"
        />
        <p class="text-slate-500">กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center pt-20 px-4">
      <div class="text-center max-w-md">
        <Icon name="ph:warning-circle-duotone" class="text-6xl text-red-500 mb-4" />
        <h3 class="text-xl font-bold text-slate-800 mb-2">เกิดข้อผิดพลาด</h3>
        <p class="text-slate-600 mb-4">{{ error }}</p>
        <NuxtLink
          to="/dashboard"
          class="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          กลับหน้าหลัก
        </NuxtLink>
      </div>
    </div>

    <!-- Main Content -->
    <main v-else-if="invoice" class="flex-grow pb-32">
      <!-- Invoice Summary -->
      <div class="bg-white border-b border-slate-200 p-4">
        <div class="max-w-md mx-auto">
          <h2 class="text-lg font-bold text-slate-800 mb-2">รายละเอียดการชำระเงิน</h2>
          <div class="bg-indigo-50 rounded-lg p-4">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-slate-600">ห้อง {{ invoice.roomNumber }}</p>
                <p class="text-xs text-slate-500">{{ invoice.period }}</p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-indigo-600">
                  {{ formatNumber(invoice.totalAmount) }}
                </p>
                <p class="text-xs text-slate-600">บาท</p>
              </div>
            </div>
            <div v-if="invoice.dueDate" class="text-xs text-slate-600">
              กำหนดชำระ: {{ formatDate(invoice.dueDate) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Method: Bank Transfer (Simple for now) -->
      <div class="p-4">
        <div class="max-w-md mx-auto">
          <h3 class="text-lg font-bold text-slate-800 mb-3">วิธีการชำระเงิน</h3>
          <div class="bg-white rounded-xl border-2 border-indigo-500 p-4 mb-4">
            <div class="flex items-center">
              <Icon name="ph:bank-duotone" class="text-3xl text-indigo-500" />
              <div class="ml-3">
                <p class="font-semibold text-slate-700">โอนเงินผ่านธนาคาร</p>
                <p class="text-xs text-slate-500">อัปโหลดสลิปเพื่อยืนยันการชำระเงิน</p>
              </div>
            </div>
          </div>

          <h3 class="font-bold text-slate-800 mb-3">อัปโหลดหลักฐานการโอนเงิน</h3>
          <FileUpload v-model="slipUrl" @file-selected="handleFileSelected" />
        </div>
      </div>
    </main>

    <!-- Footer Actions -->
    <footer
      v-if="invoice && !isLoadingInvoice"
      class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 p-4"
    >
      <div class="max-w-md mx-auto">
        <button
          :disabled="!canSubmit || isSubmitting"
          class="w-full font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          :class="
            canSubmit
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-slate-200 text-slate-500'
          "
          @click="submitPayment"
        >
          <Icon
            v-if="isSubmitting"
            name="ph:spinner-duotone"
            class="animate-spin h-5 w-5"
          />
          <template v-else>
            <Icon name="heroicons:lock-closed-20-solid" class="h-5 w-5" />
            <span>ยืนยันการชำระเงิน {{ formatNumber(invoice.totalAmount) }} บาท</span>
          </template>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import FileUpload from "~/components/FileUpload.vue";

definePageMeta({
  title: "ชำระเงิน",
  headerVariant: "page",
  showFooter: false,
});

// --- Route & API ---
const route = useRoute();
const router = useRouter();
const api = useApi();
const invoiceId = route.params.invoiceId as string;

// --- States ---
const invoice = ref<any>(null);
const slipUrl = ref<string>("");
const uploadedFile = ref<File | null>(null);
const isLoadingInvoice = ref(true);
const isSubmitting = ref(false);
const error = ref<string>("");

// --- Utils ---
const { formatNumber } = useNumberFormat();

// --- Computed ---
const canSubmit = computed(() => {
  return !!slipUrl.value;
});

// --- Methods ---
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const handleFileSelected = (file: File | null) => {
  uploadedFile.value = file;
  console.log("File selected:", file?.name);
};

const submitPayment = async () => {
  if (!canSubmit.value) return;

  isSubmitting.value = true;

  try {
    // Simulate upload (in real app, upload to cloud storage first)
    let finalSlipUrl = slipUrl.value;

    if (uploadedFile.value) {
      // In a real app, upload to cloud storage (Cloudinary, S3, etc.)
      // For now, we'll use a placeholder URL
      finalSlipUrl = `https://example.com/slips/${Date.now()}-${uploadedFile.value.name}`;
      console.log("📤 Simulated upload:", finalSlipUrl);
    }

    // Prepare payment data
    const paymentData = {
      invoiceId: invoice.value.id,
      amount: invoice.value.totalAmount,
      paymentDate: new Date().toISOString(),
      paymentMethod: "BANK_TRANSFER",
      slipUrl: finalSlipUrl,
      notes: "ชำระผ่านการโอนเงินผ่านธนาคาร",
    };

    console.log("💳 Submitting payment:", paymentData);

    // Submit to backend
    const response = await api.payments.submit(paymentData);

    console.log("✅ Payment submitted successfully:", response);

    // Show success and redirect
    router.push(`/payment/status/success?invoiceId=${invoice.value.id}`);
  } catch (err: any) {
    console.error("❌ Payment submission failed:", err);
    error.value = err.data?.message || "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง";
  } finally {
    isSubmitting.value = false;
  }
};

// --- Lifecycle ---
onMounted(async () => {
  try {
    isLoadingInvoice.value = true;

    // Fetch invoice details
    const response = await api.invoices.get(invoiceId);

    if (response.data) {
      // Transform invoice data
      invoice.value = {
        id: response.data.id,
        totalAmount: response.data.totalAmount,
        roomNumber: response.data.contract?.room?.roomNumber || "N/A",
        period: response.data.period,
        dueDate: response.data.dueDate,
        status: response.data.status,
      };

      console.log("📄 Loaded invoice:", invoice.value);
    } else {
      throw new Error("ไม่พบใบแจ้งหนี้นี้");
    }
  } catch (err: any) {
    console.error("Failed to load invoice:", err);
    error.value = err.data?.message || "ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้";
  } finally {
    isLoadingInvoice.value = false;
  }
});
</script>
