<template>
  <div
    ref="socialArea"
    class="aspect-square w-full max-w-lg bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xl border"
  >
    <h1 class="text-3xl font-bold text-gray-800 leading-tight">{{ propertyName }}</h1>
    <p class="text-gray-500 mt-2">สแกน QR Code เพื่อลงทะเบียนเข้าพัก</p>

    <div class="my-6 p-3 bg-white border-4 border-gray-900 rounded-xl shadow-lg">
      <canvas ref="qrCanvas"></canvas>
    </div>

    <div class="flex items-center gap-3 text-gray-600">
      <img src="../../../public/web-app-manifest-192x192.png" alt="Pakpak Logo" class="w-8 h-8" />
      <p class="text-lg font-medium text-gray-700">Pakpak - พักพัก</p>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import QRCode from "qrcode";

const props = defineProps({
  url: { type: String, required: true },
  propertyName: { type: String, default: "หอพักของคุณ" },
});

const qrCanvas = ref(null);
const socialArea = ref(null);

onMounted(async () => {
  if (qrCanvas.value && props.url) {
    try {
      // 1. วาด QR Code พื้นฐานก่อน
      await QRCode.toCanvas(qrCanvas.value, props.url, {
        width: 180,
        margin: 1,
        errorCorrectionLevel: "H",
      });

      // 2. เตรียมโลโก้ LINE
      const canvas = qrCanvas.value;
      const ctx = canvas.getContext("2d");
      const logoImage = new Image();
      logoImage.src = '/line-logo.png'; // เปลี่ยนเป็น path ของโลโก้ LINE ที่คุณต้องการ
      // 3. เมื่อโลโก้โหลดเสร็จ ให้วาดลงไปตรงกลาง
      logoImage.onload = () => {
        const logoSize = 35; // ขนาดของโลโก้
        const centerX = (canvas.width - logoSize) / 2;
        const centerY = (canvas.height - logoSize) / 2;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(centerX - 2, centerY - 2, logoSize + 4, logoSize + 4);

        ctx.drawImage(logoImage, centerX, centerY, logoSize, logoSize);
      };
    } catch (error) {
      console.error("Failed to generate QR Code:", error);
    }
  }
});

defineExpose({ socialArea });
</script>
