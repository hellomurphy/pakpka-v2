<template>
  <div class="bg-slate-50">
    <main class="p-4 max-w-4xl mx-auto">
      <div class="mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            v-for="filter in filters"
            :key="filter.id"
            class="px-4 py-1.5 text-sm font-semibold rounded-full transition-colors whitespace-nowrap"
            :class="
              activeFilter === filter.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            "
            @click="activeFilter = filter.id"
          >
            {{ filter.name }}
          </button>
        </div>
      </div>

      <div v-if="filteredTickets.length > 0" class="space-y-4">
        <RepairHistoryCard
          v-for="ticket in filteredTickets"
          :key="ticket.id"
          :ticket="ticket"
        />
      </div>

      <div v-else class="text-center pt-24 px-6">
        <Icon name="ph:wrench-duotone" class="text-7xl text-slate-300 mb-4" />
        <h3 class="text-lg font-semibold text-slate-700">
          ไม่พบรายการแจ้งซ่อม
        </h3>
        <p class="text-slate-500">
          ประวัติการแจ้งซ่อมของคุณที่ตรงกับตัวกรองจะปรากฏที่นี่
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
// ตรวจสอบให้แน่ใจว่าได้สร้าง Component นี้ไว้แล้ว
import RepairHistoryCard from "./components/RepairCard.vue";

// กำหนด Title ของหน้าสำหรับ Header
definePageMeta({
  title: "รายการแจ้งซ่อม",
  headerVariant: "page",
  showFooter: false,
});

// --- STATE MANAGEMENT ---
const activeFilter = ref("all");

// --- STATIC DATA ---
const filters = [
  { id: "all", name: "ทั้งหมด" },
  { id: "in_progress", name: "กำลังดำเนินการ" },
  { id: "completed", name: "เสร็จสิ้นแล้ว" },
  { id: "cancelled", name: "ยกเลิก" },
];

// --- MOCK DATA ---
const repairTickets = ref([
  {
    id: "RP-2506-001",
    title: "แอร์ในห้องนอนไม่เย็น",
    roomNumber: "A203",
    timeline: [
      {
        status: "submitted",
        name: "แจ้งเรื่องแล้ว",
        timestamp: "10 มิ.ย. 2568, 14:30น.",
      },
      {
        status: "acknowledged",
        name: "เจ้าหน้าที่รับเรื่องแล้ว",
        timestamp: "10 มิ.ย. 2568, 14:35น.",
      },
      {
        status: "in_progress",
        name: "กำลังดำเนินการ",
        timestamp: "11 มิ.ย. 2568, 09:00น.",
      },
    ],
  },
  {
    id: "RP-2506-002",
    title: "หลอดไฟห้องน้ำขาด",
    roomNumber: "B501",
    timeline: [
      {
        status: "submitted",
        name: "แจ้งเรื่องแล้ว",
        timestamp: "05 มิ.ย. 2568, 18:00น.",
      },
      {
        status: "acknowledged",
        name: "เจ้าหน้าที่รับเรื่องแล้ว",
        timestamp: "05 มิ.ย. 2568, 18:10น.",
      },
      {
        status: "in_progress",
        name: "กำลังดำเนินการ",
        timestamp: "06 มิ.ย. 2568, 10:00น.",
      },
      {
        status: "completed",
        name: "ดำเนินการเสร็จสิ้น",
        timestamp: "06 มิ.ย. 2568, 10:45น.",
      },
    ],
  },
  {
    id: "RP-2506-003",
    title: "ขอทำความสะอาดพื้นที่ส่วนกลาง",
    roomNumber: "A203",
    timeline: [
      {
        status: "submitted",
        name: "ส่งคำขอแล้ว",
        timestamp: "08 มิ.ย. 2568, 11:00น.",
      },
      {
        status: "acknowledged",
        name: "เจ้าหน้าที่รับเรื่อง",
        timestamp: "08 มิ.ย. 2568, 11:05น.",
      },
      {
        status: "completed",
        name: "ทำความสะอาดเรียบร้อย",
        timestamp: "09 มิ.ย. 2568, 15:00น.",
      },
    ],
  },
  {
    id: "RP-2506-004",
    title: "แจ้งย้ายออกสิ้นเดือน",
    roomNumber: "B501",
    timeline: [
      {
        status: "submitted",
        name: "แจ้งเรื่องแล้ว",
        timestamp: "01 มิ.ย. 2568, 09:20น.",
      },
      {
        status: "cancelled",
        name: "รายการถูกยกเลิก",
        timestamp: "02 มิ.ย. 2568, 13:00น.",
        reason: "ผู้เช่าเปลี่ยนใจ ขอยกเลิกการย้ายออก",
      },
    ],
  },
]);

// --- COMPUTED PROPERTIES ---
const filteredTickets = computed(() => {
  if (activeFilter.value === "all") {
    return repairTickets.value;
  }
  return repairTickets.value.filter((ticket) => {
    // หาสถานะล่าสุดจาก timeline
    const currentStatus = ticket.timeline[ticket.timeline.length - 1].status;

    // เงื่อนไขพิเศษสำหรับฟิลเตอร์ "กำลังดำเนินการ"
    if (activeFilter.value === "in_progress") {
      // ให้รวมสถานะที่ยังไม่เสร็จทั้งหมด
      return ["submitted", "acknowledged", "in_progress"].includes(
        currentStatus
      );
    }

    // กรองตามสถานะอื่นๆ ตรงๆ
    return currentStatus === activeFilter.value;
  });
});
</script>

<style scoped>
/* Utility to hide scrollbar but keep it scrollable */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
