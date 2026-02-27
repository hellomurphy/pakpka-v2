<template>
  <section class="bg-white dark:bg-slate-900 py-20 sm:py-28">
    <div class="container mx-auto px-4">
      <div class="text-center max-w-3xl mx-auto mb-20" data-aos="fade-up">
        <h2
          class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
        >
          ทำไมต้องเลือก Pakpak?
        </h2>
        <p class="mt-4 text-lg text-slate-600 dark:text-slate-400">
          เราไม่ได้แค่สร้างโปรแกรม แต่เราสร้าง "ระบบปฏิบัติการ"
          ที่จะเปลี่ยนวิธีการบริหารหอพักของคุณไปตลอดกาล
        </p>
      </div>

      <div class="space-y-28">
        <div class="text-center" data-aos="zoom-in" data-aos-duration="600">
          <h3
            class="text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white tracking-tight max-w-4xl mx-auto"
          >
            {{ knockoutFeatures[0].title }}
          </h3>
          <p
            class="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
          >
            {{ knockoutFeatures[0].description }}
          </p>
          <div class="mt-10 max-w-4xl mx-auto">
            <div
              class="aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <img
                :src="knockoutFeatures[0].imageUrl"
                :alt="knockoutFeatures[0].title"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div class="text-center" data-aos="fade-up">
          <h3
            class="text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white tracking-tight"
          >
            {{ knockoutFeatures[1].title }}
          </h3>
          <p
            class="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
          >
            {{ knockoutFeatures[1].description }}
          </p>
          <div class="relative mt-12 max-w-5xl mx-auto">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div
                v-for="(feature, index) in automationFeatures"
                :key="feature.name"
                class="group relative"
                data-aos="fade-up"
                :data-aos-delay="100 + index * 100"
              >
                <div
                  class="bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-6 text-center h-full transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2"
                >
                  <div
                    class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
                    :class="feature.gradient"
                  >
                    <Icon :name="feature.icon" class="w-12 h-12 text-white" />
                  </div>
                  <h4
                    class="mt-6 font-bold text-slate-800 dark:text-white text-lg"
                  >
                    {{ feature.name }}
                  </h4>
                  <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {{ feature.description }}
                  </p>
                </div>
                <div
                  v-if="index < automationFeatures.length - 1"
                  class="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2"
                >
                  <Icon
                    name="lucide:chevron-right"
                    class="w-8 h-8 text-slate-300 dark:text-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="relative py-20 overflow-hidden">
          <div class="absolute inset-0 bg-slate-900 -rotate-2 scale-110"></div>
          <div
            class="relative text-center max-w-3xl mx-auto"
            data-aos="fade-up"
          >
            <h3
              class="text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              <span class="block">{{ knockoutFeatures[2].title }}</span>
              <span
                class="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent pt-1 mt-1"
                >ให้เป็นบิลอัตโนมัติ</span
              >
            </h3>
            <p
              class="mt-6 max-w-2xl mx-auto text-lg text-slate-300 leading-relaxed"
            >
              {{ knockoutFeatures[2].description }}
            </p>
          </div>
          <div class="mt-12" data-aos="zoom-in-up" data-aos-duration="800">
            <div class="max-w-4xl mx-auto">
              <div
                class="aspect-video bg-slate-800/50 p-4 sm:p-6 rounded-2xl shadow-2xl shadow-black/40 border border-slate-700 overflow-hidden"
              >
                <img
                  :src="knockoutFeatures[2].imageUrl"
                  :alt="knockoutFeatures[2].title"
                  class="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-28">
          <div
            class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
            data-aos="fade-up"
          >
            <div>
              <h3
                class="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white tracking-tight"
              >
                {{ knockoutFeatures[3].title }}
              </h3>
              <p
                class="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
              >
                {{ knockoutFeatures[3].description }}
              </p>
            </div>
            <div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <div
                class="aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl shadow-lg overflow-hidden"
              >
                <img
                  :src="knockoutFeatures[3].imageUrl"
                  :alt="knockoutFeatures[3].title"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div
            class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
            data-aos="fade-up"
          >
            <div class="lg:order-2">
              <h3
                class="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white tracking-tight"
              >
                {{ knockoutFeatures[4].title }}
              </h3>
              <p
                class="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
              >
                {{ knockoutFeatures[4].description }}
              </p>
            </div>
            <div
              class="lg:order-1 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl"
            >
              <div
                class="aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl shadow-lg overflow-hidden"
              >
                <img
                  :src="knockoutFeatures[4].imageUrl"
                  :alt="knockoutFeatures[4].title"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <section class="bg-slate-50 dark:bg-slate-900/50 py-20 sm:py-28">
            <div class="container mx-auto px-4">
              <div class="text-center max-w-5xl mx-auto" data-aos="fade-up">
                <h2
                  class="text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white tracking-tight"
                >
                  ย้ายข้อมูลมา Pakpak? <br />ง่ายกว่าที่คิด
                </h2>
                <p
                  class="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
                >
                  เราเข้าใจดีว่าการเริ่มต้นคือขั้นตอนที่น่ากังวลที่สุด
                  เราจึงสร้างเครื่องมือ "Smart Onboarding"
                  ที่จะเปลี่ยนข้อมูลในไฟล์ Excel
                  หรือสมุดจดของคุณให้พร้อมใช้งานบน Pakpak ได้ในไม่กี่นาที
                </p>
              </div>

              <div class="relative mt-16 max-w-4xl mx-auto">
                <div
                  class="grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-x-8"
                >
                  <div
                    v-for="(step, index) in steps"
                    :key="step.title"
                    class="text-center"
                    data-aos="fade-up"
                    :data-aos-delay="100 + index * 150"
                  >
                    <div
                      class="w-16 h-16 bg-white dark:bg-slate-800 border-2 border-teal-200 dark:border-teal-500/50 rounded-full flex items-center justify-center mx-auto shadow-lg"
                    >
                      <Icon
                        :name="step.icon"
                        class="w-8 h-8 text-teal-600 dark:text-teal-400"
                      />
                    </div>
                    <h3
                      class="mt-4 font-semibold text-slate-800 dark:text-slate-100"
                    >
                      {{ step.title }}
                    </h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                      {{ step.description }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
              >
                <div
                  v-for="(item, index) in onboardingBenefits"
                  :key="item.audience"
                  class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700"
                  data-aos="fade-up"
                  :data-aos-delay="400 + (index + 1) * 100"
                >
                  <div class="flex items-center gap-4">
                    <Icon
                      :name="item.icon"
                      class="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0"
                    />
                    <h4
                      class="text-lg font-bold text-slate-900 dark:text-white"
                    >
                      {{ item.audience }}
                    </h4>
                  </div>
                  <p
                    class="mt-3 text-slate-600 dark:text-slate-300"
                    v-html="item.benefit"
                  ></p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* คุณอาจจะไม่ต้องใช้ style เพิ่มเติมแล้ว เพราะเราควบคุมผ่าน class ของ Tailwind */
</style>
<script setup>
import { ref } from "vue";
import { useIntersectionObserver } from "~/composables/useIntersectionObserver";

const svgPath = ref(null);

onMounted(() => {
  if (svgPath.value) {
    const pathLength = svgPath.value.getTotalLength();
    svgPath.value.style.strokeDasharray = pathLength;
    svgPath.value.style.strokeDashoffset = pathLength;

    // Trigger animation when the section is in view using AOS events
    document.addEventListener("aos:in:animate-path", () => {
      svgPath.value.style.transition = "stroke-dashoffset 1.5s ease-in-out";
      svgPath.value.style.strokeDashoffset = "0";
    });
  }
});

// 1. อัปเดตข้อมูลเป็น "หมัดเด็ด" ทั้งหมด
const knockoutFeatures = ref([
  {
    id: 1,
    title: "การเงินที่ปลอดภัย 100% หลับสบายไร้กังวล",
    description:
      "บอกลาความเสี่ยงจากสลิปปลอมและการนั่งกระทบยอดข้ามคืน! Pakpak เชื่อมต่อตรงกับระบบธนาคารผ่าน API ที่ปลอดภัยสูงสุด ทุกยอดชำระเงินจะถูกยืนยันและอัปเดตสถานะทันทีแบบเรียลไทม์",
    imageUrl:
      "https://images.pexels.com/photos/5708219/pexels-photo-5708219.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: 2,
    title: "คืนเวลาชีวิต ด้วยผู้ช่วยส่วนตัว 24 ชั่วโมง",
    description:
      "เราเปลี่ยนงานซ้ำซากที่น่าเบื่อให้เป็นระบบอัตโนมัติเต็มรูปแบบ ให้ 'บอท' ของเราทำหน้าที่เป็นแอดมินส่วนตัวที่ทำงานให้คุณไม่เคยเหนื่อย คืนเวลาและพลังสมองให้คุณกลับไปโฟกัสกับการขยายธุรกิจ",
  },
  {
    id: 3,
    title: "AI สแกนมิเตอร์",
    description:
      "ลืมการเดินจดเลขและคีย์ข้อมูลที่ผิดพลาดไปได้เลย เพียงใช้มือถือถ่ายรูปมิเตอร์, ระบบ AI ของเราจะสแกนและดึงตัวเลขมาสร้างบิลค่าไฟ-ค่าน้ำให้ทันที โดยที่คุณไม่ต้องติดตั้งหรือไปยุ่งกับอุปกรณ์มิเตอร์เดิมแม้แต่น้อย",
    imageUrl:
      "https://images.pexels.com/photos/10619969/pexels-photo-10619969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: 4,
    title: "จาก 1 หอ สู่ 10 สาขา... ในหน้าจอเดียว",
    description:
      "นี่คือศูนย์บัญชาการสำหรับนักธุรกิจอสังหาฯ ตัวจริง ไม่ว่าคุณจะมีกี่โครงการ ไม่ต้องสลับบัญชีหรือปวดหัวกับไฟล์ Excel อีกต่อไป Pakpak ให้คุณบริหารจัดการและดูรายงานสรุปของทุกโครงการได้จาก Dashboard ศูนย์กลางเพียงแห่งเดียว",
    imageUrl:
      "https://images.pexels.com/photos/3760604/pexels-photo-3760604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: 5,
    title: "ประสบการณ์ไร้รอยต่อ ไม่ต้องติดตั้งแอปฯ",
    description:
      "เรากำจัดอุปสรรคที่ใหญ่ที่สุดในการเริ่มต้นใช้งาน! Pakpak ทำงานบน LINE Mini App ที่ผู้เช่าของคุณคุ้นเคย แค่ส่งลิงก์เดียวก็พร้อมใช้งานทันที ไม่ต้องดาวน์โหลด ไม่ต้องจำรหัสผ่านใหม่ ลดปัญหา 'ผู้เช่าใช้ไม่เป็น' ให้เป็นศูนย์",
    imageUrl:
      "https://images.pexels.com/photos/3808008/pexels-photo-3808008.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
]);

const onboardingBenefits = ref([
  {
    icon: "lucide:file-input",
    audience: "สำหรับผู้ที่มีระบบเดิม",
    benefit:
      'ใช้เทมเพลตของเราเป็น <strong class="text-slate-900 dark:text-slate-100">"สะพานเชื่อม"</strong> ย้ายข้อมูลจากระบบเก่ามายัง Pakpak อย่างรวดเร็ว ลดความผิดพลาดจากการคีย์ข้อมูลใหม่ทั้งหมด',
  },
  {
    icon: "lucide:file-check-2",
    audience: "สำหรับผู้ที่เริ่มต้นใหม่",
    benefit:
      'ใช้เทมเพลตของเราเป็น <strong class="text-slate-900 dark:text-slate-100">"เช็คลิสต์นำทาง"</strong> ในการรวบรวมและจัดระเบียบข้อมูลหอพักให้เป็นระบบตั้งแต่ครั้งแรก',
  },
]);

// เพิ่มข้อมูลส่วนนี้ใน <script setup> ของคุณ
const steps = ref([
  {
    icon: "lucide:download",
    title: "1. ดาวน์โหลดเทมเพลต",
    description: "Excel ที่เราจัดรูปแบบไว้ให้",
  },
  {
    icon: "lucide:file-spreadsheet",
    title: "2. กรอกข้อมูลของคุณ",
    description: "ใส่ข้อมูลห้องและผู้เช่า",
  },
  {
    icon: "lucide:upload-cloud",
    title: "3. อัปโหลดและเริ่มต้น",
    description: "ข้อมูลทั้งหมดพร้อมใช้งานทันที",
  },
]);

// ✔️ ปรับปรุงใหม่: เปลี่ยนชื่อและคำอธิบายของไอคอน ให้สื่อถึง 'ผลลัพธ์' มากขึ้น
// ไอคอนชุดนี้จะถูกนำไปแสดงอยู่ใต้ "หมัดเด็ดที่ 2"
const automationFeatures = ref([
  {
    name: "ใบแจ้งหนี้อัจฉริยะ",
    icon: "lucide:file-pen-line",
    description: "สร้างและรวมบิลค่าน้ำ-ค่าไฟโดยอัตโนมัติ",
    gradient: "bg-gradient-to-br from-teal-400 to-cyan-500",
  },
  {
    name: "ผู้ช่วยแจ้งเตือน",
    icon: "lucide:send-horizontal",
    description: "ส่งบิลและข้อความทวงหนี้ถึง LINE ผู้เช่า",
    gradient: "bg-gradient-to-br from-blue-400 to-indigo-500",
  },
  {
    name: "ยอดเงินเข้าทันที",
    icon: "lucide:shield-check",
    description: "ยืนยันการชำระเงินจากธนาคาร ไม่ต้องเช็กสลิป",
    gradient: "bg-gradient-to-br from-green-400 to-emerald-500",
  },
  {
    name: "ใบเสร็จอัตโนมัติ",
    icon: "lucide:receipt-text",
    description: "สร้างและส่งให้ผู้เช่าทันทีหลังชำระเงินสำเร็จ",
    gradient: "bg-gradient-to-br from-purple-400 to-violet-500",
  },
]);

const activeFeatureId = ref(knockoutFeatures.value[0].id);
const featurePanels = ref([]);

useIntersectionObserver(
  featurePanels,
  (id) => {
    activeFeatureId.value = id;
  },
  { threshold: 0.4 }
);
</script>
