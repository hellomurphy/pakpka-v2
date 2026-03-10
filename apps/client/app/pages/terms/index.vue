<template>
  <div class="bg-slate-50">
    <main class="py-6 px-4">
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200">
        <div class="p-6 md:p-8 border-b border-slate-200">
          <h1 class="text-2xl md:text-3xl font-bold text-slate-800">ข้อตกลงและเงื่อนไขการใช้งาน</h1>
          <p class="text-sm text-slate-500 mt-1">มีผลบังคับใช้ ณ วันที่: {{ effectiveDate }}</p>
        </div>

        <div class="p-6 md:p-8">
          <div class="p-4 mb-6 bg-amber-50 border-l-4 border-amber-400 text-amber-800">
            <p class="font-bold">โปรดอ่านอย่างละเอียด</p>
            <p class="text-sm mt-1">
              การเข้าใช้บริการนี้ถือว่าท่านได้ยอมรับและตกลงที่จะผูกพันตามข้อตกลงและเงื่อนไขเหล่านี้ทั้งหมด
            </p>
          </div>

          <article class="text-base text-slate-700 leading-relaxed space-y-5">
            <section class="space-y-3">
              <h2 class="section-title">ข้อ 1. คำนิยาม</h2>
              <p>
                <strong>"บริการ"</strong> หมายถึง แพลตฟอร์มบริหารจัดการหอพักภายใต้ชื่อ PakPak
                ซึ่งให้บริการโดย
                <strong
                  >[ชื่อ-นามสกุลของคุณ หรือชื่อร้านค้าตามที่จดทะเบียนพาณิชย์อิเล็กทรอนิกส์]</strong
                >
                ("ผู้ให้บริการ")
              </p>
              <p>
                <strong>"ลูกค้า"</strong> หมายถึง
                เจ้าของหรือผู้จัดการหอพักที่ใช้บริการเพื่อบริหารจัดการหอพักของตน
              </p>
              <p>
                <strong>"ผู้เช่า"</strong> หรือ <strong>"ท่าน"</strong> หมายถึง
                ผู้เช่าหอพักที่เป็นผู้ใช้งานปลายทางของบริการนี้
              </p>
            </section>

            <section class="space-y-3">
              <h2 class="section-title">ข้อ 2. ขอบเขตการให้บริการ</h2>
              <p>
                ผู้ให้บริการทำหน้าที่เป็นเพียงผู้จัดหา "แพลตฟอร์มตัวกลาง"
                เพื่ออำนวยความสะดวกในการสื่อสาร, การแจ้งปัญหา,
                และการชำระเงินระหว่างลูกค้าและผู้เช่าเท่านั้น
                ผู้ให้บริการไม่มีส่วนรับผิดชอบในข้อพิพาท, คุณภาพของที่พัก, หรือการจัดการใดๆ
                ที่เกิดขึ้นโดยตรงระหว่างลูกค้าและผู้เช่า
              </p>
            </section>

            <section class="space-y-3">
              <h2 class="section-title">ข้อ 3. การชำระเงิน</h2>
              <p>
                บริการนี้ใช้ช่องทางการชำระเงินผ่านผู้ให้บริการภายนอกคือ
                <strong>Omise</strong>
                การทำธุรกรรมทางการเงินทั้งหมดจะอยู่ภายใต้ข้อตกลงและเงื่อนไขของ Omise
                ผู้ให้บริการเป็นเพียงผู้เชื่อมต่อระบบและไม่มีส่วนรับผิดชอบต่อความผิดพลาดใดๆ
                ที่เกิดจากการทำธุรกรรมดังกล่าว
              </p>
            </section>

            <section class="space-y-3">
              <h2 class="section-title">ข้อ 4. ข้อมูลและความเป็นส่วนตัว</h2>
              <p>
                ข้อมูลของท่านจะถูกจัดเก็บและประมวลผลบนโครงสร้างพื้นฐานของผู้ให้บริการระดับโลกอย่าง
                <strong>Cloudflare</strong>
                เราให้ความสำคัญกับความปลอดภัยของข้อมูลอย่างสูงสุด โปรดศึกษา "นโยบายความเป็นส่วนตัว"
                เพิ่มเติมสำหรับรายละเอียดการจัดการข้อมูลของท่าน
              </p>
            </section>

            <section class="space-y-3">
              <h2 class="section-title">ข้อ 5. บัญชีผู้ใช้</h2>
              <p>
                การเข้าใช้งานจำเป็นต้องลงทะเบียนผ่านบริการของ
                <strong>LINE (LINE Login)</strong>
                ท่านตกลงที่จะให้ข้อมูลที่เป็นจริงและรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของท่านแต่เพียงผู้เดียว
              </p>
            </section>

            <section class="space-y-3">
              <h2 class="section-title">ข้อ 6. การเปลี่ยนแปลงข้อตกลง</h2>
              <p>
                ผู้ให้บริการขอสงวนสิทธิ์ในการเปลี่ยนแปลงหรือแก้ไขข้อตกลงและเงื่อนไขเหล่านี้ได้ตลอดเวลาโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
                การใช้งานบริการอย่างต่อเนื่องของท่านหลังจากมีการเปลี่ยนแปลง
                ถือว่าท่านยอมรับในข้อตกลงที่แก้ไขแล้ว
              </p>
            </section>
          </article>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  title: 'ข้อตกลงและเงื่อนไข',
  headerVariant: 'page',
  showFooter: false,
})

// ใช้ ref เพื่อให้ง่ายต่อการอัปเดตในอนาคต
const effectiveDate = ref('11 มิถุนายน 2568')
</script>

<style scoped>
.section-title {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 700;
  color: rgb(30 41 59);
  padding-top: 1rem;
  border-top: 1px solid rgb(226 232 240);
}
</style>
