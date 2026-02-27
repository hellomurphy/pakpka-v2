<template>
  <div
    class="flex items-center justify-center bg-slate-50 p-4 text-center"
  >
    <div v-if="paymentStatus === 'verifying'">
      <Icon
        name="ph:clock-countdown-duotone"
        class="text-6xl text-slate-400 animate-pulse"
      />
      <h1 class="text-xl font-bold mt-4 text-slate-700">
        กำลังรอการยืนยันการชำระเงิน
      </h1>
      <p class="text-slate-500 mt-1">
        กรุณาอย่าเพิ่งปิดหน้านี้ ระบบกำลังตรวจสอบกับธนาคาร
      </p>
    </div>

    <div v-else-if="paymentStatus === 'successful'">
      <Icon name="ph:check-circle-duotone" class="text-7xl text-green-500" />
      <h1 class="text-2xl font-bold mt-4 text-slate-800">ชำระเงินสำเร็จ!</h1>
      <p class="text-slate-600">
        เราได้รับยอดชำระของคุณเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ
      </p>
      <button
        @click="goHome"
        class="mt-8 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
      >
        กลับสู่หน้าหลัก
      </button>
    </div>

    <div v-else-if="paymentStatus === 'failed'">
      <Icon name="ph:x-circle-duotone" class="text-7xl text-red-500" />
      <h1 class="text-2xl font-bold mt-4 text-slate-800">
        การชำระเงินไม่สำเร็จ
      </h1>
      <p class="text-slate-600">
        เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้งหรือเลือกช่องทางอื่น
      </p>
      <button
        @click="goBack"
        class="mt-8 bg-slate-600 text-white font-bold py-3 px-8 rounded-lg"
      >
        ลองอีกครั้ง
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

definePageMeta({ layout: "splash" }); // ใช้ layout ที่ไม่มี header/footer

type PaymentStatus = "verifying" | "successful" | "failed";

const paymentStatus = ref<PaymentStatus>("verifying");
const route = useRoute();
const router = useRouter();
const orderId = route.params.orderId as string;

let pollingInterval: NodeJS.Timeout;

const checkPaymentStatus = async () => {
  console.log(`Polling for order: ${orderId}`);
  try {
    // const response = await $fetch(`/api/bills/${orderId}/status`);
    // if (response.status === "paid") {
    //   paymentStatus.value = "successful";
    //   clearInterval(pollingInterval);
    // } else if (response.status === "failed") {
    //   paymentStatus.value = "failed";
    //   clearInterval(pollingInterval);
    // }
  } catch (err) {
    console.error("Polling error:", err);
    paymentStatus.value = "paid";
    clearInterval(pollingInterval);
  }
};

onMounted(() => {
  // เริ่ม Polling ทันทีที่หน้านี้โหลด
  // ไม่ต้องใช้ Visibility API แล้ว เพราะการมาถึงหน้านี้คือสัญญาณการกลับมาที่ชัดเจนที่สุด
  checkPaymentStatus(); // เช็คครั้งแรกทันที
  pollingInterval = setInterval(checkPaymentStatus, 3000); // เช็คต่อทุก 3 วินาที
});

onUnmounted(() => {
  clearInterval(pollingInterval);
});

const goHome = () => router.push("/dashboard");
const goBack = () => router.back();
</script>
