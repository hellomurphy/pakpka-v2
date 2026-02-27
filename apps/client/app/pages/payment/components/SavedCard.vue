<template>
  <button
    @click="$emit('select', card.id)"
    class="w-full text-left p-3 rounded-xl border-2 transition-all duration-200"
    :class="
      isActive
        ? 'bg-indigo-50 border-indigo-500'
        : 'bg-white border-slate-200 hover:border-slate-400'
    "
  >
    <div class="flex items-center gap-4">
      <div class="flex-shrink-0 w-12 h-8 flex items-center justify-center">
        <Icon
          :name="getCardLogo(card.brand)"
          class="text-4xl max-w-full max-h-full"
        />
      </div>

      <div class="flex-grow">
        <p class="font-bold text-slate-800">
          {{ card.brand }} •••• {{ card.last4 }}
        </p>
        <p class="text-sm text-slate-500">
          หมดอายุ {{ card.exp_month }}/{{ card.exp_year.toString().slice(-2) }}
        </p>
      </div>

      <div class="text-2xl flex-shrink-0">
        <Icon
          :name="isActive ? 'ph:radio-button-fill' : 'ph:circle-duotone'"
          :class="isActive ? 'text-indigo-600' : 'text-slate-300'"
        />
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
// --- PROPS & EMITS ---
// Component นี้รับข้อมูลบัตร (card) และสถานะว่าถูกเลือกอยู่หรือไม่ (isActive)
const props = defineProps<{
  card: {
    id: string; // ID ของบัตรจาก Omise (card_...)
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  isActive: boolean;
}>();

// เมื่อมีการกด จะส่ง event 'select' กลับไปหา Component แม่ พร้อมกับ ID ของบัตร
defineEmits(["select"]);

// --- HELPER FUNCTIONS ---
// ฟังก์ชันสำหรับเปลี่ยนชื่อ brand ของบัตรเป็นชื่อไอคอน
function getCardLogo(brand: string): string {
  if (!brand) return "ph:credit-card-fill";

  const b = brand.toLowerCase();

  if (b === "visa") return "logos:visa";
  if (b === "mastercard") return "logos:mastercard";
  if (b === "jcb") return "logos:jcb";
  if (b === "american express") return "logos:amex";
  if (b === "unionpay") return "logos:unionpay";

  return "ph:credit-card-fill"; // ไอคอนพื้นฐาน
}
</script>

<style scoped>
/* No specific styles needed here as we are using Tailwind utility classes */
</style>
