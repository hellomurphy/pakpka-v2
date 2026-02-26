<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4"
  >
    <div v-if="property" class="text-center">
      <UIcon
        name="i-heroicons-building-office-2-20-solid"
        class="w-12 h-12 text-blue-500"
      />
      <p class="mt-4 text-lg text-gray-600">ยินดีต้อนรับสู่</p>
      <h1 class="text-3xl font-bold text-gray-800">{{ property.name }}</h1>
      <p class="mt-6 text-gray-500">
        กรุณาเข้าสู่ระบบด้วย LINE เพื่อลงทะเบียนเป็นผู้เช่าของหอพักนี้
      </p>

      <UButton
        @click="handleLineLogin"
        label="ลงทะเบียนด้วย LINE"
        size="xl"
        class="mt-8"
        icon="i-heroicons-arrow-right-end-on-rectangle-20-solid"
      />
    </div>
    <div v-else class="text-center">
      <p class="text-red-500">ไม่พบข้อมูลหอพัก หรือ URL ไม่ถูกต้อง</p>
    </div>
  </div>
</template>

<script setup>
// หน้านี้ไม่ต้องมี Layout หลัก
definePageMeta({
  layout: false,
});

const route = useRoute();
const propertyId = ref(route.query.propertyId);
const property = ref(null);

// --- ส่วนจำลองการดึงข้อมูลหอพัก ---
// ในระบบจริง เราจะเรียก API เพื่อดึงข้อมูล Property จาก propertyId
// เพื่อนำชื่อมาแสดงผลได้อย่างถูกต้อง
const fetchPropertyInfo = async () => {
  if (propertyId.value) {
    // สมมติว่าดึงข้อมูลสำเร็จ
    property.value = { name: `หอพักทดสอบ (ID: ${propertyId.value})` };
  }
};

const handleLineLogin = () => {
  // --- ส่วนจำลอง ---
  alert(`กำลังเริ่ม LINE Login สำหรับ Property ID: ${propertyId.value}`);
  // ในระบบจริง
  // 1. liff.init()
  // 2. liff.login()
  // 3. เมื่อสำเร็จ จะได้ user profile มา
  // 4. ส่ง user profile.userId และ propertyId.value ไปที่ API ของเราเพื่อสร้างการเชื่อมโยง
  // 5. Redirect ไปยังหน้าแอปของผู้เช่า
};

onMounted(() => {
  fetchPropertyInfo();
});
</script>
