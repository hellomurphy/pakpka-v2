<template>
  <div
    ref="printableArea"
    class="aspect-[210/297] w-full max-w-xl bg-white shadow-xl border border-gray-200 p-8 flex flex-col items-center"
  >
    <div class="text-center">
      <p class="text-lg font-light text-gray-500">ยินดีต้อนรับสู่</p>
      <h1 class="text-4xl font-bold text-gray-800 mt-1">{{ propertyName }}</h1>
    </div>

    <div
      class="my-auto p-4 bg-white border-4 border-gray-900 rounded-2xl shadow-lg"
    >
      <canvas ref="qrCanvas"></canvas>
    </div>

    <div class="text-center">
      <h2 class="text-2xl font-semibold text-blue-700">สแกนเพื่อลงทะเบียน</h2>
      <p class="mt-2 text-gray-600">
        ใช้แอปพลิเคชัน LINE ของคุณเพื่อสแกน QR Code นี้<br />และเริ่มต้นการลงทะเบียนเป็นผู้เช่าของเรา
      </p>
    </div>

    <div
      class="mt-auto w-full flex items-center justify-center gap-3 pt-4 border-t border-gray-200"
    >
      <img src="../../../public/web-app-manifest-192x192.png" class="w-8 h-8" alt="Pakpak Logo" />
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
const printableArea = ref(null);

onMounted(async () => {
  if (qrCanvas.value && props.url) {
    try {
      // 1. วาด QR Code พื้นฐานก่อน
      await QRCode.toCanvas(qrCanvas.value, props.url, {
        width: 220,
        margin: 2,
        errorCorrectionLevel: "H", // ตั้งค่า Error Correction ให้สูงเพื่อให้สแกนได้แม้มีโลโก้บัง
      });

      // 2. เตรียมโลโก้ LINE
      const canvas = qrCanvas.value;
      const ctx = canvas.getContext("2d");
      const logoImage = new Image();
      // ใช้ Data URL เพื่อป้องกันปัญหา CORS
      logoImage.src = "/line-logo.png"; // เปลี่ยนเป็น path ของโลโก้ LINE ที่คุณต้องการ
      // 3. เมื่อโลโก้โหลดเสร็จ ให้วาดลงไปตรงกลาง
      logoImage.onload = () => {
        const logoSize = 40; // ขนาดของโลโก้
        const centerX = (canvas.width - logoSize) / 2;
        const centerY = (canvas.height - logoSize) / 2;

        // วาดพื้นหลังสีขาวเล็กน้อยหลังโลโก้เพื่อให้โลโก้เด่นขึ้น
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(centerX - 2, centerY - 2, logoSize + 4, logoSize + 4);

        // วาดโลโก้ลงบน Canvas
        ctx.drawImage(logoImage, centerX, centerY, logoSize, logoSize);
      };
    } catch (error) {
      console.error("Failed to generate QR Code:", error);
    }
  }
});
</script>
