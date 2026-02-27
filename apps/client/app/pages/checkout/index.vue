<template>
  <div class="max-w-2xl mx-auto bg-slate-50 pb-40">
    <div class="p-4 pt-6">
      <p class="text-slate-500">เลือกรายการที่ต้องการชำระ</p>
    </div>

    <!-- Loading state -->
    <div v-if="isFetchingInvoices" class="text-center pt-20 px-4">
      <Icon
        name="ph:spinner-duotone"
        class="text-4xl text-slate-400 animate-spin mb-4"
      />
      <p class="text-slate-500">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Bills list -->
    <div v-else-if="bills.length > 0" class="px-4 space-y-3">
      <RoomPaymentCard
        v-for="bill in bills"
        :key="bill.id"
        :dorm="bill"
        :is-selected="selectedBills.has(bill.id)"
        @select="toggleSelection"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center pt-20 px-4">
      <Icon name="ph:files-duotone" class="text-6xl text-slate-300 mb-4" />
      <p class="text-slate-500">ไม่มีรายการที่ต้องชำระในขณะนี้</p>
    </div>

    <div
      class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 p-4"
    >
      <div class="max-w-md mx-auto">
        <div class="flex justify-between items-center mb-3">
          <span class="text-slate-600">ยอดรวมที่เลือก</span>
          <span class="text-xl font-bold text-slate-800"
            >{{ formatNumber(totalPrice) }} บาท</span
          >
        </div>
        <button
          :disabled="isLoading || selectedBills.size === 0"
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:transform-none disabled:shadow-none"
          @click="handlePayment"
        >
          <Icon
            v-if="isLoading"
            name="ph:spinner-duotone"
            class="h-5 w-5 animate-spin"
          />
          <Icon v-else name="heroicons:lock-closed-20-solid" class="h-5 w-5" />
          <span>{{ isLoading ? "กำลังดำเนินการ..." : "ชำระเงิน" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import RoomPaymentCard from "./components/RoomPaymentCard.vue";
import { useUserStore } from "~/stores/user";

const { formatNumber } = useNumberFormat();

definePageMeta({
  showFooter: false,
  title: "ชำระค่าบริการ",
  headerVariant: "page",
});

const api = useApi();
const userStore = useUserStore();
const router = useRouter();

// State
const bills = ref([]);
const selectedBills = ref(new Set());
const isLoading = ref(false);
const isFetchingInvoices = ref(false);

// ฟังก์ชันแปลง backend invoice เป็น UI format
const transformInvoice = (invoice: any) => {
  // หา property name จาก user store
  const propertyName = userStore.user?.property?.name || "หอพัก";

  // แปลง period (YYYY-MM) เป็น billing cycle
  const [year, month] = invoice.period.split("-");
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const thaiYear = parseInt(year) + 543;
  const monthName = monthNames[parseInt(month) - 1];
  const billingCycle = `${monthName} ${thaiYear}`;

  // แปลง dueDate เป็นรูปแบบไทย
  const dueDate = new Date(invoice.dueDate);
  const thaiDueDate = dueDate.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // แปลง status
  let status = "pending";
  if (invoice.status === "OVERDUE") status = "overdue";
  else if (invoice.status === "UNPAID") status = "pending";
  else if (invoice.status === "PAID") status = "paid";
  else if (invoice.status === "CANCELLED") status = "cancelled";

  // แปลง items เป็น lineItems
  const lineItems = invoice.items.map((item: any) => {
    let icon = "solar:bill-list-bold-duotone";
    let iconColor = "text-slate-500";

    // กำหนดไอคอนตาม description
    const desc = item.description.toLowerCase();
    if (desc.includes("เช่า") || desc.includes("rent")) {
      icon = "solar:home-smile-angle-bold-duotone";
      iconColor = "text-indigo-500";
    } else if (desc.includes("น้ำ") || desc.includes("water")) {
      icon = "solar:droplet-bold-duotone";
      iconColor = "text-sky-500";
    } else if (desc.includes("ไฟ") || desc.includes("electric")) {
      icon = "solar:bolt-bold-duotone";
      iconColor = "text-amber-500";
    } else if (desc.includes("ปรับ") || desc.includes("late") || desc.includes("fee")) {
      icon = "solar:danger-bold-duotone";
      iconColor = "text-red-500";
    } else if (desc.includes("ส่วนกลาง") || desc.includes("common")) {
      icon = "solar:users-group-rounded-bold-duotone";
      iconColor = "text-green-500";
    } else if (desc.includes("อินเทอร์เน็ต") || desc.includes("internet")) {
      icon = "solar:wifi-router-bold-duotone";
      iconColor = "text-purple-500";
    } else if (desc.includes("จอดรถ") || desc.includes("parking")) {
      icon = "solar:car-bold-duotone";
      iconColor = "text-slate-500";
    }

    // สร้าง details จาก meterReadings ถ้ามี
    let details = null;
    const relatedReading = invoice.meterReadings?.find((reading: any) => {
      const readingType = reading.utilityType.toLowerCase();
      return (desc.includes("น้ำ") && readingType.includes("water")) ||
             (desc.includes("ไฟ") && readingType.includes("electric"));
    });

    if (relatedReading) {
      details = `${relatedReading.readingValue} หน่วย`;
    }

    return {
      id: item.id,
      label: item.description,
      details,
      amount: item.amount,
      icon,
      iconColor,
    };
  });

  return {
    id: invoice.id,
    name: propertyName,
    room: `ห้อง ${invoice.contract.room.roomNumber}`,
    billingCycle,
    status,
    dueDate: thaiDueDate,
    totalPrice: invoice.totalAmount,
    lineItems,
    rawInvoice: invoice, // เก็บข้อมูลดิบไว้ใช้งานต่อ
  };
};

// ดึงข้อมูล invoices จาก backend
const fetchInvoices = async () => {
  isFetchingInvoices.value = true;
  try {
    // ดึงเฉพาะใบแจ้งหนี้ที่ยังไม่ได้ชำระ (UNPAID และ OVERDUE)
    const [unpaidResponse, overdueResponse] = await Promise.all([
      api.invoices.getMy({ status: "UNPAID" }),
      api.invoices.getMy({ status: "OVERDUE" }),
    ]);

    const unpaidInvoices = unpaidResponse.data?.invoices || [];
    const overdueInvoices = overdueResponse.data?.invoices || [];

    const allInvoices = [...overdueInvoices, ...unpaidInvoices];
    bills.value = allInvoices.map(transformInvoice);

    console.log("📄 Fetched invoices from backend:");
    console.log("Raw invoices:", allInvoices);
    console.log("Transformed bills:", bills.value);
  } catch (error: any) {
    console.error("Failed to fetch invoices:", error);
    // ถ้า error ให้แสดง empty state
    bills.value = [];
  } finally {
    isFetchingInvoices.value = false;
  }
};

// Toggle selection
const toggleSelection = (billId: string) => {
  if (selectedBills.value.has(billId)) {
    selectedBills.value.delete(billId);
  } else {
    selectedBills.value.add(billId);
  }
};

// คำนวณยอดรวม
const totalPrice = computed(() => {
  return bills.value
    .filter((bill) => selectedBills.value.has(bill.id))
    .reduce((sum, bill) => sum + bill.totalPrice, 0);
});

// Handle payment
const handlePayment = async () => {
  if (isLoading.value) return;

  const selectedBillIds = Array.from(selectedBills.value);
  if (selectedBillIds.length === 0) {
    alert("กรุณาเลือกรายการที่ต้องการชำระ");
    return;
  }

  isLoading.value = true;

  try {
    // TODO: เรียก API สร้าง payment intent หรือ redirect ไปหน้าชำระเงิน
    // ตอนนี้ใช้ invoice ID แรกไปก่อน
    const firstInvoiceId = selectedBillIds[0];
    console.log("Redirecting to payment page with invoice:", firstInvoiceId);
    router.push(`/payment/${firstInvoiceId}`);
  } catch (error) {
    console.error("Failed to process payment:", error);
    alert("เกิดข้อผิดพลาดในการดำเนินการชำระเงิน กรุณาลองใหม่อีกครั้ง");
  } finally {
    isLoading.value = false;
  }
};

// Fetch data on mount
onMounted(async () => {
  await fetchInvoices();
});
</script>
