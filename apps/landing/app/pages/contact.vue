<template>
  <div class="bg-white">
    <section class="bg-slate-50 text-center pt-30 pb-20">
      <div class="container mx-auto px-4" data-aos="fade-up">
        <h1
          class="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
        >
          เราพร้อมช่วยเหลือเสมอ
        </h1>
        <p class="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
          มีคำถาม, ข้อเสนอแนะ, หรือสนใจแพ็กเกจ Premium? ทีมงาน Pakpak
          ยินดีให้บริการ
        </p>
      </div>
    </section>

    <section class="py-20 sm:py-24">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div class="space-y-12" data-aos="fade-right">
            <div>
              <h2 class="text-2xl font-bold text-slate-800">
                ช่องทางการติดต่อ
              </h2>
              <p class="mt-2 text-slate-600">
                เลือกช่องทางที่สะดวกที่สุดสำหรับคุณ
              </p>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div class="flex items-center gap-4">
                <Icon
                  name="fa6-brands:line"
                  class="w-12 h-12 text-green-500 flex-shrink-0"
                />
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">
                    ติดต่อผ่าน LINE (เร็วที่สุด)
                  </h3>
                  <p class="text-slate-600 text-sm">
                    สำหรับคำถามทั่วไป, การช่วยเหลือ, หรือติดตามข่าวสาร
                  </p>
                </div>
              </div>
              <a
                href="https://line.me/R/ti/p/@pakpak"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-4 inline-flex items-center justify-center w-full px-6 py-3 text-base font-bold text-white bg-[#06C755] rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              >
                <Icon name="fa6-brands:line" class="w-6 h-6 mr-3" />
                เพิ่มเพื่อน @pakpak (มี @ นำหน้า)
              </a>
            </div>

            <div class="space-y-6">
              <div class="flex items-center gap-4">
                <Icon
                  name="lucide:mail"
                  class="w-6 h-6 text-slate-500 flex-shrink-0"
                />
                <div>
                  <h4 class="font-semibold text-slate-800">อีเมล</h4>
                  <a
                    href="mailto:support@pakpak.app"
                    class="text-slate-600 hover:text-blue-600"
                    >{{ contact.email }}</a
                  >
                </div>
              </div>
              <div class="flex items-center gap-4">
                <Icon
                  name="lucide:facebook"
                  class="w-6 h-6 text-slate-500 flex-shrink-0"
                />
                <div>
                  <h4 class="font-semibold text-slate-800">Facebook:</h4>
                  <a
                    href="https://www.facebook.com/pakpakapplication"
                    class="text-blue-600 hover:text-blue-600"
                    >Pakpak เรื่องหอพัก จบ ครบ ในที่เดียว</a
                  >
                </div>
              </div>
              <div class="flex items-center gap-4">
                <Icon
                  name="lucide:phone"
                  class="w-6 h-6 text-slate-500 flex-shrink-0"
                />
                <div>
                  <h4 class="font-semibold text-slate-800">โทรศัพท์</h4>
                  <a
                    href="tel:0987654321"
                    class="text-slate-600 hover:text-blue-600"
                    >{{ contact.phone }}</a
                  >
                </div>
              </div>
            </div>

            <!-- <div
              class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"
            >
              <h3 class="text-xl font-bold text-slate-900 mb-6">
                ข้อมูลธุรกิจ
              </h3>

              <div class="mb-6 pb-6 border-b border-slate-200">
                <a
                  href="URL_VERIFY_DBD_ของคุณ"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block w-40 mx-auto transition-transform transform hover:scale-105"
                  title="ตรวจสอบการจดทะเบียนพาณิชย์อิเล็กทรอนิกส์"
                >
                  <img src="#" alt="DBD Registered" />
                </a>
              </div>

              <div class="space-y-4 text-sm">
                <div
                  v-for="item in businessInfo"
                  :key="item.label"
                  class="grid grid-cols-1 sm:grid-cols-[1fr,2fr] gap-x-4"
                >
                  <div class="flex items-center text-slate-500">
                    <Icon
                      :name="item.icon"
                      class="w-4 h-4 mr-2 flex-shrink-0"
                    />
                    <span>{{ item.label }}</span>
                  </div>
                  <div class="font-semibold text-slate-800 break-words">
                    {{ item.value }}
                  </div>
                </div>
              </div>
            </div> -->
          </div>

          <div
            class="bg-white p-8 rounded-2xl shadow-lg border border-slate-200"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <h2 class="text-2xl font-bold text-slate-800 mb-6">
              ส่งข้อความถึงเรา
            </h2>

            <form
              v-if="!isSuccess"
              @submit.prevent="handleSubmit"
              class="space-y-6"
            >
              <div>
                <label for="name" class="text-sm font-medium text-slate-700"
                  >ชื่อ-นามสกุล</label
                >
                <input
                  v-model="form.name"
                  type="text"
                  name="name"
                  id="name"
                  class="input-field"
                  required
                />
              </div>
              <div>
                <label for="email" class="text-sm font-medium text-slate-700"
                  >อีเมลของคุณ</label
                >
                <input
                  v-model="form.email"
                  type="email"
                  name="email"
                  id="email"
                  class="input-field"
                  required
                />
              </div>
              <div>
                <label for="subject" class="text-sm font-medium text-slate-700"
                  >หัวข้อที่ต้องการติดต่อ</label
                >
                <select
                  v-model="form.subject"
                  id="subject"
                  name="subject"
                  class="input-field bg-white"
                >
                  <option>สนใจแพ็กเกจ Premium</option>
                  <option>สอบถามเรื่องการใช้งาน</option>
                  <option>ปัญหาทางเทคนิค</option>
                  <option>ข้อเสนอแนะ</option>
                  <option>อื่นๆ</option>
                </select>
              </div>
              <div>
                <label for="message" class="text-sm font-medium text-slate-700"
                  >ข้อความ</label
                >
                <textarea
                  v-model="form.message"
                  name="message"
                  id="message"
                  rows="4"
                  class="input-field"
                  required
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
                >
                  <span >ส่งข้อความ</span>
                  <!--<span v-if="!isLoading">ส่งข้อความ</span>
                   <span v-else
                    ><Icon name="lucide:loader-2" class="w-6 h-6 animate-spin"
                  /></span> -->
                </button>
              </div>
            </form>

            <div v-else class="text-center py-8">
              <div
                class="flex items-center justify-center mx-auto h-16 w-16 rounded-full bg-teal-100"
              >
                <Icon name="lucide:check-check" class="w-8 h-8 text-teal-600" />
              </div>
              <h2 class="mt-6 text-2xl font-bold text-slate-900">
                เราได้รับข้อความของคุณแล้ว!
              </h2>
              <p class="mt-2 text-slate-600">
                ขอบคุณครับ ทีมงานจะรีบติดต่อกลับโดยเร็วที่สุด
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const contact = {
  email: "support@pakpak.app",
  phone: "086-447-7441",
};

const form = ref({
  name: "",
  email: "",
  subject: "สนใจแพ็กเกจ Premium",
  message: "",
});
const isLoading = ref(true);
const isSuccess = ref(false);

async function handleSubmit() {
  isLoading.value = true;
  // ส่วนนี้คือการจำลองการส่งข้อมูล คุณสามารถเปลี่ยนเป็น Logic การส่ง API ของคุณได้
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isSuccess.value = true;
  isLoading.value = false;
}

// ใน pages/contact.vue -> <script setup>

// ... script อื่นๆ ของคุณ ...

// --- ข้อมูลสำหรับ Business Info Card ---
const businessInfo = ref([
  {
    label: "ชื่อผู้ประกอบการ",
    value: "ปากปาก โดย นายพัฒนา จัดการดี",
    icon: "lucide:user-round",
  },
  {
    label: "ที่อยู่สถานประกอบการ",
    value:
      "เลขที่ 123 อาคารสมาร์ทฮับ ชั้น 5 ถนนพัฒนา แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110",
    icon: "lucide:map-pin",
  },
  {
    label: "เลขทะเบียนพาณิชย์อิเล็กทรอนิกส์",
    value: "1102012345678",
    icon: "lucide:hash",
  },
]);

useSeoMeta({
  title: "ติดต่อเรา",
  description:
    "ติดต่อทีมงาน Pakpak เพื่อสอบถามข้อมูล, ขอความช่วยเหลือ, หรือให้ข้อเสนอแนะ เราพร้อมให้บริการผ่านหลากหลายช่องทาง",
  titleTemplate: "%s | Pakpak", // %s จะถูกแทนที่ด้วยค่าของ title
  ogTitle: "Pakpak | ติดต่อเรา",
  ogDescription:
    "ติดต่อทีมงาน Pakpak เพื่อสอบถามข้อมูล, ขอความช่วยเหลือ, หรือให้ข้อเสนอแนะ เราพร้อมให้บริการผ่านหลากหลายช่องทาง",
});
</script>

<style scoped>
/* Reusable class for form inputs */
.input-field {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border: 1px solid #cbd5e1; /* slate-300 */
  border-radius: 0.375rem; /* rounded-md */
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.input-field:focus {
  outline: none;
  border-color: #14b8a6; /* teal-500 */
  box-shadow: 0 0 0 1px #14b8a6;
}
</style>
