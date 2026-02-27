<template>
  <div class="w-full max-w-md mx-auto">
    <div class="text-center mb-8 pt-20" data-aos="fade-up">
      <NuxtLink
        to="/"
        class="text-3xl font-bold text-slate-800 transition-colors hover:text-teal-600"
      >
        Pakpak
      </NuxtLink>
    </div>

    <Transition name="fade" mode="out-in">
      <div
        v-if="!isSuccess"
        key="form"
        class="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/50"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <div class="text-center">
          <h1 class="text-2xl font-bold text-slate-900">
            คุณเกือบจะได้ใช้แล้ว!
          </h1>
          <p class="mt-2 text-slate-600">
            ลงทะเบียนเพื่อรับสิทธิ์ทดลองใช้งานฟรีก่อนใคร
            พร้อมรับส่วนลดพิเศษเมื่อเราเปิดตัว
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="mt-8 space-y-5">
          <div>
            <label for="phone" class="text-sm font-medium text-slate-700"
              >เบอร์โทรศัพท์<span class="text-red-500">*</span></label
            >
            <div class="relative mt-1">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <Icon name="lucide:phone" class="w-5 h-5 text-slate-400" />
              </div>
              <input
                v-model="form.phone"
                type="tel"
                name="phone"
                id="phone"
                class="input-field"
                placeholder="081-234-5678"
                required
              />
            </div>
          </div>

          <div>
            <label for="name" class="text-sm font-medium text-slate-700"
              >ชื่อ-นามสกุล<span class="text-red-500">*</span></label
            >
            <div class="relative mt-1">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <Icon name="lucide:user" class="w-5 h-5 text-slate-400" />
              </div>
              <input
                v-model="form.name"
                type="text"
                name="name"
                id="name"
                class="input-field"
                placeholder="สมชาย ใจดี"
                required
              />
            </div>
          </div>

          <div>
            <label for="email" class="text-sm font-medium text-slate-700"
              >อีเมล <span class="text-slate-400">(ไม่บังคับ)</span></label
            >
            <div class="relative mt-1">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <Icon name="lucide:mail" class="w-5 h-5 text-slate-400" />
              </div>
              <input
                v-model="form.email"
                type="email"
                name="email"
                id="email"
                class="input-field"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label for="dormName" class="text-sm font-medium text-slate-700"
              >ชื่อหอพัก/อพาร์ตเมนต์
            </label>
            <div class="relative mt-1">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <Icon name="lucide:building-2" class="w-5 h-5 text-slate-400" />
              </div>
              <input
                v-model="form.dormName"
                type="text"
                name="dormName"
                id="dormName"
                class="input-field"
                placeholder="บ้านสุขใจ อพาร์ตเมนต์"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
            >
              <span v-if="!isLoading">ยืนยันการรับสิทธิ์</span>
              <span v-else
                ><Icon name="lucide:loader-2" class="w-6 h-6 animate-spin"
              /></span>
            </button>
          </div>
        </form>
      </div>

      <div
        v-else
        key="success"
        class="bg-white p-8 sm:p-12 rounded-2xl shadow-lg text-center"
      >
        <div
          class="flex items-center justify-center mx-auto h-16 w-16 rounded-full bg-teal-100"
        >
          <Icon name="lucide:party-popper" class="w-8 h-8 text-teal-600" />
        </div>
        <h2 class="mt-6 text-2xl font-bold text-slate-900">ลงทะเบียนสำเร็จ!</h2>
        <p class="mt-2 text-slate-600">
          ขอบคุณที่เป็นคนสำคัญในกลุ่มแรกของเรา เราจะติดต่อกลับไปทันทีที่ Pakpak
          พร้อมให้คุณใช้งาน
        </p>
        <div class="mt-8 pt-6 border-t border-slate-200">
          <p class="text-sm font-semibold text-slate-700">
            🔥 เพื่อไม่พลาดข่าวสารและส่วนลดพิเศษ!
          </p>
          <p class="text-sm text-slate-500 mt-1">
            แอด LINE Official Account ของเราไว้ได้เลย
          </p>
          <a
            href="https://line.me/R/ti/p/@pakpak"
            target="_blank"
            class="mt-4 inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 text-base font-bold text-white bg-[#06C755] rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
          >
            <Icon name="fa6-brands:line" class="w-6 h-6 mr-3" /> เพิ่มเพื่อนใน
            LINE
          </a>
        </div>
        <div class="mt-8">
          <NuxtLink
            to="/"
            class="font-semibold text-blue-600 hover:text-blue-500"
            >&larr; กลับสู่หน้าแรก</NuxtLink
          >
        </div>
      </div>
    </Transition>

    <p v-if="errorMsg" class="mt-4 text-center text-sm text-red-600">
      {{ errorMsg }}
    </p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "minimal",
});

const form = ref({
  email: "",
  name: "",
  phone: "", // เพิ่ม phone เข้ามาในฟอร์ม
  dormName: "",
});

const isLoading = ref(false);
const isSuccess = ref(false);
const errorMsg = ref("");

async function handleSubmit() {
  isLoading.value = true;
  errorMsg.value = "";
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxo8SOEB2TWmAWyxm1zVT8fRZ6RcFlKmr6EG5cUZOwVzOFWkombrKYifoBbA2cNa1bJQw/exec"; // URL ของคุณ

  try {

    // แปลง Object form.value ให้เป็น URLSearchParams เพื่อให้เป็น form-urlencoded
    const params = new URLSearchParams();
    for (const key in form.value) {
      params.append(key, form.value[key]);
    }

    await $fetch(SCRIPT_URL, {
      method: "POST",
      body: params, // ส่ง URLSearchParams แทน Object
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // ระบุ Content-Type
      },
    });
    isSuccess.value = true;
  } catch (error) {
    console.error("Error submitting form:", error);
    errorMsg.value = "เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง";
  } finally {
    isLoading.value = false;
  }
}
</script>

<style>
/* CSS สำหรับ Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Reusable class for form inputs */
.input-field {
  display: block;
  width: 100%;
  padding-left: 2.5rem; /* pl-10 */
  padding-right: 1rem; /* pr-4 */
  padding-top: 0.5rem; /* py-2 */
  padding-bottom: 0.5rem;
  border: 1px solid #cbd5e1; /* border-slate-300 */
  border-radius: 0.375rem; /* rounded-md */
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #14b8a6; /* border-teal-500 */
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2); /* focus:ring-teal-500 */
}
</style>
