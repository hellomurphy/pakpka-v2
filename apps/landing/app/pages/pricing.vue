<template>
  <div class="bg-white">
    <section class="bg-slate-50 text-center py-20">
      <div class="container mx-auto px-4" data-aos="fade-up">
        <div
          class="inline-block bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-base font-bold mb-4 border border-teal-200"
        >
          ปลดล็อกทุกฟีเจอร์ ไม่ต้องใช้บัตรเครดิต
        </div>

        <h1
          class="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance"
        >
          บริหารหอพักเหนื่อยไหม? <br class="hidden sm:block" />
          ให้ <span class="text-blue-600">Pakpak</span> ช่วยจัดการ
          <span class="text-blue-600">ฟรี 30 วัน</span>
        </h1>

        <p class="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
          ลองใช้โปรแกรมบริหารจัดการหอพัก/อพาร์ทเม้นท์ที่ใช้ง่ายที่สุด
          ตั้งแต่เก็บค่าเช่า แจ้งซ่อม ไปจนถึงสรุปบัญชีรายรับ-รายจ่าย
        </p>
      </div>
    </section>
    <section class="py-20 sm:py-24">
      <div class="container mx-auto px-4">
        <div
          class="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 grid grid-cols-1 lg:grid-cols-5 overflow-hidden"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div class="lg:col-span-3 p-8 lg:p-10">
            <h2 class="text-2xl font-bold text-slate-800">
              ทุกฟีเจอร์ที่คุณต้องการ อยู่ในมือคุณ
            </h2>
            <p class="mt-2 text-slate-600">
              ในช่วงทดลองใช้ 30 วัน คุณสามารถเข้าถึงทุกความสามารถของ Pakpak
              ได้เต็มรูปแบบ:
            </p>
            <ul class="mt-6 space-y-4">
              <li
                v-for="feature in mainFeatures"
                :key="feature.name"
                class="flex items-start gap-4"
              >
                <Icon
                  name="lucide:check-circle-2"
                  class="w-6 h-6 text-teal-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p class="font-semibold text-slate-700">{{ feature.name }}</p>
                  <p class="text-sm text-slate-500">
                    {{ feature.description }}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div
            class="lg:col-span-2 p-8 lg:p-10 flex flex-col items-center justify-center text-center bg-slate-50"
          >
            <Icon
              name="lucide:calendar-check"
              class="w-16 h-16 text-blue-500"
            />

            <h3 class="mt-4 text-3xl font-bold text-slate-900">
              ทดลองใช้ฟรี 30 วัน
            </h3>

            <p class="mt-2 text-slate-600">
              ใช้งานได้ครบทุกฟีเจอร์ระดับโปร โดยไม่มีค่าใช้จ่ายและข้อผูกมัดใดๆ
            </p>

            <ul class="text-left mt-5 space-y-2 text-slate-700">
              <li class="flex items-center gap-2">
                <Icon name="lucide:check" class="w-5 h-5 text-green-500" />
                <span>ปลดล็อกทุกฟีเจอร์</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="lucide:check" class="w-5 h-5 text-green-500" />
                <span>ไม่ต้องใช้บัตรเครดิต</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="lucide:check" class="w-5 h-5 text-green-500" />
                <span>ยกเลิกได้ตลอดเวลา</span>
              </li>
            </ul>

            <NuxtLink
              to="/request-access?type=trial"
              class="mt-6 w-full flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-blue-500/50"
            >
              เริ่มทดลองใช้ฟรีทันที
            </NuxtLink>
            <p class="text-xs text-slate-500 mt-3">
              *หลังครบ 30 วัน สามารถเลือกแผนที่เหมาะสมได้
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white pb-20 sm:pb-24">
      <div class="container mx-auto px-4">
        <div
          class="bg-gradient-to-r from-teal-50 to-blue-50 max-w-4xl mx-auto rounded-2xl p-8 sm:p-12 lg:p-16 text-center border border-slate-300"
          data-aos="fade-up"
        >
          <h2
            class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight"
          >
            ยังมีคำถาม หรือพร้อมเริ่มต้นแล้ว?
          </h2>
          <p class="mt-4 max-w-xl mx-auto text-lg text-slate-600">
            ทีมงานของเราพร้อมช่วยเหลือและตอบทุกข้อสงสัย
            หรือคุณสามารถลงทะเบียนเพื่อรับสิทธิ์ทดลองใช้งานได้ทันที
          </p>

          <div
            class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <NuxtLink
              to="/contact"
              class="inline-flex items-center justify-center px-8 py-3 w-full sm:w-auto text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
            >
              <Icon
                name="lucide:message-circle-question"
                class="w-5 h-5 mr-2"
              />
              ติดต่อเรา
            </NuxtLink>

            <NuxtLink
              to="/request-access"
              @click="trackTrialInterest"
              class="inline-flex items-center justify-center px-8 py-3 w-full sm:w-auto text-base font-semibold text-white bg-blue-600 border border-transparent rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-700"
            >
              สนใจสิทธิ์ใช้งานก่อนใคร
              <Icon name="lucide:arrow-right" class="w-5 h-5 ml-2" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// ตั้ง Layout ให้มี Header/Footer ตามปกติ
definePageMeta({
  layout: "default",
});

// ข้อมูลฟีเจอร์หลักที่เราต้องการเน้นย้ำ
const mainFeatures = ref([
  {
    name: "ระบบการเงินอัตโนมัติ",
    description: "รับชำระเงินผ่าน QR, ออกใบเสร็จ, ทวงค่าเช่าอัตโนมัติ",
  },
  {
    name: "จัดการสัญญาและผู้เช่า",
    description: "เก็บข้อมูลในที่เดียว, เซ็นสัญญาออนไลน์ (e-Signature)",
  },
  {
    name: "เครื่องมือสื่อสารครบวงจร",
    description: "แจ้งซ่อมออนไลน์, แจ้งพัสดุ, ส่งประกาศผ่าน LINE",
  },
  {
    name: "รีพอร์ตและแดชบอร์ดอัจฉริยะ",
    description: "ซิงค์มิเตอร์ AI, สรุปรายรับ-รายจ่าย, เห็นภาพรวมธุรกิจ",
  },
]);

useSeoMeta({
  title: "ข้อเสนอพิเศษสำหรับพาร์ทเนอร์ | Pakpak",
  description:
    "โอกาสสุดท้าย! ร่วมเป็นพาร์ทเนอร์ 50 ท่านแรกและรับส่วนลด 75% สำหรับการใช้งาน Pakpak ทุกฟีเจอร์ ลงทะเบียนเพื่อรับโค้ดส่วนลดของคุณเลย",
});
</script>
