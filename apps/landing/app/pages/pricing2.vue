<template>
  <div class="bg-white">
    <section class="text-center pt-30 px-2">
      <h1
        class="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
      >
        เลือกแพ็กเกจที่ใช่สำหรับธุรกิจคุณ
      </h1>
    </section>

    <div class="pb-20 pt-10 sm:pb-24">
      <div class="container mx-auto px-4">
        <div
          v-if="isEarlyBirdActive"
          class="mb-12 max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 text-white text-center shadow-2xl shadow-indigo-500/20 transition-transform duration-300 hover:scale-[1.02]"
          data-aos="zoom-in-up"
        >
          <div class="relative p-6 sm:p-8 overflow-hidden rounded-2xl">
            <div class="relative z-10">
              <div
                class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
              >
                <div
                  class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20"
                >
                  <Icon
                    name="lucide:gem"
                    class="w-8 h-8 text-white animate-pulse"
                  />
                </div>

                <div class="text-center sm:text-left">
                  <p
                    class="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300"
                  >
                    ข้อเสนอสำหรับผู้ร่วมก่อตั้ง
                  </p>
                  <p v-if="discountAmount > 0" class="text-white/80">
                    รับส่วนลดพิเศษ
                    <strong class="text-amber-300 font-bold"
                      >{{ discountAmount }}%</strong
                    >
                    สำหรับการใช้งานในปีแรก
                  </p>
                </div>
              </div>

              <div class="mt-5 pt-4 border-t border-white/10">
                <p class="text-base font-semibold">
                  ⏳ <span class="opacity-80">สิทธิ์มีจำนวนจำกัด:</span>
                  <span class="text-amber-300 font-bold text-lg">{{
                    earlyBirdLimit
                  }}</span>
                  สิทธิ์สุดท้ายเท่านั้น!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex justify-center items-center space-x-4 mb-16"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <span
            :class="
              !isAnnual ? 'text-teal-600 font-semibold' : 'text-slate-500'
            "
            >รายเดือน</span
          >
          <button
            @click="isAnnual = !isAnnual"
            class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
            :class="isAnnual ? 'bg-teal-500' : 'bg-slate-300'"
          >
            <span
              :class="isAnnual ? 'translate-x-6' : 'translate-x-1'"
              class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ease-in-out"
            ></span>
          </button>
          <span
            :class="isAnnual ? 'text-teal-600 font-semibold' : 'text-slate-500'"
            >รายปี</span
          >
          <span
            v-if="isAnnual"
            class="sm:inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse"
            >คุ้มที่สุด!</span
          >
        </div>

        <div class="lg:hidden" data-aos="fade-up" data-aos-delay="200">
          <div class="mb-8 border-b border-slate-200">
            <div
              class="flex flex-wrap -mb-px justify-center gap-x-2 sm:gap-x-6"
            >
              <button
                v-for="plan in plans"
                :key="`tab-${plan.key}`"
                @click="activePlanKey = plan.key"
                :class="[
                  'px-3 py-3 text-sm sm:text-base font-semibold border-b-2 transition-colors duration-200',
                  activePlanKey === plan.key
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:border-slate-700',
                ]"
              >
                {{ plan.name }}
              </button>
            </div>
          </div>
          <div class="w-full flex justify-center">
            <Transition name="fade" mode="out-in">
              <div :key="activePlan.key" class="w-full max-w-sm">
                <div
                  :class="[
                    activePlan.highlighted
                      ? 'border-teal-500 border-2 relative'
                      : 'border-slate-200 border',
                    'bg-white rounded-2xl p-8 shadow-lg flex flex-col h-full',
                  ]"
                >
                  <div
                    v-if="activePlan.highlighted"
                    class="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold"
                  >
                    แนะนำ
                  </div>
                  <h3 class="text-2xl font-bold text-slate-900">
                    {{ activePlan.name }}
                  </h3>
                  <p class="mt-2 text-slate-500 text-sm h-10">
                    {{ activePlan.audience }}
                  </p>
                  <div class="mt-6">
                    <p
                      v-if="isEarlyBirdActive && activePlan.name !== 'Premium'"
                      class="text-sm text-red-500 font-semibold line-through h-5"
                    >
                      ปกติ ฿{{ regularPrice(activePlan).toLocaleString() }}
                    </p>
                    <p v-else class="h-5"></p>
                    <span
                      v-if="activePlan.name === 'Premium'"
                      class="text-2xl font-bold text-slate-900"
                      >{{ activePlan.price.monthly }}</span
                    >
                    <template v-else>
                      <span class="text-4xl font-extrabold text-slate-900"
                        >฿{{ currentPrice(activePlan).toLocaleString() }}</span
                      >
                      <span class="text-base font-medium text-slate-500"
                        >/เดือน</span
                      >
                    </template>
                    <p
                      v-if="isAnnual && activePlan.name !== 'Premium'"
                      class="text-sm text-slate-500 mt-1"
                    >
                      ชำระรายปี
                      {{
                        (isEarlyBirdActive
                          ? Math.round(
                              activePlan.price.annual *
                                (discountPercentage / 100)
                            )
                          : activePlan.price.annual
                        ).toLocaleString()
                      }}
                      บาท
                    </p>
                  </div>
                  <p class="mt-6 text-slate-600 text-sm flex-grow">
                    {{ activePlan.description }}
                  </p>
                  <a
                    :href="activePlan.cta.href"
                    @click="trackCheckout(activePlan)"
                    class="mt-8 w-full text-center px-6 py-3 rounded-lg font-semibold transition-colors"
                    :class="
                      activePlan.highlighted
                        ? 'bg-teal-500 text-white hover:bg-teal-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    "
                  >
                    {{ activePlan.cta.text }}
                  </a>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <div
          class="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch"
        >
          <div
            v-for="plan in plans"
            :key="plan.name"
            :class="[
              plan.highlighted
                ? 'border-teal-500 border-2 relative'
                : 'border-slate-200 border',
              'bg-white rounded-2xl p-8 shadow-lg flex flex-col',
            ]"
            data-aos="fade-up"
            :data-aos-delay="plan.delay"
          >
            <div
              v-if="plan.highlighted"
              class="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold"
            >
              แนะนำ
            </div>
            <h3 class="text-2xl font-bold text-slate-900">{{ plan.name }}</h3>
            <p class="mt-2 text-slate-500 text-sm h-10">{{ plan.audience }}</p>
            <div class="mt-6">
              <p
                v-if="isEarlyBirdActive && plan.name !== 'Premium'"
                class="text-sm text-red-500 font-semibold line-through h-5"
              >
                ปกติ ฿{{ regularPrice(plan).toLocaleString() }}
              </p>
              <p v-else class="h-5"></p>
              <span
                v-if="plan.name === 'Premium'"
                class="text-2xl font-bold text-slate-900"
                >{{ plan.price.monthly }}</span
              >
              <template v-else>
                <span class="text-4xl font-extrabold text-slate-900"
                  >฿{{ currentPrice(plan).toLocaleString() }}</span
                >
                <span class="text-base font-medium text-slate-500">/เดือน</span>
              </template>
              <p
                v-if="isAnnual && plan.name !== 'Premium'"
                class="text-sm text-slate-500 mt-1"
              >
                ชำระรายปี
                {{
                  (isEarlyBirdActive
                    ? Math.round(plan.price.annual * (discountPercentage / 100))
                    : plan.price.annual
                  ).toLocaleString()
                }}
                บาท
              </p>
            </div>
            <p class="mt-6 text-slate-600 text-sm flex-grow">
              {{ plan.description }}
            </p>
            <a
              :href="plan.cta.href"
              @click="trackCheckout(plan)"
              class="mt-8 w-full text-center px-6 py-3 rounded-lg font-semibold transition-colors"
              :class="
                plan.highlighted
                  ? 'bg-teal-500 text-white hover:bg-teal-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              "
              >{{ plan.cta.text }}</a
            >
          </div>
        </div>

        <div class="mt-16 max-w-4xl mx-auto" data-aos="fade-up">
          <div
            class="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-8"
          >
            <div class="flex flex-col sm:flex-row items-start gap-6">
              <div class="flex-shrink-0">
                <div
                  class="w-14 h-14 bg-white border-4 border-blue-100 rounded-full flex items-center justify-center"
                >
                  <Icon name="lucide:puzzle" class="w-7 h-7 text-blue-600" />
                </div>
              </div>

              <div class="flex-grow">
                <h3 class="text-xl font-bold text-slate-900">
                  มีจำนวนห้องไม่พอดีกับแพ็กเกจ?
                </h3>
                <p class="mt-2 text-slate-600 text-base leading-relaxed">
                  เราเข้าใจดีครับ หากหอพักของคุณมีขนาดใหญ่กว่าแพ็กเกจเล็กน้อย
                  เรามี **บริการส่วนขยายในอัตราพิเศษ**
                  เพื่อความคุ้มค่าสูงสุดสำหรับคุณโดยเฉพาะ
                </p>
              </div>

              <div class="w-full sm:w-auto flex-shrink-0">
                <NuxtLink
                  to="/contact"
                  class="inline-flex items-center justify-center px-6 py-3 w-full sm:w-auto text-base font-semibold text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 transition-transform transform hover:scale-105"
                >
                  ติดต่อรับข้อเสนอ
                  <Icon name="lucide:arrow-right" class="w-5 h-5 ml-2" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-24" data-aos="fade-up">
          <h2 class="text-3xl font-bold text-center text-slate-900">
            เปรียบเทียบฟีเจอร์ทั้งหมด
          </h2>

          <div
            class="mt-8 max-w-6xl mx-auto border border-slate-300 rounded-2xl overflow-hidden shadow-sm"
          >
            <div
              class="grid grid-cols-6 bg-slate-100/80 backdrop-blur-sm p-4 text-sm z-10 border-b border-slate-300"
            >
              <div
                class="col-span-2 font-semibold text-slate-800 p-4 flex items-center"
              ></div>
              <div
                v-for="plan in plans"
                :key="`header-${plan.name}`"
                class="col-span-1 text-center font-semibold text-slate-800 border-l border-slate-300 p-2 sm:p-4 h-32 sm:h-auto flex items-center justify-center"
              >
                <span
                  class="block transform -rotate-90 sm:rotate-0 origin-center whitespace-nowrap"
                  >{{ plan.name }}</span
                >
              </div>
            </div>

            <div>
              <div v-for="category in featureCategories" :key="category.id">
                <div
                  class="grid grid-cols-6 p-4 bg-slate-50 border-b border-slate-300"
                >
                  <h3 class="col-span-6 text-base font-semibold text-teal-800">
                    {{ category.name }}
                  </h3>
                </div>

                <div
                  v-for="feature in category.features"
                  :key="feature.name"
                  class="grid grid-cols-6 items-center p-4 text-sm border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
                >
                  <div
                    class="col-span-2 flex items-center gap-x-2 pr-2 text-slate-600"
                  >
                    <span>{{ feature.name }}</span>
                    <Popover v-if="feature.description" class="relative">
                    </Popover>
                  </div>

                  <div
                    v-for="plan in plans"
                    :key="`feature-status-${plan.name}`"
                    class="col-span-1 text-center border-l border-slate-300 h-full flex items-center justify-center"
                  >
                    <template v-if="feature.values[plan.key] === true">
                      <Icon name="lucide:check" class="w-6 h-6 text-teal-600" />
                    </template>
                    <template v-else-if="feature.values[plan.key] === 'addon'">
                      <div
                        class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                        title="สามารถซื้อเพิ่มได้"
                      >
                        <Icon name="lucide:plus-circle" class="w-4 h-4" />
                        <span class="hidden xl:inline">ซื้อเพิ่ม</span>
                      </div>
                    </template>
                    <template v-else-if="feature.values[plan.key] === 'soon'">
                      <div
                        class="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                        title="ฟีเจอร์นี้กำลังจะเปิดให้ใช้งานเร็วๆ นี้"
                      >
                        <Icon name="lucide:sparkles" class="w-3 h-3" />
                        <span>เร็วๆ นี้</span>
                      </div>
                    </template>
                    <template v-else-if="feature.values[plan.key] === false">
                      <Icon
                        name="lucide:x"
                        class="w-5 h-5 text-slate-300 mx-auto"
                        title="ไม่มีในแพ็กเกจนี้"
                      />
                    </template>
                    <template v-else>
                      <span class="font-semibold text-slate-700 px-1">{{
                        feature.values[plan.key]
                      }}</span>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-16 max-w-4xl mx-auto" data-aos="fade-up">
          <div
            class="bg-slate-50 border border-slate-300 rounded-2xl p-8 space-y-8"
          >
            <div
              v-for="item in clarityInfo"
              :key="item.id"
              class="flex items-start gap-x-5"
            >
              <div class="flex-shrink-0">
                <div
                  class="w-12 h-12 bg-white border border-slate-300 rounded-lg flex items-center justify-center"
                >
                  <Icon :name="item.icon" class="w-6 h-6 text-slate-500" />
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-slate-900">
                  {{ item.title }}
                </h3>
                <p
                  v-html="item.description"
                  class="mt-2 text-slate-600 text-base leading-relaxed"
                ></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="bg-white pb-20 sm:pb-24">
      <div class="container mx-auto px-4 max-w-3xl">
        <div class="text-center" data-aos="fade-up">
          <h2 class="text-3xl font-bold text-slate-900">คำถามที่พบบ่อย</h2>
          <p class="mt-4 text-lg text-slate-600">
            เราได้รวบรวมคำตอบสำหรับคำถามที่คุณอาจสงสัยไว้ที่นี่
          </p>
        </div>

        <div class="mt-12 space-y-4" data-aos="fade-up" data-aos-delay="200">
          <div
            v-for="faq in faqs"
            :key="faq.id"
            class="border border-slate-300 rounded-xl p-1"
          >
            <button
              @click="toggleFaq(faq.id)"
              class="w-full flex justify-between items-center p-5 text-left font-semibold text-slate-800"
            >
              <span>{{ faq.question }}</span>
              <Icon
                name="lucide:chevron-down"
                class="w-5 h-5 text-slate-500 transition-transform duration-300"
                :class="openFaqId === faq.id ? 'rotate-180' : ''"
              />
            </button>

            <Transition name="slide-faq">
              <div
                v-if="openFaqId === faq.id"
                class="px-5 pb-5 text-slate-600 leading-relaxed"
              >
                <p v-html="faq.answer"></p>
              </div>
            </Transition>
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
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";

const isAnnual = ref(true); // 1. Default เป็นรายปี
const isEarlyBirdActive = ref(true); // 2. ตัวแปรเปิด/ปิดโปรโมชัน Early Bird

const billingCycle = computed(() => (isAnnual.value ? "annual" : "monthly"));

const activePlanKey = ref("pro");
const activePlan = computed(() => {
  return (
    plans.value.find((p) => p.key === activePlanKey.value) || plans.value[0]
  );
});

const discountPercentage = ref(25); // 3. กำหนดส่วนลดเป็น 25% สำหรับ Early Bird
const discountAmount = computed(() => 100 - discountPercentage.value);

const earlyBirdLimit = ref(10); // 4. กำหนดจำนวน Early Bird เป็น 10 ท่านแรก

const trackTrialInterest = () => {
  if (process.env.NODE_ENV === "development") return;
  window.fbq?.("track", "Lead", {
    content_name: "Free Trial Button",
    category: "TrialInterest",
  });
};

const trackCheckout = (plan) => {
  if (process.env.NODE_ENV === "development") return;
  window.fbq?.("track", "AddToCart", {
    content_name: plan.name,
    value: plan.price.annual,
    currency: "THB",
  });
};

const plans = ref([
  {
    name: "Starter",
    key: "starter",
    audience: "หอพักขนาดเล็ก (≤ 30 ห้อง)",
    price: { annual: 3190 }, // มีแค่ราคารายปี
    description: "เริ่มต้นสู่ระบบดิจิทัล จัดการข้อมูลพื้นฐานได้ครบถ้วน",
    cta: { text: "ทดลองใช้งาน", href: "/request-access?plan=starter" },
    highlighted: false,
    delay: 100,
  },
  {
    name: "Standard",
    key: "standard",
    audience: "หอพักขนาดกลาง (≤ 80 ห้อง)",
    price: { annual: 4790 },
    description: "เพิ่มระบบอัตโนมัติ ช่วยลดงานจุกจิกและประหยัดเวลา",
    cta: { text: "ทดลองใช้งาน", href: "/request-access?plan=standard" },
    highlighted: false,
    delay: 200,
  },
  {
    name: "Pro",
    key: "pro",
    audience: "สำหรับธุรกิจหอพักมืออาชีพ (≤ 150 ห้อง)",
    price: { annual: 7990 },
    description: "ยกระดับสู่ความเป็นมืออาชีพเต็มรูปแบบด้วยฟีเจอร์ขั้นสูง",
    cta: { text: "ทดลองใช้งาน", href: "/request-access?plan=pro" },
    highlighted: true,
    delay: 100,
  },
  {
    name: "Premium",
    key: "premium",
    audience: "องค์กรและเจ้าของพอร์ตโฟลิโอ",
    price: {
      monthly: "ติดต่อฝ่ายขาย",
      annual: 0,
    },
    description:
      "โซลูชันครบวงจรสำหรับธุรกิจขนาดใหญ่ที่ต้องการความปลอดภัยและบริการระดับสูงสุด",
    cta: { text: "ติดต่อฝ่ายขาย", href: "/contact" },
    highlighted: false,
    delay: 300,
  },
]);

function regularPrice(plan) {
  if (isAnnual.value) {
    // ถ้ารายปี: แสดงราคาต่อเดือนที่แท้จริง
    return Math.round(plan.price.annual / 12);
  } else {
    // ถ้ารายเดือน: แสดงราคาที่แพงขึ้น 20%
    return Math.round((plan.price.annual / 12) * 1.2);
  }
}

// ฟังก์ชันสำหรับคำนวณ "ราคาที่ต้องจ่ายจริง" (หลังหักส่วนลด Early Bird ถ้ามี)
function currentPrice(plan) {
  // เอาราคาปกติมาเป็นตัวตั้ง
  let price = regularPrice(plan);

  // ถ้าโปรโมชันเปิดอยู่ ให้คูณด้วยเปอร์เซ็นต์ส่วนลด
  if (isEarlyBirdActive.value) {
    price = price * (discountPercentage.value / 100);
  }

  // ปัดเศษแล้วส่งค่ากลับไป
  return Math.round(price);
}

const featureCategories = ref([
  {
    id: "basic",
    name: "การจัดการพื้นฐาน",
    features: [
      {
        name: "รองรับห้องพักสูงสุด",
        values: {
          starter: "≤ 30 ห้อง",
          standard: "≤ 80 ห้อง",
          pro: "≤ 150 ห้อง",
          premium: "ไม่จำกัด",
        },
      },
      {
        name: "ระบบจัดการผู้เช่า/สัญญา/ประวัติ",
        values: { starter: true, standard: true, pro: true, premium: true },
      },
      {
        name: "ระบบชำระเงินออนไลน์ (API)",
        values: { starter: true, standard: true, pro: true, premium: true },
      },
      {
        name: "ออกใบแจ้งหนี้/ใบเสร็จ PDF",
        values: { starter: true, standard: true, pro: true, premium: true },
      },
      {
        name: "แดชบอร์ดภาพรวม",
        values: { starter: true, standard: true, pro: true, premium: true },
      },
    ],
  },
  {
    id: "communication",
    name: "การสื่อสารและบริการเสริม",
    features: [
      {
        name: "ระบบแจ้งซ่อมออนไลน์",
        values: { starter: false, standard: true, pro: true, premium: true },
      },
      {
        name: "ระบบแจ้งพัสดุ",
        values: { starter: false, standard: false, pro: true, premium: true },
      },
    ],
  },
  {
    id: "finance",
    name: "ระบบอัตโนมัติทางการเงิน",
    features: [
      {
        name: "ส่งข้อความเตือนหนี้อัตโนมัติ",
        values: { starter: false, standard: false, pro: true, premium: true },
      },
    ],
  },
  {
    id: "pro_enterprise",
    name: "ฟีเจอร์ระดับโปรและองค์กร",
    features: [
      {
        name: "เซ็นสัญญาออนไลน์ (e-Signature)",
        description: "ทำสัญญาเช่าได้รวดเร็วและเป็นทางการ มีผลผูกพันตามกฎหมาย",
        values: {
          starter: "addon",
          standard: "addon",
          pro: true,
          premium: true,
        }, // **นี่คือตัวอย่าง Add-on**
      },
      {
        name: "ซิงค์มิเตอร์อัจฉริยะ (Smart Meter)",
        description: "ถ่ายรูปมิเตอร์แล้วให้ AI อ่านค่าและสร้างบิลให้อัตโนมัติ",
        values: {
          starter: "addon",
          standard: "addon",
          pro: true,
          premium: true,
        }, // **นี่คือตัวอย่าง Add-on**
      },
      {
        name: "จัดการทีมผู้ดูแล",
        values: {
          starter: false,
          standard: false,
          pro: "สูงสุด 5 ผู้ใช้",
          premium: "ไม่จำกัด",
        },
      },
      {
        name: "รีพอร์ตและวิเคราะห์ข้อมูลเชิงลึก",
        description:
          "ดูแนวโน้มรายรับ, อัตราการเข้าพัก, และค่าใช้จ่ายต่างๆ เพื่อให้คุณวางแผนธุรกิจได้อย่างเฉียบคม",
        values: {
          starter: "addon",
          standard: "addon",
          pro: "addon",
          premium: true,
        }, // **นี่คือตัวอย่าง Add-on สำหรับ Pro**
      },
      {
        name: "รายงานการเงินรวมทุกสาขา",
        values: {
          starter: false,
          standard: false,
          pro: false,
          premium: true,
        },
      }, // **นี่คือตัวอย่าง Coming Soon** code "soon"
      {
        name: "บริหารจัดการหลายโครงการ",
        values: { starter: false, standard: false, pro: false, premium: true },
      },
    ],
  },
  {
    id: "support",
    name: "การซัพพอร์ต",
    features: [
      {
        name: "ระดับการซัพพอร์ต",
        values: {
          starter: "ภายใน 24 ชั่วโมง",
          standard: "ภายใน 8 ชั่วโมง",
          pro: "ภายใน 1-2 ชั่วโมง",
          premium: "ผู้ช่วยส่วนตัว",
        },
        //  values: {
        //   starter: "สนับสนุนผ่านแชต: ตอบกลับภายใน 24 ชั่วโมงทำการ",
        //   standard: "แชตในเวลาทำการ: ตอบกลับภายใน 8 ชั่วโมงทำการ",
        //   pro: "สนับสนุนเร่งด่วน: แชต/โทร ตอบกลับภายใน 1-2 ชั่วโมง",
        //   premium: "ผู้จัดการบัญชีส่วนตัว: ช่องทางติดต่อโดยตรง",
        // },
      },
    ],
  },
]);

const faqs = ref([
  {
    id: 1,
    question: "สามารถออกใบกำกับภาษีเต็มรูปแบบได้หรือไม่?",
    answer:
      "ขณะนี้ Pakpak จดทะเบียนพาณิชย์ในนามร้านค้า และสามารถออก **ใบเสร็จรับเงิน (Receipt)** เพื่อเป็นหลักฐานการชำระเงินสำหรับลงบัญชีรายจ่ายได้ครับ แต่เนื่องจากเรายังไม่ได้อยู่ในระบบภาษีมูลค่าเพิ่ม (VAT) จึงยังไม่สามารถออกใบกำกับภาษีเต็มรูปแบบ (Full Tax Invoice) ได้ครับ เรามีแผนที่จะจดทะเบียนเป็นบริษัทและเข้าสู่ระบบ VAT ในอนาคตเพื่อรองรับลูกค้าองค์กรอย่างเต็มรูปแบบ ซึ่งจะมีการแจ้งให้ทราบล่วงหน้า",
  },
  {
    id: 2,
    question: "การเปิดใช้งานระบบรับชำระเงินออนไลน์ยุ่งยากไหม?",
    answer:
      "ไม่ยุ่งยากเลยครับ เป็นขั้นตอนมาตรฐานสากลที่ทำเพียงครั้งเดียวเพื่อยืนยันตัวตน (KYC) กับ Omise พาร์ทเนอร์รับชำระเงินของเรา โดยทั่วไปจะใช้เอกสารพื้นฐาน เช่น บัตรประชาชน และหน้าสมุดบัญชี (สำหรับบุคคลธรรมดา) หรือหนังสือรับรองบริษัท (สำหรับนิติบุคคล) ซึ่งทีมงานของเราพร้อมให้คำแนะนำช่วยเหลือตลอดกระบวนการครับ",
  },
  {
    id: 3,
    question:
      "ราคาแพ็กเกจนี้รวมค่าธรรมเนียมการชำระเงิน (Transaction Fee) แล้วหรือยัง?",
    answer:
      "ยังไม่รวมครับ ค่าธรรมเนียมนี้จะถูกเรียกเก็บโดยผู้ให้บริการรับชำระเงิน (Payment Gateway) โดยตรง ซึ่งอัตราจะแตกต่างกันไปตามช่องทาง เช่น บัตรเครดิต หรือ QR PromptPay (โดยทั่วไปจะอยู่ที่ประมาณ 1.65% - 3.65%) ท่านสามารถตรวจสอบอัตราล่าสุดได้จากผู้ให้บริการโดยตรงครับ",
  },
  {
    id: 4,
    question: "มีสัญญาผูกมัดหรือไม่? สามารถยกเลิกได้เมื่อไหร่?",
    answer:
      "ไม่มีสัญญาผูกมัดครับ คุณสามารถยกเลิกบริการของเราได้ทุกเมื่อ หากคุณยกเลิกระหว่างรอบบิล คุณจะยังคงสามารถใช้งานได้จนถึงวันสุดท้ายของรอบบิลนั้นๆ",
  },
  {
    id: 5,
    question: "ถ้าเลือกแพ็กเกจรายปี ต้องจ่ายเงินอย่างไร?",
    answer:
      "สำหรับแพ็กเกจรายปี จะเป็นการชำระเงินล่วงหน้าครั้งเดียวสำหรับบริการ 12 เดือน ซึ่งจะช่วยให้คุณประหยัดได้มากกว่าเมื่อเทียบกับการจ่ายรายเดือนครับ",
  },
  {
    id: 6,
    question: "สามารถเปลี่ยนแพ็กเกจทีหลังได้หรือไม่?",
    answer:
      "ได้แน่นอนครับ คุณสามารถอัปเกรดหรือดาวน์เกรดแพ็กเกจของคุณได้ตลอดเวลาผ่านระบบหลังบ้าน โดยระบบจะคำนวณค่าบริการส่วนต่างให้โดยอัตโนมัติ",
  },
  {
    id: 7,
    question: "โปรโมชัน Early Bird มีเงื่อนไขอะไรบ้าง?",
    answer: `โปรโมชันนี้สำหรับลูกค้า ${earlyBirdLimit.value} ท่านแรกที่ลงทะเบียนและชำระเงินเท่านั้นครับ โดยจะได้รับส่วนลดตามที่ระบุไว้สำหรับค่าบริการในปีแรก`,
  },
]);

const openFaqId = ref(1); // เปิดคำถามแรกไว้เป็นค่าเริ่มต้น

function toggleFaq(faqId) {
  if (openFaqId.value === faqId) {
    openFaqId.value = null; // ถ้าคลิกที่อันที่เปิดอยู่ ให้ปิด
  } else {
    openFaqId.value = faqId; // ถ้าคลิกอันอื่น ให้เปิดอันนั้น
  }
}
// ใน pages/pricing.vue -> <script setup>

const clarityInfo = ref([
  {
    id: 1,
    icon: "lucide:info",
    title: "เกี่ยวกับค่าธรรมเนียมการทำธุรกรรม (Transaction Fee)",
    description: `ราคาแพ็กเกจของเรายังไม่รวมค่าธรรมเนียมการทำธุรกรรม ซึ่งเป็นค่าบริการที่ผู้ให้บริการรับชำระเงิน (Payment Gateway) เช่น Omise จะเรียกเก็บโดยตรงในแต่ละธุรกรรมออนไลน์
    <br><br>
    อัตราจะแตกต่างกันไปตามช่องทางที่ผู้เช่าชำระเงิน (เช่น QR PromptPay, บัตรเครดิต) โดยทั่วไปจะอยู่ที่ประมาณ <strong class="text-slate-800">1.65% - 3.65%</strong>
    <br><br>
    <a href="https://www.omise.co/th/pricing/thailand" target="_blank" rel="noopener noreferrer" class="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
      ตรวจสอบอัตราค่าธรรมเนียมล่าสุดของ Omise ที่นี่
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" class="inline-block w-4 h-4 ml-1"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3"></path></svg>
    </a>`,
  },
  {
    id: 2,
    icon: "lucide:file-text",
    title: "เอกสารทางบัญชีและการจดทะเบียน",
    description: `Pakpak ได้ <strong class="text-slate-800">จดทะเบียนพาณิชย์อิเล็กทรอนิกส์</strong> อย่างถูกต้องตามกฎหมาย ท่านจึงสามารถใช้ <strong class="text-slate-800">ใบเสร็จรับเงิน (Receipt)</strong> ในนามธุรกิจของเราเพื่อบันทึกเป็นค่าใช้จ่ายของบริษัทได้ตามมาตรฐานทางบัญชี
    <br><br>
    อย่างไรก็ตาม เนื่องจากเรายังไม่ได้อยู่ในระบบภาษีมูลค่าเพิ่ม (VAT) ใบเสร็จรับเงินดังกล่าวจึงยังไม่สามารถใช้เป็น <br><strong class="text-slate-800">ใบกำกับภาษีเพื่อนำไปหักภาษีซื้อ</strong> ได้ครับ`,
  },
  {
    id: 3,
    icon: "lucide:shield-check",
    title: "การยืนยันตัวตนเพื่อเปิดใช้งานระบบรับชำระเงิน",
    description: `เพื่อความปลอดภัยสูงสุดและเป็นไปตามข้อบังคับสากล ท่านจำเป็นต้องทำการยืนยันตัวตน (KYC) กับ Omise ซึ่งเป็นพาร์ทเนอร์รับชำระเงินของเราก่อนเริ่มใช้งานฟีเจอร์นี้
    <br><br>
    <span class="font-semibold text-slate-800">ไม่ต้องกังวลครับ!</span> นี่เป็นขั้นตอนมาตรฐานที่ทำเพียงครั้งเดียว และทีมงาน Pakpak พร้อมให้คำแนะนำช่วยเหลือในทุกขั้นตอนเพื่อให้การเปิดใช้งานของคุณราบรื่นที่สุด`,
  },
]);
useSeoMeta({
  title: "ราคาและแพ็กเกจ",
  description:
    "เลือกแพ็กเกจที่เหมาะสมกับหอพักของคุณที่สุดกับ Pakpak เริ่มต้นง่ายๆ ในราคาที่คุ้มค่า พร้อมฟีเจอร์ที่จะช่วยให้การจัดการของคุณเป็นเรื่องง่าย",
  titleTemplate: "%s | Pakpak",
  ogTitle: "Pakpak | ราคาและแพ็กเกจ",
  ogDescription:
    "เลือกแพ็กเกจที่เหมาะสมกับหอพักของคุณที่สุดกับ Pakpak เริ่มต้นง่ายๆ ในราคาที่คุ้มค่า พร้อมฟีเจอร์ที่จะช่วยให้การจัดการของคุณเป็นเรื่องง่าย",
});
</script>

<style scoped>
/* Transition สำหรับการสลับการ์ดราคาบน Mobile */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-faq-enter-active,
.slide-faq-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 200px; /* ตั้งค่าความสูงสูงสุดที่คาดว่าคำตอบจะเป็น */
  overflow: hidden;
}

.slide-faq-enter-from,
.slide-faq-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>
