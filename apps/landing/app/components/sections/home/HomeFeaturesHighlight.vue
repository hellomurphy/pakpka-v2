<script setup>
import { ref } from "vue";

const features = ref([
  {
    icon: "i-heroicons-banknotes",
    category: "ระบบการเงินอัตโนมัติ",
    title: "สร้างกระแสเงินสดที่ไม่เคยสะดุด",
    description:
      "เชื่อมต่อทุกช่องทางการชำระเงิน พร้อมระบบออกบิลและกระทบยอดอัตโนมัติ ทำให้เรื่องการเงินของคุณง่ายและแม่นยำ.", // สั้นลง
    highlight: "100%",
    highlightLabel: "ของผู้ประกอบการเห็นยอดเงินเข้า-ออก ชัดเจนขึ้นแบบเรียลไทม์",
    imageSrc: "images/home/feature-payment.webp",
    gradientClasses: "bg-gradient-to-br from-sky-900 to-blue-700",
  },
  {
    icon: "i-heroicons-bolt",
    category: "ระบบอัตโนมัติเต็มรูปแบบ",
    title: "ปฏิวัติการจดมิเตอร์. จบใน 3 วินาที.",
    description:
      "แค่ยกมือถือถ่ายรูปมิเตอร์. AI ของเราจะอ่านค่า, คำนวณ, และสร้างใบแจ้งหนี้ทันที บอกลาความผิดพลาดและงานที่น่าเบื่อไปได้เลย.", // สั้นลง
    highlight: "0%",
    highlightLabel: "อัตราความผิดพลาดจากการคีย์ข้อมูลด้วยมนุษย์",
    imageSrc: "images/home/feature-scan-ai.webp",
    gradientClasses: "bg-gradient-to-br from-cyan-800 to-teal-600",
  },
  {
    icon: "i-heroicons-sparkles",
    category: "ผู้ช่วย AI อัจฉริยะ",
    title: "ปล่อยเรื่องจุกจิกให้เป็นหน้าที่ AI",
    description:
      "ให้ AI Bot ของเราเป็นแอดมินส่วนตัว คอยตอบคำถามที่พบบ่อยและรับเรื่องแจ้งซ่อมตลอด 24 ชั่วโมง เพื่อให้คุณได้ใช้เวลาไปกับสิ่งที่สำคัญกว่า.", // สั้นลง
    highlight: "9/10",
    highlightLabel: "ของผู้ใช้บอกว่ามีเวลาสำหรับครอบครัวและตัวเองมากขึ้น",
    imageSrc: "images/home/feature-ai-assis.webp",
    gradientClasses: "bg-gradient-to-br from-indigo-900 to-purple-700",
  },
  {
    icon: "i-heroicons-chat-bubble-left-right",
    category: "การสื่อสารครบวงจร",
    title: "สื่อสารกับผู้เช่าในช่องทางที่เขาใช้ทุกวัน",
    description:
      "เข้าถึงผู้เช่าของคุณผ่านแพลตฟอร์มที่เขาใช้ทุกวัน ไม่ต้องโหลดแอปเพิ่ม. ส่งประกาศ, รับแจ้งซ่อม, และสื่อสารได้ทันทีผ่าน LINE.", // สั้นลง
    highlight: "#1",
    highlightLabel: "แพลตฟอร์มที่ผู้เช่ายุคใหม่เลือกใช้ติดต่อกับหอพัก",
    imageSrc: "images/home/feature-line.webp",
    gradientClasses: "bg-gradient-to-br from-emerald-800 to-green-600",
  },
  {
    icon: "i-heroicons-document-arrow-up",
    category: "การเริ่มต้นที่ราบรื่น",
    title: "ย้ายทั้งหอพักเข้าระบบในวันเดียว",
    description:
      "เริ่มต้นใช้งานได้อย่างรวดเร็ว. เพียงอัปโหลดข้อมูลหอพักและผู้เช่าของคุณผ่าน Template Excel ที่เราเตรียมไว้ แล้วปล่อยให้ระบบสร้างทุกอย่างให้คุณในไม่กี่นาที.", // สั้นลง
    highlight: "< 1 วัน",
    highlightLabel: "เวลาที่ใช้ในการ Onboard หอพักขนาด 100+ ห้อง",
    imageSrc: "images/home/feature-excel.webp",
    gradientClasses: "bg-gradient-to-br from-orange-500 to-yellow-600",
  },
  {
    icon: "i-heroicons-building-library",
    category: "สำหรับนักลงทุนตัวจริง",
    title: "ขยายพอร์ตธุรกิจ, ไม่ใช่ขยายค่าใช้จ่าย",
    description:
      "จัดการทุกสาขาของคุณในบัญชีเดียว. แพลตฟอร์มของเรารองรับการเติบโตอย่างไร้ขีดจำกัด ด้วยโมเดลที่ยุติธรรม ให้คุณจ่ายเพิ่มเฉพาะเมื่อธุรกิจของคุณขยายตัว.", // สั้นลง
    highlight: "ไม่จำกัด",
    highlightLabel: "จำนวนสาขาที่จัดการได้ในบัญชีเดียว (Premium Plan)",
    imageSrc: "images/home/feature-multiple-prop.webp",
    gradientClasses: "bg-gradient-to-br from-slate-900 to-gray-700",
  },
]);
</script>

<template>
  <div class="bg-white">
    <svg class="absolute h-0 w-0">
      <defs>
        <clipPath id="swoosh-clip" clipPathUnits="objectBoundingBox">
          <path d="M0,0 H1 V0.9 Q0.5,1.0 0,0.9 V0 Z" />
        </clipPath>
      </defs>
    </svg>

    <section class="bg-white py-16 lg:py-24">
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <h2
            class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-balance"
          >
            โซลูชั่นที่ออกแบบมาเพื่อคุณ
          </h2>
          <p class="mt-4 text-lg text-gray-600">
            ทุกฟีเจอร์ถูกสร้างขึ้นเพื่อแก้ปัญหาที่น่าปวดหัวและคืนเวลาอันมีค่าให้กับคุณ
          </p>
        </div>

        <div class="container mx-auto mt-20 space-y-24">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="flex flex-col items-center lg:grid lg:grid-cols-2 lg:gap-12"
            data-aos="fade-up"
          >
            <div class="flex w-full flex-col text-center sm:text-left">
              <div
                class="flex items-center justify-center gap-2 sm:justify-start"
              >
                <UIcon :name="feature.icon" class="h-5 w-5 text-gray-500" />
                <p class="font-semibold text-gray-600">
                  {{ feature.category }}
                </p>
              </div>
              <h3
                class="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl text-balance"
              >
                {{ feature.title }}
              </h3>
              <p class="mt-4 text-lg text-gray-600 text-pretty">
                {{ feature.description }}
              </p>
              <div class="mt-8 border-t border-gray-200 pt-6">
                <p class="text-5xl font-bold text-[#4300FF] sm:text-6xl">
                  {{ feature.highlight }}
                </p>
                <p class="mt-1 text-base text-gray-500">
                  {{ feature.highlightLabel }}
                </p>
              </div>
            </div>

            <div class="relative h-90 w-full max-w-lg lg:h-[28rem]">
              <div
                class="absolute bottom-0 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-t-full lg:h-72 lg:w-[36rem]"
                :class="feature.gradientClasses"
                data-aos="fade-up"
              />

              <div
                class="absolute bottom-0 left-1/2 flex h-full w-full -translate-x-1/2 items-end justify-center"
              >
                <img
                  :src="feature.imageSrc"
                  :alt="feature.title"
                  class="relative z-10 w-3/4 max-w-sm shadow-2xl"
                  data-aos="fade-up"
                  data-aos-delay="200"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<style scoped>
/* ไม่มี CSS พิเศษที่จำเป็นสำหรับ Logic นี้ */
</style>
