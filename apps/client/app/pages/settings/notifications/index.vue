<template>
  <div class="bg-slate-50">
    <main class="max-w-2xl mx-auto py-8 px-4">
      <div class="space-y-6">
        <section class="text-center">
          <Icon
            name="solar:bell-bing-bold-duotone"
            class="text-5xl text-indigo-500"
          />
          <h1 class="text-2xl font-bold text-slate-800 mt-2">
            ตั้งค่าการแจ้งเตือน
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            เลือกรับการแจ้งเตือนที่คุณสนใจผ่าน LINE
          </p>
        </section>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <ul class="divide-y divide-slate-100">
            <li
              v-for="setting in notificationSettings"
              :key="setting.id"
              class="p-4 flex justify-between items-center"
            >
              <div class="pr-4">
                <p class="font-semibold text-slate-800">{{ setting.label }}</p>
                <p class="text-xs text-slate-500">{{ setting.description }}</p>
              </div>

              <Switch
                v-model="setting.enabled"
                @update:model-value="(newValue) => updateSetting(setting, newValue)"
                :class="setting.enabled ? 'bg-indigo-600' : 'bg-slate-200'"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span class="sr-only">{{ setting.label }}</span>
                <span
                  aria-hidden="true"
                  :class="setting.enabled ? 'translate-x-5' : 'translate-x-0'"
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                />
              </Switch>
            </li>
          </ul>
        </div>

        <div class="text-center text-xs text-slate-400 px-4">
          <p>
            การเปลี่ยนแปลงการตั้งค่ามีผลทันที
            คุณสามารถกลับมาเปิด-ปิดการแจ้งเตือนได้ตลอดเวลา
          </p>
        </div>
      </div>
    </main>

    <ToastFeedback :toast="toast" />
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Switch } from "@headlessui/vue";
import ToastFeedback from "~/components/ui/ToastFeedback.vue";

definePageMeta({
  title: "ตั้งค่าการแจ้งเตือน",
  headerVariant: "page",
  showFooter: false,
});

// ใช้ reactive เพื่อให้ง่ายต่อการ watch การเปลี่ยนแปลง
const notificationSettings = reactive([
  {
    id: "bills",
    label: "บิลและการชำระเงิน",
    description: "แจ้งเตือนเมื่อมีบิลใหม่, ใกล้ครบกำหนด, หรือค้างชำระ",
    enabled: true,
  },
  {
    id: "repairs",
    label: "สถานะการแจ้งซ่อม",
    description: "แจ้งเตือนทุกความคืบหน้าของเรื่องที่แจ้งซ่อม",
    enabled: true,
  },
  {
    id: "parcels",
    label: "พัสดุและจดหมาย",
    description: "แจ้งเตือนเมื่อมีพัสดุใหม่มาถึงที่หอพัก",
    enabled: true,
  },
  {
    id: "announcements",
    label: "ประกาศจากที่พัก",
    description: "รับข่าวสารและประกาศทั่วไปจากผู้จัดการหอพัก",
    enabled: true,
  },
  {
    id: "system",
    label: "ข่าวสารจาก PakPak",
    description: "รับข่าวสารอัปเดตฟีเจอร์ใหม่และโปรโมชันจากเรา",
    enabled: false,
  },
]);

const toast = reactive({
  show: false,
  message: "",
  type: "loading" as "success" | "error" | "loading",
});
let toastTimeout: NodeJS.Timeout;

async function updateSetting(
  setting: (typeof notificationSettings)[0],
  newValue: boolean
) {
  // 1. Optimistic UI: อัปเดต UI ทันที
  setting.enabled = newValue;

  // 2. แสดง Toast "กำลังบันทึก..."
  clearTimeout(toastTimeout); // เคลียร์ timeout เก่า (ถ้ามี)
  toast.show = true;
  toast.type = "loading";
  toast.message = "กำลังบันทึก...";

  try {
    // 3. จำลองการยิง API ไปยัง Backend
    // await $fetch('/api/user/notification-preferences', { method: 'POST', body: { [setting.id]: newValue } });
    await new Promise((resolve) => setTimeout(resolve, 1200)); // จำลองดีเลย์

    // 4. ถ้าสำเร็จ: แสดง Toast "บันทึกแล้ว"
    toast.type = "success";
    toast.message = "บันทึกแล้ว!";
  } catch (error) {
    console.error("Failed to save setting:", error);
    // 5. ถ้าล้มเหลว: แสดง Toast "เกิดข้อผิดพลาด" และ **ดีดค่ากลับ**
    toast.type = "error";
    toast.message = "บันทึกไม่สำเร็จ";
    setting.enabled = !newValue; // ดีดสวิตช์กลับไปที่เดิม
  } finally {
    // 6. ตั้งเวลาให้ Toast หายไปหลังจากแสดงผลลัพธ์แล้ว
    toastTimeout = setTimeout(() => {
      toast.show = false;
    }, 2000);
  }
}
</script>
