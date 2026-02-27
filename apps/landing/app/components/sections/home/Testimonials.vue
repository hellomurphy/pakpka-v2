<template>
  <section class="bg-slate-50 py-20 sm:py-28">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto" data-aos="fade-up">
        <h2
          class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight"
        >
          เรื่องราวความสำเร็จที่รอคุณอยู่
        </h2>
        <p class="mt-4 text-base sm:text-lg text-slate-600">
          นี่คือตัวอย่างประสบการณ์ที่เจ้าของหอพักเช่นคุณจะได้รับเมื่อใช้ Pakpak
          <span class="block text-sm text-slate-500 mt-2"
            >(รีวิวจริงจากผู้ใช้งานกลุ่มแรก เร็วๆ นี้)</span
          >
        </p>
      </div>

      <div class="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="testimonial.id"
          class="bg-white p-8 rounded-2xl shadow-md border border-slate-100 flex flex-col"
          data-aos="fade-up"
          :data-aos-delay="100 + index * 100"
        >
          <Icon
            name="ri:double-quotes-l"
            class="w-12 h-12 text-slate-200/80 mb-4"
          />

          <blockquote class="text-slate-700 italic flex-grow">
            "{{ testimonial.quote }}"
          </blockquote>

          <footer class="mt-6 pt-6 border-t border-slate-200/80">
            <div class="flex items-center">
              <img
                :src="testimonial.avatarUrl"
                :alt="`Avatar of ${testimonial.name}`"
                class="w-14 h-14 rounded-full object-cover bg-slate-200"
              />
              <div class="ml-4">
                <p class="font-semibold text-slate-900">
                  {{ testimonial.name }}
                </p>
                <p class="text-sm text-slate-500">{{ testimonial.role }}</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const testimonials = ref([
  {
    id: 1,
    quote:
      "จากที่เคยจมอยู่กับกองเอกสารและสลิปโอนเงิน ตอนนี้ Pakpak ช่วยให้ผมเห็นภาพรวมการเงินทั้งหมดได้ในคลิกเดียว มันคืนเวลาให้ผมไปดูแลผู้เช่าได้ดีขึ้นจริงๆ ครับ",
    name: "คุณสมชาย (Persona)",
    role: "เจ้าของหอพัก 50 ห้อง, กรุงเทพฯ",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars-neutral/svg?seed=Somchai&backgroundColor=b6e3f4",
  },
  {
    id: 2,
    quote:
      "ชอบระบบแจ้งเตือนอัตโนมัติที่สุดค่ะ ไม่ต้องคอยทวงค่าเช่าเองให้เสียความรู้สึกอีกต่อไป ผู้เช่าก็จ่ายตรงเวลามากขึ้นเพราะมี LINE แจ้งเตือนตลอด",
    name: "พี่หน่อย (Persona)",
    role: "ผู้ดูแลอพาร์ตเมนต์, ชลบุรี",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars-neutral/svg?seed=Noi&backgroundColor=d1d4f9",
  },
  {
    id: 3,
    quote:
      "การปิดดีลสัญญาเช่าออนไลน์ได้เลยคือสิ่งที่เปลี่ยนเกมสำหรับผม ทำให้รับผู้เช่าจากต่างจังหวัดได้ง่ายและรวดเร็วมาก ดูเป็นมืออาชีพและน่าเชื่อถือขึ้นเยอะ",
    name: "คุณอานนท์ (Persona)",
    role: "เจ้าของหอพัก 150 ห้อง, เชียงใหม่",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars-neutral/svg?seed=Arnon&backgroundColor=ffdfbf",
  },
]);
</script>
