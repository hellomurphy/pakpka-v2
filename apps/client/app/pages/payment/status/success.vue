<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
    <div class="max-w-md">
      <!-- Success Icon -->
      <div class="mb-6">
        <Icon name="ph:check-circle-duotone" class="text-8xl text-green-500 mx-auto animate-bounce" />
      </div>

      <!-- Success Message -->
      <h1 class="text-3xl font-bold text-slate-800 mb-3">ส่งหลักฐานเรียบร้อย!</h1>
      <p class="text-slate-600 mb-2">
        เราได้รับหลักฐานการชำระเงินของคุณแล้ว
      </p>
      <p class="text-sm text-slate-500 mb-8">
        ระบบจะตรวจสอบและยืนยันการชำระภายใน 24 ชั่วโมง
      </p>

      <!-- Status Badge -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <div class="flex items-center justify-center gap-2 text-yellow-800">
          <Icon name="ph:clock-duotone" class="text-xl" />
          <span class="font-semibold text-sm">รอการตรวจสอบ</span>
        </div>
        <p class="text-xs text-yellow-700 mt-2">
          คุณสามารถตรวจสอบสถานะได้ที่หน้าประวัติการชำระเงิน
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-3">
        <NuxtLink
          to="/dashboard"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
        >
          <Icon name="ph:house-duotone" class="inline-block mr-2" />
          กลับหน้าหลัก
        </NuxtLink>

        <NuxtLink
          to="/history/payment"
          class="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl border border-slate-200 transition-all"
        >
          <Icon name="ph:clock-counter-clockwise-duotone" class="inline-block mr-2" />
          ดูประวัติการชำระเงิน
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "splash",
  title: "ส่งหลักฐานสำเร็จ",
});
</script>
