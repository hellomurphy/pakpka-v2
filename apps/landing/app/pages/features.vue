<script setup>
import { ref } from "vue";

useSeoMeta({
  title: "Pakpak - เปลี่ยนการจัดการหอพักให้เป็นเรื่องง่าย",
  description:
    "มากกว่าโปรแกรม, นี่คือระบบปฏิบัติการสำหรับธุรกิจหอพักและคอนโดของคุณ จัดการทุกอย่างได้ครบจบในที่เดียว ตั้งแต่การเงิน, ผู้เช่า, ไปจนถึงงานซ่อม.",
  ogTitle: "Pakpak - ระบบปฏิบัติการสำหรับธุรกิจหอพักยุคใหม่",
  ogDescription:
    "เปลี่ยนความวุ่นวายให้เป็นระบบอัตโนมัติ และเปลี่ยนเวลาของคุณให้มีค่ามากยิ่งขึ้นด้วย Pakpak",
});

// 1. ขยาย Core Features ให้ครอบคลุมมากขึ้น
const coreFeatures = ref([
  {
    id: 1,
    icon: "i-lucide-users-2",
    title: "จัดการผู้เช่าและสัญญา",
    description:
      "เก็บข้อมูล, สัญญาดิจิทัล, และประวัติการชำระเงินในที่เดียว ค้นหาง่าย ไม่ต้องวุ่นวายกับแฟ้มเอกสาร",
  },
  {
    id: 2,
    icon: "i-lucide-layout-dashboard",
    title: "แดชบอร์ดสรุปภาพรวม",
    description:
      "เห็นสถานะห้องว่าง, ยอดรายรับ, และรายการที่ต้องจัดการวันนี้ ทั้งหมดในหน้าจอเดียว",
  },
  {
    id: 3,
    icon: "i-lucide-qr-code",
    title: "ระบบบิลและรับชำระเงิน",
    description:
      "สร้างบิลและ QR Code อัตโนมัติ ระบบจะกระทบยอดให้ทันทีเมื่อผู้เช่าชำระเงินสำเร็จ",
  },
  {
    id: 4,
    icon: "i-lucide-wrench",
    title: "ระบบแจ้งซ่อมออนไลน์",
    description:
      "ผู้เช่ารายงานปัญหาพร้อมแนบรูปผ่านแอป ระบบจะส่งต่อไปยังทีมช่างและติดตามสถานะได้ทันที",
  },
  {
    id: 5,
    icon: "i-lucide-megaphone",
    title: "ประกาศและสื่อสาร",
    description:
      "ส่งข้อความหรือประกาศสำคัญถึงผู้เช่าทุกคน, เฉพาะตึก, หรือรายบุคคลได้ง่ายๆ ผ่านช่องทางที่เข้าถึงแน่นอน",
  },
  {
    id: 6,
    icon: "i-lucide-folder-kanban",
    title: "จัดการเอกสารสำคัญ",
    description:
      "อัปโหลดและจัดเก็บเอกสารสำคัญ เช่น บัตรประชาชนของผู้เช่า หรือใบรับประกันอุปกรณ์ ไว้ในระบบคลาวด์ที่ปลอดภัย",
  },
  {
    id: 7,
    icon: "i-lucide-book-user",
    title: "สมุดรายรับ-รายจ่าย",
    description:
      "บันทึกค่าใช้จ่ายอื่นๆ ของหอพัก เช่น ค่าแม่บ้าน, ค่าส่วนกลาง เพื่อสรุปผลกำไรที่แท้จริงได้แม่นยำ",
  },
  {
    id: 8,
    icon: "i-lucide-bar-chart-3",
    title: "รายงานและวิเคราะห์",
    description:
      "ดูรายงานสรุปผลประกอบการ, อัตราการเข้าพัก, และข้อมูลเชิงลึกอื่นๆ เพื่อการตัดสินใจที่เฉียบคม",
  },
]);

// 2. ขยาย Pro Features และปรับข้อความให้คมขึ้น
const proFeatures = ref([
  {
    id: 1,
    eyebrow: "Pro Feature",
    title: "เซ็นสัญญาออนไลน์ (E-Signature)",
    description:
      "ปิดดีลผู้เช่าใหม่ได้จากทุกที่ ปลอดภัย มีผลผูกพันตามกฎหมาย ลดการใช้กระดาษและขั้นตอนที่ยุ่งยากในการนัดเจอ",
    imageUrl:
      "https://images.pexels.com/photos/7821516/pexels-photo-7821516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    badgeClass: "bg-indigo-100 text-indigo-800",
  },
  {
    id: 2,
    eyebrow: "Pro Feature",
    title: "ซิงค์มิเตอร์อัจฉริยะ (AI Meter Sync)",
    description:
      "เพียงถ่ายรูปมิเตอร์, ระบบ AI ของเราจะอ่านตัวเลขและนำไปสร้างบิลค่าน้ำค่าไฟโดยอัตโนมัติ แม่นยำกว่า 99.9% และป้องกันการทุจริต",
    imageUrl:
      "https://images.pexels.com/photos/10619969/pexels-photo-10619969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    badgeClass: "bg-indigo-100 text-indigo-800",
  },
  {
    id: 3,
    eyebrow: "Enterprise Feature",
    title: "จัดการทีมและจำกัดสิทธิ์",
    description:
      "เพิ่มบัญชีสำหรับผู้จัดการ, แอดมิน, หรือฝ่ายบัญชี พร้อมจำกัดสิทธิ์การเข้าถึงข้อมูลสำคัญได้อย่างปลอดภัยและเป็นระบบ",
    imageUrl:
      "https://images.pexels.com/photos/3184424/pexels-photo-3184424.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    badgeClass: "bg-purple-100 text-purple-800",
  },
]);

// 3. เพิ่มข้อมูลสำหรับ Testimonial
const testimonials = ref([
  {
    name: "คุณสมชาย",
    title: "เจ้าของหอพัก 50 ห้อง, กรุงเทพฯ",
    imageUrl:
      "https://api.dicebear.com/8.x/avataaars-neutral/svg?seed=Somchai&backgroundColor=b6e3f4",
    quote:
      "จากที่เคยจมอยู่กับกองเอกสารและสลิปโอนเงิน ตอนนี้ Pakpak ช่วยให้ผมเห็นภาพรวมการเงินทั้งหมดได้ในคลิกเดียว มันคืนเวลาให้ผมไปดูแลผู้เช่าได้ดีขึ้นจริงๆ ครับ",
  },
  {
    name: "คุณจินตนา",
    title: "ผู้จัดการคอนโด, เชียงใหม่",
    imageUrl:
      "https://api.dicebear.com/8.x/avataaars-neutral/svg?seed=Jintana&backgroundColor=d1fae5",
    quote:
      "ฟีเจอร์แจ้งซ่อมออนไลน์กับสื่อสารผ่าน LINE คือ The Best! ลดการโทรเข้าออกได้เยอะมาก ปัญหาของผู้เช่าถูกส่งต่อให้ช่างได้ทันที ทุกคนแฮปปี้ขึ้นมากค่ะ",
  },
]);
</script>

<template>
  <div class=" relative bg-white overflow-hidden">
    <div class="absolute inset-0 -z-10">
      <div class="absolute inset-0 bg-white" />
      <div class="animated-gradient absolute inset-0" />
    </div>

    <section class="container mx-auto text-center py-24 sm:py-32">
      <UContainer data-aos="fade-up">
        <h1
          class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tighter text-balance"
        >
          <span>มากกว่าโปรแกรม,</span><br class="hidden sm:block" />
          <span>นี่คือ </span>
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600"
            >ระบบปฏิบัติการ</span
          >
          <span>สำหรับหอพักคุณ</span>
        </h1>
        <p
          class="mt-8 max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed text-balance"
        >
          พบชุดเครื่องมือที่ออกแบบมาเพื่อเปลี่ยนความวุ่นวายให้เป็นระบบอัตโนมัติ
          และเปลี่ยนเวลาของคุณให้มีค่ามากยิ่งขึ้น
        </p>
      </UContainer>
    </section>

    <section class="container mx-auto py-16 sm:py-20">
      <UContainer>
        <div class="text-center max-w-3xl mx-auto" data-aos="fade-up">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900">
            หัวใจหลักของ Pakpak
          </h2>
          <p class="mt-4 text-lg text-slate-600">
            ทุกฟีเจอร์พื้นฐานที่คุณต้องการ เพื่อการจัดการที่เป็นระบบ
          </p>
        </div>
        <div
          class="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
        >
          <div
            v-for="(feature, index) in coreFeatures"
            :key="feature.id"
            class="group relative rounded-2xl p-6 sm:p-8 overflow-hidden border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-teal-300/50"
            data-aos="fade-up"
            :data-aos-delay="100 + index * 50"
          >
            <div
              class="absolute -top-1/2 -right-1/2 w-full h-full bg-teal-400/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>
            <div class="relative z-10">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-md mb-4"
              >
                <UIcon :name="feature.icon" class="w-7 h-7 text-teal-600" />
              </div>
              <h3 class="text-lg font-semibold text-slate-900">
                {{ feature.title }}
              </h3>
              <p class="mt-1 text-sm text-slate-600 text-pretty">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <section
      class="relative bg-slate-900 text-white py-20 sm:py-28 my-20 overflow-hidden"
    >
      <UContainer class="container mx-auto relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div data-aos="fade-right">
            <h2 class="text-3xl sm:text-4xl font-bold text-balance">
              สั่งงานครั้งเดียว, ที่เหลือให้ระบบจัดการ
            </h2>
            <p class="mt-6 text-lg text-slate-300 text-pretty">
              เราเปลี่ยนงานซ้ำซากที่น่าเบื่อให้กลายเป็น Automation
              ที่ทำงานให้คุณตลอด 24 ชั่วโมง ตั้งแต่การส่งบิล,
              เตือนเมื่อถึงกำหนดชำระ, ไปจนถึงรับเรื่องแจ้งซ่อมเบื้องต้น
              ปลดปล่อยเวลาและพลังสมองของคุณไปทำสิ่งที่สร้างสรรค์กว่า
            </p>
          </div>
          <div data-aos="fade-left" data-aos-delay="200">
            <div
              class="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div class="space-y-4">
                <div class="flex items-center gap-3 text-sm opacity-80">
                  <UIcon
                    name="i-lucide-send"
                    class="w-5 h-5 text-blue-400 flex-shrink-0"
                  />
                  <span class="break-words"
                    >กำลังส่งบิลค่าเช่าเดือน ก.ค. ถึง 50 ห้อง...</span
                  >
                  <span class="ml-auto text-green-400/80 flex-shrink-0"
                    >สำเร็จ</span
                  >
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <UIcon
                    name="i-lucide-bell-ring"
                    class="w-5 h-5 text-amber-400 flex-shrink-0"
                  />
                  <span class="break-words"
                    >ส่งข้อความเตือน 'คุณสมศรี' ห้อง A102...</span
                  >
                  <span class="ml-auto text-green-400/80 flex-shrink-0"
                    >สำเร็จ</span
                  >
                </div>
                <div class="flex items-center gap-3 text-sm opacity-80">
                  <UIcon
                    name="i-lucide-wrench"
                    class="w-5 h-5 text-rose-400 flex-shrink-0"
                  />
                  <span class="break-words"
                    >รับเรื่องแจ้งซ่อม 'แอร์ไม่เย็น' ห้อง B304...</span
                  >
                  <span class="ml-auto text-green-400/80 flex-shrink-0"
                    >รับเรื่องแล้ว</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="container mx-auto py-20 sm:py-28">
      <UContainer>
        <div class="text-center max-w-3xl mx-auto" data-aos="fade-up">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900">
            เปลี่ยนจากวิธีเดิมๆ ที่น่าปวดหัว
          </h2>
          <p class="mt-4 text-lg text-slate-600">
            ดูความแตกต่างที่ชัดเจนระหว่างการจัดการแบบเก่ากับการใช้ Pakpak
          </p>
        </div>
        <div
          class="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div class="rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-8">
            <h3 class="text-2xl font-bold text-rose-800">แบบเดิมๆ</h3>
            <ul class="mt-6 space-y-4">
              <li class="flex items-start gap-3">
                <UIcon
                  name="i-lucide-x-circle"
                  class="w-6 h-6 text-rose-500 mt-1 flex-shrink-0"
                />
                <span
                  >ใช้ Excel และสมุดจด, ข้อมูลกระจัดกระจาย
                  เสี่ยงต่อการสูญหาย</span
                >
              </li>
              <li class="flex items-start gap-3">
                <UIcon
                  name="i-lucide-x-circle"
                  class="w-6 h-6 text-rose-500 mt-1 flex-shrink-0"
                />
                <span
                  >ตามทวงค่าเช่าผ่าน LINE หรือโทรศัพท์ ทีละคน
                  เสียเวลาและอารมณ์</span
                >
              </li>
              <li class="flex items-start gap-3">
                <UIcon
                  name="i-lucide-x-circle"
                  class="w-6 h-6 text-rose-500 mt-1 flex-shrink-0"
                />
                <span
                  >รับเรื่องแจ้งซ่อมไม่เป็นระบบ ตกหล่น ล่าช้า
                  ผู้เช่าไม่พอใจ</span
                >
              </li>
            </ul>
          </div>
          <div
            class="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-8"
          >
            <h3 class="text-2xl font-bold text-emerald-800">ด้วย Pakpak</h3>
            <ul class="mt-6 space-y-4">
              <li class="flex items-start gap-3">
                <UIcon
                  name="i-lucide-check-circle-2"
                  class="w-6 h-6 text-emerald-500 mt-1 flex-shrink-0"
                />
                <span
                  >ข้อมูลทั้งหมดรวมศูนย์บนคลาวด์ เรียกดูได้จากทุกที่ ปลอดภัย
                  100%</span
                >
              </li>
              <li class="flex items-start gap-3">
                <UIcon
                  name="i-lucide-check-circle-2"
                  class="w-6 h-6 text-emerald-500 mt-1 flex-shrink-0"
                />
                <span
                  >ระบบส่งบิลและติดตามอัตโนมัติ ผู้เช่าจ่ายง่ายผ่าน
                  QR/บัตรเครดิต</span
                >
              </li>
              <li class="flex items-start gap-3">
                <UIcon
                  name="i-lucide-check-circle-2"
                  class="w-6 h-6 text-emerald-500 mt-1 flex-shrink-0"
                />
                <span
                  >ระบบ Ticket แจ้งซ่อม
                  ติดตามทุกขั้นตอนตั้งแต่ต้นจนจบผ่านแอป</span
                >
              </li>
            </ul>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="container mx-auto relative py-20 sm:py-28 overflow-hidden">
      <div
        class="absolute inset-0 opacity-20 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
      >
        <div
          class="absolute inset-0 bg-repeat bg-[length:40px_40px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJub25lIiBzdHJva2U9InJnYigxNSAyMyA0MiAvIDAuMDQpIj48cGF0aCBkPSJNMCAuNWgzMm0tMTYgMHYzMiIvPjwvc3ZnPg==')]"
        />
      </div>
      <UContainer class="relative">
        <div class="text-center max-w-3xl mx-auto" data-aos="fade-up">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900">
            ยกระดับธุรกิจสู่ความเป็นมืออาชีพและเหนือกว่า
          </h2>
          <p class="mt-4 text-lg text-slate-600">
            เครื่องมือขั้นสูงที่ช่วยให้คุณทำงานได้อย่างแม่นยำ, ปลอดภัย,
            และเติบโตอย่างมีข้อมูล
          </p>
        </div>
        <div class="mt-20 space-y-24">
          <div
            v-for="(feature, index) in proFeatures"
            :key="feature.id"
            class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
            data-aos="fade-up"
          >
            <div :class="index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'">
              <img
                :src="feature.imageUrl"
                :alt="feature.title"
                class="rounded-2xl shadow-2xl aspect-video object-cover"
                loading="lazy"
              />
            </div>
            <div
              :class="index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'"
              class="text-center lg:text-left"
            >
              <div
                class="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4"
                :class="feature.badgeClass"
              >
                {{ feature.eyebrow }}
              </div>
              <h3 class="text-2xl font-bold text-slate-800">
                {{ feature.title }}
              </h3>
              <p
                class="mt-3 text-lg text-slate-600 leading-relaxed text-pretty"
              >
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="container mx-auto py-20 sm:py-24">
      <UContainer>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.name"
            class="rounded-2xl bg-white p-8 shadow-lg border border-slate-100"
            data-aos="fade-up"
            :data-aos-delay="index * 100"
          >
            <Icon name="lucide:quote" class="w-10 h-10 text-teal-400" />
            <blockquote class="mt-4">
              <p class="text-lg font-medium text-slate-800 leading-relaxed">
                "{{ testimonial.quote }}"
              </p>
            </blockquote>
            <footer class="mt-6">
              <div class="flex items-center gap-4">
                <img
                  class="h-14 w-14 rounded-full"
                  :src="testimonial.imageUrl"
                  :alt="testimonial.name"
                />
                <div>
                  <div class="font-semibold text-slate-900">
                    {{ testimonial.name }}
                  </div>
                  <div class="text-slate-600">{{ testimonial.title }}</div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="container mx-auto py-20 sm:py-24">
      <UContainer>
        <div class="text-center max-w-2xl mx-auto" data-aos="fade-up">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900">
            แพ็กเกจที่ยืดหยุ่น สำหรับหอพักทุกขนาด
          </h2>
          <p class="mt-4 text-lg text-slate-600">
            เรามีแผนบริการที่ออกแบบมาให้เหมาะกับความต้องการของคุณ
            ไม่ว่าหอพักของคุณจะมีขนาดเล็กหรือใหญ่
          </p>
          <div class="mt-8">
            <UButton
              @click="trackViewPricing"
              to="/pricing"
              label="ดูราคาและแพ็กเกจทั้งหมด"
              size="xl"
              class="font-semibold"
            />
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<style scoped>
.animated-gradient {
  background: linear-gradient(300deg, #cffafe, #e0e7ff, #d1fae5);
  background-size: 180% 180%;
  animation: gradient-animation 12s ease infinite;
}

@keyframes gradient-animation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
