<template>
  <section class="bg-slate-50 pb-24">
    <UContainer>
      <div
        class="pt-16 grid grid-cols-1 items-center gap-y-16 lg:grid-cols-2 lg:gap-x-16"
      >
        <div class="relative h-96">
          <div class="absolute inset-0 flex items-center justify-center">
            <img
              data-aos="fade-up"
              src="~/public/images/home/pain-points-phone.webp"
              alt="หน้าจอมือถือแสดงแชทปัญหาจากผู้เช่า"
              class="h-full w-auto drop-shadow-xl"
              loading="lazy"
              width="600"
              height="1200"
            />
          </div>

          <div
            data-aos="fade-left"
            data-aos-delay="200"
            class="chat-from-right absolute w-max max-w-[60%]"
            style="top: 15%; left: 55%"
          >
            แอร์ไม่เย็นเลยค่ะ 🥵
          </div>
          <div
            data-aos="fade-right"
            data-aos-delay="400"
            class="chat-from-left absolute w-max max-w-[60%]"
            style="top: 35%; left: 5%"
          >
            ขอย้ายออกสิ้นเดือนนี้ค่ะ 😢
          </div>
          <div
            data-aos="fade-left"
            data-aos-delay="600"
            class="chat-from-right absolute w-max max-w-[60%]"
            style="top: 50%; left: 55%"
          >
            มีพัสดุมาส่งไหมครับ?
          </div>
        </div>

        <div class="text-center sm:text-left">
          <p
            data-aos="fade-up"
            class="font-bold uppercase tracking-wider text-sm text-cyan-500"
          >
            ปัญหาที่คุ้นเคย
          </p>

          <h2
            data-aos="fade-up"
            data-aos-delay="100"
            class="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl text-balance"
          >
            จัดการปัญหาจุกจิก... จากทุกทิศทาง
          </h2>

          <p
            data-aos="fade-up"
            data-aos-delay="200"
            class="mt-6 text-xl text-gray-600 leading-relaxed text-pretty"
          >
            ตั้งแต่การตอบคำถามซ้ำๆ, เช็คยอดเงินเข้า, ไปจนถึงรับเรื่องแจ้งซ่อม...
            งานเหล่านี้คือ 'โจร'
            ที่ขโมยเวลาและพลังงานที่คุณควรใช้ไปกับการขยายธุรกิจหรือพักผ่อนให้สบายใจ
          </p>
          <div
            data-aos="fade-up"
            data-aos-delay="300"
            class="mt-8 flex justify-center sm:justify-start"
          >
            <UButton
              to="#solution"
              label="ดูว่าระบบของเราช่วยได้อย่างไร"
              variant="link"
              size="xl"
              :padded="false"
              icon="i-heroicons-arrow-right-20-solid"
              trailing
              class="text-lg"
            />
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>

<style scoped>
/* /images/home/pain-points-phone.png */
/* ... CSS เดิมของคุณจาก Hero Section ... */

/* สไตล์ตั้งต้นสำหรับกล่องแชททั้งสองฝั่ง */
.chat-from-left,
.chat-from-right {
  position: relative;
  max-width: 60%;
  border-radius: 0.75rem; /* rounded-xl */
  padding-left: 1.25rem; /* px-5 */
  padding-right: 1.25rem; /* px-5 */
  padding-top: 0.75rem; /* py-3 */
  padding-bottom: 0.75rem; /* py-3 */
  color: #1f2937; /* text-gray-800 */
  box-shadow: 0 10px 15px -3px rgba(31, 41, 55, 0.1),
    0 4px 6px -4px rgba(31, 41, 55, 0.1); /* shadow-lg */
  background-color: #dcf8c6;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .chat-from-left,
  .chat-from-right {
    max-width: 50%;
  }
}

/* สร้างหางสามเหลี่ยมของกล่องแชท */
.chat-from-left::after,
.chat-from-right::after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border: 12px solid transparent;

  /* ★★★ 1. ปรับมุมหางของแชท: ย้ายจุดกำเนิดมาที่ด้านล่าง ★★★ */
  bottom: 8px;
}

/* สไตล์สำหรับแชทที่มาจากฝั่งซ้าย (หางอยู่ขวา ชี้ลงขวา) */
.chat-from-left::after {
  right: -12px;
  border-left-color: #dcf8c6;
  border-right: 0;
  border-top: 0; /* ทำให้สามเหลี่ยมชี้ลง */
}

/* สไตล์สำหรับแชทที่มาจากฝั่งขวา (หางอยู่ซ้าย ชี้ลงซ้าย) */
.chat-from-right::after {
  left: -12px;
  border-right-color: #dcf8c6;
  border-left: 0;
  border-top: 0; /* ทำให้สามเหลี่ยมชี้ลง */
}
</style>
