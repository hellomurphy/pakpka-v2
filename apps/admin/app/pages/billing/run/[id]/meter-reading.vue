<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useBillingStore } from "~/store/billingStore";
import { ArrowLeftIcon } from "@heroicons/vue/24/solid";

// --- Component Imports ---
import BaseButton from "~/components/ui/BaseButton.vue";
import MeterReadingFocusView from "../../components/MeterReadingFocusView.vue";
import dayjs from "dayjs";

// --- Store, Router ---
const route = useRoute();
const router = useRouter();
const billingStore = useBillingStore();
const runId = route.params.id;

// --- State Management ---
const { activeRun, isLoading } = storeToRefs(billingStore);
const list = ref([]); // Local list to manage readings
const roomInFocus = ref(null);

// --- Data Fetching ---
onMounted(async () => {
  isLoading.value = true;
  await billingStore.fetchMeterReadingList(runId);
  if (!activeRun.value) {
    await billingStore.fetchActiveRun(runId);
  }
  list.value = billingStore.meterReadingList.map((room) => ({
    ...room,
    isCompleted: room.newElec !== null && room.newWater !== null,
  }));
  isLoading.value = false;
});

// --- Computed Properties ---
const completedCount = computed(
  () => list.value.filter((item) => item.isCompleted).length
);
const totalCount = computed(() => list.value.length);

// ✨ NEW: Group the flat list of rooms by their floor for the accordion UI
const groupedRooms = computed(() => {
  if (!list.value) return [];

  const groups = list.value.reduce((acc, room) => {
    const floorName = room.floor?.name || "ไม่ระบุชั้น";
    const floorNumber = room.floor?.floorNumber || 0;

    if (!acc[floorName]) {
      acc[floorName] = {
        floor: floorName,
        floorNumber: floorNumber,
        rooms: [],
      };
    }
    acc[floorName].rooms.push(room);
    return acc;
  }, {});

  // Convert object to array and sort by floorNumber to ensure correct order
  return Object.values(groups).sort((a, b) => a.floorNumber - b.floorNumber);
});

// --- Methods ---
const selectRoom = (room) => {
  roomInFocus.value = room;
};

const handleCloseFocusView = () => {
  roomInFocus.value = null;
};

const handleUpdateAndFlow = (updatedRoom, flowTo) => {
  const index = list.value.findIndex(
    (r) => r.invoiceId === updatedRoom.invoiceId
  );
  if (index !== -1) {
    list.value[index] = {
      ...list.value[index],
      ...updatedRoom,
      isCompleted: true,
    };
  }

  // ✨ Handle three cases: next, close, update-only
  if (flowTo === "next") {
    // Navigate to next room in sequence
    const nextIndex = index + 1;
    if (nextIndex < list.value.length) {
      roomInFocus.value = list.value[nextIndex];
    } else {
      // No more rooms, close the view
      roomInFocus.value = null;
    }
  } else if (flowTo === "close") {
    // User clicked "บันทึกและปิด" - close the view
    roomInFocus.value = null;
  }
  // If flowTo === "update-only", don't change roomInFocus (keep the view open)
};
</script>

<template>
  <div class="h-full bg-slate-100">
    <template v-if="!roomInFocus">
      <div class="flex flex-col h-full">
        <header
          class="flex-shrink-0 bg-white p-4 border-b shadow-sm sticky top-0 z-10"
        >
          <div class="flex justify-between items-center max-w-5xl mx-auto">
            <NuxtLink :to="`/billing/run/${runId}`">
              <BaseButton variant="secondary" size="sm" :icon="ArrowLeftIcon"
                >กลับ</BaseButton
              >
            </NuxtLink>
            <h2 class="text-lg font-bold text-gray-900">
              จดมิเตอร์:
              {{
                activeRun ? dayjs(activeRun.period).format("MMMM BBBB") : "..."
              }}
            </h2>
            <div class="text-sm font-medium text-slate-600">
              <span class="font-bold text-lg">{{ completedCount }}</span> /
              {{ totalCount }}
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-4">
          <div v-if="isLoading" class="text-center py-10 text-slate-500">
            กำลังโหลด...
          </div>
          <div v-else class="max-w-md mx-auto space-y-3">
            <details
              v-for="group in groupedRooms"
              :key="group.floor"
              class="bg-white rounded-lg shadow-sm"
              open
            >
              <summary
                class="p-4 font-bold text-slate-800 text-lg cursor-pointer flex justify-between items-center"
              >
                {{ group.floor }}
                <svg
                  class="w-5 h-5 text-slate-400 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  ></path>
                </svg>
              </summary>
              <div class="border-t border-slate-100">
                <div
                  v-for="room in group.rooms"
                  :key="room.invoiceId"
                  @click="selectRoom(room)"
                  class="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 border-b border-slate-100 last:border-b-0"
                >
                  <div>
                    <p class="text-xl font-bold text-slate-800">
                      {{ room.roomNumber }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ room.tenantName || "ไม่มีผู้เช่า" }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <div
                      v-if="room.isCompleted"
                      class="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      <span>เรียบร้อย</span>
                    </div>
                    <svg
                      class="w-5 h-5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </main>
      </div>
    </template>

    <MeterReadingFocusView
      v-if="roomInFocus"
      :runId="runId"
      :room="roomInFocus"
      :nextRoomExists="
        list.findIndex((r) => r.invoiceId === roomInFocus.invoiceId) <
        list.length - 1
      "
      @close="handleCloseFocusView"
      @save="handleUpdateAndFlow"
    />
  </div>
</template>

<style scoped>
/* Add a nice rotation to the chevron arrow when the accordion is open */
details[open] > summary svg {
  transform: rotate(180deg);
}
</style>
