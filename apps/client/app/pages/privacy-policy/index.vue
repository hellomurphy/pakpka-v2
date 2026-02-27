<template>
  <div class="bg-slate-50">
    <main class="py-6 px-4">
      <div
        class="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8"
      >
        <div class="border-b border-slate-200 pb-4 mb-6">
          <h1 class="text-2xl md:text-3xl font-bold text-slate-800">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            มีผลบังคับใช้ ณ วันที่: {{ effectiveDate }}
          </p>
        </div>

        <article class="text-base text-slate-700 leading-relaxed space-y-5">
          <p class="mb-6">
            ผู้ให้บริการแพลตฟอร์ม PakPak ("เรา") ซึ่งดำเนินการโดย
            <strong
              >[ชื่อ-นามสกุลของคุณ
              หรือชื่อร้านค้าตามที่จดทะเบียนพาณิชย์]</strong
            >
            ตระหนักถึงความสำคัญของข้อมูลส่วนบุคคลของท่าน ("ผู้ใช้")
            และมุ่งมั่นที่จะปกป้องข้อมูลของท่านตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
            พ.ศ. 2562 ("PDPA") นโยบายนี้อธิบายวิธีที่เราเก็บรวบรวม ใช้
            และเปิดเผยข้อมูลส่วนบุคคลของท่าน
          </p>

          <section class="space-y-3">
            <h2 class="section-title">
              <Icon name="solar:database-bold-duotone" />
              <span>ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม</span>
            </h2>
            <p>เราเก็บรวบรวมข้อมูลของท่านจากหลายช่องทาง ดังนี้:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>
                <strong>ข้อมูลที่ได้รับจากบุคคลที่สาม:</strong>
                เมื่อท่านลงทะเบียนและเข้าสู่ระบบผ่าน **LINE Login**
                เราจะได้รับข้อมูลจาก LINE ได้แก่ รหัสผู้ใช้ (User ID),
                ชื่อที่แสดง (Display Name), URL รูปโปรไฟล์, และอีเมล
                (หากท่านอนุญาต)
              </li>
              <li>
                <strong>ข้อมูลที่ท่านให้กับเราโดยตรง:</strong> เช่น
                รายละเอียดและรูปภาพประกอบในการแจ้งปัญหา,
                ข้อมูลการติดต่อเพิ่มเติมที่ท่านกรอกในโปรไฟล์
              </li>
              <li>
                <strong>ข้อมูลที่เก็บรวบรวมโดยอัตโนมัติ:</strong> เช่น
                ข้อมูลการใช้งาน (Log), ที่อยู่ IP,
                ประเภทของเบราว์เซอร์และอุปกรณ์
              </li>
            </ul>
          </section>

          <section class="space-y-3">
            <h2 class="section-title">
              <Icon name="solar:user-heart-bold-duotone" />
              <span>วัตถุประสงค์ในการใช้ข้อมูล</span>
            </h2>
            <p>เราใช้ข้อมูลของท่านเพื่อวัตถุประสงค์ดังต่อไปนี้:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>เพื่อให้บริการและฟังก์ชันต่างๆ ของแอปพลิเคชัน PakPak</li>
              <li>เพื่อยืนยันตัวตนและรักษาความปลอดภัยของบัญชีผู้ใช้</li>
              <li>
                เพื่อประมวลผลการชำระเงินค่าบริการผ่าน **Omise**
                ซึ่งเป็นผู้ให้บริการที่เราไว้วางใจ
              </li>
              <li>
                เพื่อใช้ในการติดต่อสื่อสาร ตอบข้อสงสัย
                และให้ความช่วยเหลือแก่ท่าน
              </li>
              <li>
                เพื่อส่งการแจ้งเตือนที่สำคัญเกี่ยวกับบริการหรือการทำธุรกรรมของท่าน
              </li>
              <li>เพื่อวิเคราะห์และปรับปรุงคุณภาพของบริการให้ดียิ่งขึ้น</li>
            </ul>
          </section>

          <section class="space-y-3">
            <h2 class="section-title">
              <Icon name="solar:users-group-two-rounded-bold-duotone" />
              <span>การเปิดเผยข้อมูลส่วนบุคคล</span>
            </h2>
            <p>
              เราอาจเปิดเผยข้อมูลของท่านเท่าที่จำเป็นให้แก่บุคคลภายนอกดังต่อไปนี้:
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li>
                <strong>ผู้จัดการที่พักอาศัย:</strong>
                เพื่อให้สามารถจัดการและตอบสนองต่อเรื่องที่ท่านแจ้งเข้ามา เช่น
                การแจ้งซ่อม หรือการรับพัสดุ
              </li>
              <li>
                <strong>Omise (ผู้ให้บริการชำระเงิน):</strong>
                เราจะส่งข้อมูลที่จำเป็นสำหรับการประมวลผลการชำระเงินเท่านั้น
                โดยเราจะไม่เก็บข้อมูลบัตรเครดิตของท่านไว้ในระบบของเรา
              </li>
              <li>
                <strong>หน่วยงานราชการ:</strong> ในกรณีที่มีการร้องขอตามกฎหมาย
              </li>
            </ul>
          </section>

          <section class="space-y-3">
            <h2 class="section-title">
              <Icon name="solar:cloud-check-bold-duotone" />
              <span>การจัดเก็บและรักษาความปลอดภัย</span>
            </h2>
            <p>
              ข้อมูลของท่านถูกจัดเก็บอย่างปลอดภัยบนโครงสร้างพื้นฐานของ
              **Cloudflare** (เช่น R2 Storage สำหรับรูปภาพ และ D1
              สำหรับฐานข้อมูล)
              ซึ่งเป็นผู้ให้บริการระดับโลกที่มีมาตรฐานความปลอดภัยสูง
              เราใช้มาตรการทางเทคนิคที่เหมาะสม เช่น การเข้ารหัสข้อมูล
              (Encryption) ผ่าน HTTPS
              เพื่อปกป้องข้อมูลของท่านจากการเข้าถึงโดยไม่ได้รับอนุญาต
            </p>
          </section>

          <section class="space-y-3">
            <h2 class="section-title">
              <Icon name="solar:user-check-rounded-bold-duotone" />
              <span>สิทธิของเจ้าของข้อมูล</span>
            </h2>
            <p>
              ท่านมีสิทธิตามกฎหมาย PDPA ในการเข้าถึง, แก้ไข, ขอให้ลบ,
              หรือจำกัดการประมวลผลข้อมูลส่วนบุคคลของท่าน
              หากท่านต้องการใช้สิทธิดังกล่าว
              กรุณาติดต่อเราตามช่องทางที่ระบุไว้ด้านล่าง
            </p>
          </section>

          <section class="space-y-3">
            <h2 class="section-title">
              <Icon name="solar:letter-bold-duotone" />
              <span>ข้อมูลติดต่อ</span>
            </h2>
            <p>
              หากท่านมีคำถามหรือข้อกังวลเกี่ยวกับนโยบายความเป็นส่วนตัวนี้
              กรุณาติดต่อเราได้ที่: <br />
              <strong>[อีเมลสำหรับติดต่อของคุณ]</strong><br />
              <strong>[เบอร์โทรศัพท์สำหรับติดต่อของคุณ (ถ้ามี)]</strong>
            </p>
          </section>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

definePageMeta({
  title: "นโยบายความเป็นส่วนตัว",
  headerVariant: "page",
  showFooter: false,
});

// ใช้ ref เพื่อให้ง่ายต่อการอัปเดตในอนาคต
const effectiveDate = ref("11 มิถุนายน 2568");
</script>

<style scoped>
/* ใช้ @apply สร้าง class ช่วย เพื่อให้ template สะอาดตาและสอดคล้องกัน */
.section-title {
  font-size: 1.125rem; /* text-lg */
  font-weight: 700; /* font-bold */
  color: #1e293b; /* text-slate-800 */
  padding-top: 1.25rem; /* pt-5 */
  border-top: 1px solid #e2e8f0; /* border-t border-slate-200 */
  display: flex; /* flex */
  align-items: center; /* items-center */
  gap: 0.5rem; /* gap-2 */
}

/* ปรับปรุงสไตล์ของ List ให้สวยงามยิ่งขึ้น */
.list-disc li::marker {
  color: #6366f1; /* Tailwind's indigo-500 */
}
</style>
