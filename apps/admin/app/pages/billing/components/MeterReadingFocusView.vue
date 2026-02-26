<script setup>
import { ref, computed, watch } from "vue";
import { useBillingStore } from "~/store/billingStore";
import { useNotification } from "~/composables/useNotification";
import { useDebounceFn } from "@vueuse/core";
import { toast } from "vue-sonner";
import BaseButton from "~/components/ui/BaseButton.vue";
import NumericKeypad from "~/components/ui/NumericKeypad.vue";
import { XMarkIcon, BoltIcon, CloudIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/solid";

const props = defineProps({
  runId: { type: String, required: true },
  room: { type: Object, required: true },
  nextRoomExists: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "save"]);

const billingStore = useBillingStore();
const notify = useNotification();

// ✨ Warning thresholds
const USAGE_WARNING_THRESHOLD = 100; // 100% increase (2x) triggers soft warning

// --- State Management ---
const readings = ref({
  elec: "",
  water: "",
});

// ✨ Debounced readings for validation (หน่วงเวลา 800ms หลัง user หยุดพิมพ์)
const debouncedReadings = ref({
  elec: "",
  water: "",
});

const activeInput = ref("elec");
const isSaving = ref(false);

// ✨ Exception flags for Hard Block bypass
const meterExceptions = ref({
  elec: false, // ยอมรับการแก้ไข
  water: false, // ยอมรับการแก้ไข
});

// ✨ Debounce function สำหรับอัพเดท debouncedReadings
const updateDebouncedReadings = useDebounceFn(() => {
  debouncedReadings.value.elec = readings.value.elec;
  debouncedReadings.value.water = readings.value.water;
}, 800); // หน่วงเวลา 800ms

// Watch a prop to initialize and update the component's state.
// This is the key to showing already-saved values.
watch(
  () => props.room,
  (newRoom) => {
    if (newRoom) {
      // Use the values from the prop, converting them to strings for the keypad.
      // The `|| ""` handles cases where the value is null or 0.
      readings.value.elec = newRoom.newElec?.toString() || "";
      readings.value.water = newRoom.newWater?.toString() || "";

      // อัพเดท debouncedReadings ทันทีเมื่อเปลี่ยนห้อง
      debouncedReadings.value.elec = readings.value.elec;
      debouncedReadings.value.water = readings.value.water;

      // Reset the focus to the first input for a consistent UX.
      activeInput.value = "elec";

      // Reset exception flags when switching rooms
      meterExceptions.value.elec = false;
      meterExceptions.value.water = false;
    }
  },
  { immediate: true } // `immediate: true` makes this run once on component creation.
);

// ✨ Watch readings และเรียก debounced update
watch(
  readings,
  () => {
    updateDebouncedReadings();
  },
  { deep: true }
);

// --- Computed Properties ---

// ✨ Hard Block: ด่านที่ 1 - ห้ามบันทึกเด็ดขาด
const elecHardBlock = computed(() => {
  if (!debouncedReadings.value.elec || debouncedReadings.value.elec === "") return null;

  const oldValue = Number(props.room.oldElec) || 0;
  const newValue = Number(debouncedReadings.value.elec);

  // ❌ Hard Block: เลขมิเตอร์ใหม่น้อยกว่าเลขเก่า (แสดงตลอด)
  if (newValue < oldValue) {
    return {
      type: "hard-block",
      message: "เลขมิเตอร์น้อยกว่าเดือนที่แล้ว",
      detail: "จดผิด หรือมิเตอร์วนรอบ/เปลี่ยนมิเตอร์ใหม่? กรุณายืนยันด้านล่าง",
      isAccepted: meterExceptions.value.elec, // ตรวจสอบว่ายอมรับแล้วหรือยัง
    };
  }

  return null;
});

const waterHardBlock = computed(() => {
  if (!debouncedReadings.value.water || debouncedReadings.value.water === "") return null;

  const oldValue = Number(props.room.oldWater) || 0;
  const newValue = Number(debouncedReadings.value.water);

  // ❌ Hard Block: เลขมิเตอร์ใหม่น้อยกว่าเลขเก่า (แสดงตลอด)
  if (newValue < oldValue) {
    return {
      type: "hard-block",
      message: "เลขมิเตอร์น้อยกว่าเดือนที่แล้ว",
      detail: "จดผิด หรือมิเตอร์วนรอบ/เปลี่ยนมิเตอร์ใหม่? กรุณายืนยันด้านล่าง",
      isAccepted: meterExceptions.value.water, // ตรวจสอบว่ายอมรับแล้วหรือยัง
    };
  }

  return null;
});

// ⚠️ Soft Warning: ด่านที่ 2 - แจ้งเตือนแต่ยังบันทึกได้
const elecWarning = computed(() => {
  if (!debouncedReadings.value.elec || debouncedReadings.value.elec === "" || elecHardBlock.value) return null;

  const oldValue = Number(props.room.oldElec) || 0;
  const newValue = Number(debouncedReadings.value.elec);
  const currentUsage = newValue - oldValue;

  // ถ้ายังไม่มีข้อมูลเก่า ไม่ต้องเช็ค
  if (oldValue === 0 || currentUsage <= 0) return null;

  // ⚠️ Soft Warning: การใช้เพิ่มขึ้นเกิน 100% (2 เท่า)
  const increasePercent = (currentUsage / oldValue) * 100;

  if (increasePercent > USAGE_WARNING_THRESHOLD) {
    return {
      type: "warning",
      message: `การใช้ไฟเพิ่มขึ้น ${Math.round(increasePercent)}%`,
      detail: `เดือนก่อนใช้ ${oldValue} หน่วย → เดือนนี้ใช้ ${currentUsage} หน่วย (เพิ่มขึ้น ${Math.round(increasePercent)}%)`,
    };
  }

  return null;
});

const waterWarning = computed(() => {
  if (!debouncedReadings.value.water || debouncedReadings.value.water === "" || waterHardBlock.value) return null;

  const oldValue = Number(props.room.oldWater) || 0;
  const newValue = Number(debouncedReadings.value.water);
  const currentUsage = newValue - oldValue;

  // ถ้ายังไม่มีข้อมูลเก่า ไม่ต้องเช็ค
  if (oldValue === 0 || currentUsage <= 0) return null;

  // ⚠️ Soft Warning: การใช้น้ำเพิ่มขึ้นเกิน 100% (2 เท่า)
  const increasePercent = (currentUsage / oldValue) * 100;

  if (increasePercent > USAGE_WARNING_THRESHOLD) {
    return {
      type: "warning",
      message: `การใช้น้ำเพิ่มขึ้น ${Math.round(increasePercent)}%`,
      detail: `เดือนก่อนใช้ ${oldValue} หน่วย → เดือนนี้ใช้ ${currentUsage} หน่วย (เพิ่มขึ้น ${Math.round(increasePercent)}%)`,
    };
  }

  return null;
});

// ✨ Combined check: ถ้ามี Hard Block ต้องยอมรับก่อนถึงจะบันทึกได้
const canProceed = computed(() => {
  // ต้องกรอกข้อมูลครบทั้ง 2 ค่า
  const hasReadings = readings.value.elec !== "" && readings.value.water !== "";

  if (!hasReadings) return false;

  // ถ้ามี Hard Block Warning ต้องกด checkbox ยอมรับก่อน
  const elecBlocked = elecHardBlock.value !== null && !elecHardBlock.value.isAccepted;
  const waterBlocked = waterHardBlock.value !== null && !waterHardBlock.value.isAccepted;

  // ถ้ามี warning ที่ยังไม่ได้ยอมรับ ห้ามบันทึก
  if (elecBlocked || waterBlocked) return false;

  // กรณีอื่นๆ บันทึกได้ (รวมถึง Soft Warning ที่ไม่ต้องยอมรับ)
  return true;
});


// --- Core Logic & API Interaction ---

// 1. Create a dedicated function for the core saving logic.
const saveReading = async () => {
  // Prevent saving if data is incomplete or already saving.
  if (!canProceed.value || isSaving.value) return false;

  isSaving.value = true;
  const payload = {
    invoiceId: props.room.invoiceId,
    newElec: Number(readings.value.elec),
    newWater: Number(readings.value.water),
  };

  try {
    const response = await billingStore.saveSingleMeterReading(payload);
    if (response.success) {
      emit("save", { ...payload, isCompleted: true }, "update-only");
      // ✨ Show quick toast (1 second) for meter reading saves
      toast.success(`บันทึกห้อง ${props.room.roomNumber} แล้ว`, { duration: 1000 });
      return true; // Indicate success
    } else {
      notify.showError(response.error?.message || "ไม่สามารถบันทึกข้อมูลได้");
      return false; // Indicate failure
    }
  } catch (error) {
    notify.showError(error);
    return false; // Indicate failure
  } finally {
    isSaving.value = false;
  }
};

// 2. The debounced function now simply calls the core save function.
const debouncedSave = useDebounceFn(saveReading, 700);

watch(
  readings,
  (currentReadings, oldReadings) => {
    // Only trigger save if there was an actual change
    if (
      currentReadings.elec !== oldReadings.elec ||
      currentReadings.water !== oldReadings.water
    ) {
      debouncedSave();
    }
  },
  { deep: true }
);

// --- User Flow & Event Handlers ---
const handleKeyPress = (key) => {
  const target = activeInput.value === "elec" ? "elec" : "water";
  if (key === "backspace") {
    readings.value[target] = readings.value[target].slice(0, -1);
  } else if (key === "clear") {
    readings.value[target] = "";
  } else if (readings.value[target].length < 8) {
    readings.value[target] += key;
  }
};

// ✨ Loading state for save buttons
const isManualSaving = ref(false);

// 3. The footer buttons now call the core save function directly for an immediate response.
const saveAndFlow = async (flowTo) => {
  if (!canProceed.value) {
    notify.showError("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  isManualSaving.value = true; // Show loading
  const success = await saveReading();
  isManualSaving.value = false; // Hide loading

  if (success) {
    const payload = {
      invoiceId: props.room.invoiceId,
      newElec: Number(readings.value.elec),
      newWater: Number(readings.value.water),
      isCompleted: true,
    };
    emit("save", payload, flowTo);
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-slate-100 z-50 flex flex-col">
    <header class="flex-shrink-0 bg-white p-4">
      <div class="flex justify-between items-center max-w-md mx-auto">
        <h2 class="text-xl font-bold text-slate-900">
          ห้อง {{ room.roomNumber }}
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 text-slate-500 hover:text-slate-800"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
    </header>

    <main
      class="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full"
    >
      <!-- ✨ Hard Block Errors (ด่านที่ 1) -->
      <div v-if="elecHardBlock || waterHardBlock" class="space-y-3 mb-4">
        <!-- Electricity Hard Block -->
        <div
          v-if="elecHardBlock"
          class="p-4 rounded-lg bg-red-100 border-2 border-red-500"
        >
          <div class="flex items-start gap-2">
            <ExclamationTriangleIcon class="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div class="flex-1">
              <p class="text-sm font-bold text-red-900">
                ⚡ {{ elecHardBlock.message }}
              </p>
              <p class="text-xs mt-1 text-red-700">
                {{ elecHardBlock.detail }}
              </p>

              <!-- Single Checkbox for Acceptance -->
              <div class="mt-3">
                <label class="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="meterExceptions.elec"
                    class="w-4 h-4 mt-0.5 text-red-600 rounded focus:ring-red-500"
                  />
                  <span class="text-xs text-red-800 font-semibold">
                    ✓ ฉันยืนยันว่าได้ตรวจสอบแล้ว และยอมรับค่านี้
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Water Hard Block -->
        <div
          v-if="waterHardBlock"
          class="p-4 rounded-lg bg-red-100 border-2 border-red-500"
        >
          <div class="flex items-start gap-2">
            <ExclamationTriangleIcon class="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div class="flex-1">
              <p class="text-sm font-bold text-red-900">
                💧 {{ waterHardBlock.message }}
              </p>
              <p class="text-xs mt-1 text-red-700">
                {{ waterHardBlock.detail }}
              </p>

              <!-- Single Checkbox for Acceptance -->
              <div class="mt-3">
                <label class="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="meterExceptions.water"
                    class="w-4 h-4 mt-0.5 text-red-600 rounded focus:ring-red-500"
                  />
                  <span class="text-xs text-red-800 font-semibold">
                    ✓ ฉันยืนยันว่าได้ตรวจสอบแล้ว และยอมรับค่านี้
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ⚠️ Soft Warnings (ด่านที่ 2) -->
      <div v-if="elecWarning || waterWarning" class="space-y-2 mb-4">
        <!-- Electricity Warning -->
        <div
          v-if="elecWarning"
          class="p-3 rounded-lg bg-amber-100 border-2 border-amber-500"
        >
          <div class="flex items-start gap-2">
            <ExclamationTriangleIcon class="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div class="flex-1">
              <p class="text-sm font-bold text-amber-900">
                ⚡ {{ elecWarning.message }}
              </p>
              <p class="text-xs mt-1 text-amber-700">
                {{ elecWarning.detail }}
              </p>
            </div>
          </div>
        </div>

        <!-- Water Warning -->
        <div
          v-if="waterWarning"
          class="p-3 rounded-lg bg-amber-100 border-2 border-amber-500"
        >
          <div class="flex items-start gap-2">
            <ExclamationTriangleIcon class="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div class="flex-1">
              <p class="text-sm font-bold text-amber-900">
                💧 {{ waterWarning.message }}
              </p>
              <p class="text-xs mt-1 text-amber-700">
                {{ waterWarning.detail }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div
          @click="activeInput = 'elec'"
          :class="[
            'p-4 rounded-lg text-center cursor-pointer transition-all',
            activeInput === 'elec'
              ? 'bg-white ring-2 ring-blue-500 shadow-lg'
              : 'bg-white/70',
            elecAnomaly?.type === 'critical' ? 'ring-2 ring-red-500' : '',
          ]"
        >
          <p
            class="text-sm font-medium text-slate-500 flex items-center justify-center gap-1"
          >
            <BoltIcon class="w-4 h-4 text-yellow-400" /> ไฟฟ้า (เก่า)
          </p>
          <p class="text-2xl font-mono text-slate-800 mt-1">
            {{ room.oldElec }}
          </p>
          <hr class="my-3" />
          <p class="text-sm font-medium text-slate-500">เลขมิเตอร์ใหม่</p>
          <p
            class="text-4xl font-bold font-mono h-12"
            :class="elecAnomaly?.type === 'critical' ? 'text-red-600' : 'text-blue-600'"
          >
            {{ readings.elec || "..." }}
          </p>
        </div>
        <div
          @click="activeInput = 'water'"
          :class="[
            'p-4 rounded-lg text-center cursor-pointer transition-all',
            activeInput === 'water'
              ? 'bg-white ring-2 ring-blue-500 shadow-lg'
              : 'bg-white/70',
            waterAnomaly?.type === 'critical' ? 'ring-2 ring-red-500' : '',
          ]"
        >
          <p
            class="text-sm font-medium text-slate-500 flex items-center justify-center gap-1"
          >
            <CloudIcon class="w-4 h-4 text-sky-400" /> ค่าน้ำ (เก่า)
          </p>
          <p class="text-2xl font-mono text-slate-800 mt-1">
            {{ room.oldWater }}
          </p>
          <hr class="my-3" />
          <p class="text-sm font-medium text-slate-500">เลขมิเตอร์ใหม่</p>
          <p
            class="text-4xl font-bold font-mono h-12"
            :class="waterAnomaly?.type === 'critical' ? 'text-red-600' : 'text-blue-600'"
          >
            {{ readings.water || "..." }}
          </p>
        </div>
      </div>

      <NumericKeypad @key-press="handleKeyPress" />
    </main>

    <footer class="flex-shrink-0 bg-white/80 backdrop-blur-sm p-4 border-t">
      <div class="max-w-md mx-auto grid grid-cols-2 gap-4">
        <BaseButton
          @click="saveAndFlow('close')"
          variant="secondary"
          size="lg"
          :disabled="!canProceed"
        >
          บันทึกและปิด
        </BaseButton>
        <BaseButton
          v-if="nextRoomExists"
          @click="saveAndFlow('next')"
          size="lg"
          :disabled="!canProceed"
        >
          บันทึก & ห้องถัดไป
        </BaseButton>
      </div>
    </footer>

    <!-- ✨ Loading Modal -->
    <div
      v-if="isManualSaving"
      class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center"
    >
      <div class="bg-white rounded-xl shadow-2xl p-6 mx-4 max-w-xs w-full">
        <div class="flex flex-col items-center gap-4">
          <!-- Spinner -->
          <div class="relative">
            <div
              class="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"
            ></div>
          </div>
          <!-- Text -->
          <div class="text-center">
            <p class="text-lg font-semibold text-gray-900">กำลังบันทึก...</p>
            <p class="text-sm text-gray-500 mt-1">
              กรุณารอสักครู่
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
