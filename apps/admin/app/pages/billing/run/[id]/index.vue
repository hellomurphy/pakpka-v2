<script setup>
import { computed } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useBillingStore } from "~/store/billingStore";
import {
  CheckCircleIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/solid";
import BaseButton from "~/components/ui/BaseButton.vue";

// Day.js configuration for Thai language and Buddhist Era
dayjs.locale("th");
dayjs.extend(buddhistEra);

// --- Store & Route ---
const route = useRoute();
const billingStore = useBillingStore();
const runId = route.params.id;

// --- State Management ---
const { activeRun, isLoading } = storeToRefs(billingStore);

// Fetch the data for the current billing run when the page loads.
// This ensures we always have the latest status.
useAsyncData(`billing-run-${runId}`, () => billingStore.fetchActiveRun(runId));

// --- UI State Logic (The Core Refinement) ---

// Step 1 is complete if the activeRun object exists.
const isStep1Complete = computed(() => !!activeRun.value);

// Step 2 (Meter Reading) is the current "active" task if its status says so.
const isMeterReadingStepActive = computed(
  () => activeRun.value?.status === "PENDING_METER_READING"
);

// This is now just a VISUAL indicator, not a blocker.
// It checks if all required meters have been read.
const isMeterReadingFullyComplete = computed(() => {
  if (!activeRun.value) return false;
  // Handle cases where there are no meters to read
  if (activeRun.value.meterReadingRequired === 0) return true;
  return (
    activeRun.value.meterReadingCompletedCount >=
    activeRun.value.meterReadingRequired
  );
});

// ✨ CRITICAL CHANGE: The Review & Send step is now active as soon as Step 1 is done.
// We are no longer forcing the user to complete meter readings first.
const isReviewAndSendStepActive = computed(
  () =>
    activeRun.value &&
    (activeRun.value.status === "PENDING_METER_READING" ||
      activeRun.value.status === "PENDING_REVIEW")
);

// The final step is complete only when the status reflects it.
const isProcessFinished = computed(
  () =>
    activeRun.value?.status === "SENDING" ||
    activeRun.value?.status === "COMPLETED"
);
</script>

<template>
  <div v-if="isLoading" class="p-6 text-center text-gray-500">
    กำลังโหลดข้อมูลรอบบิล...
  </div>

  <div v-else-if="activeRun" class="p-6 md:px-8 bg-white rouded-xl shadow-md min-h-full">
    <header class="mb-8">
      <div class="flex items-center gap-4">
        <NuxtLink to="/billing">
          <BaseButton variant="secondary" size="sm">
            <ArrowLeftIcon class="h-5 w-5" />
            กลับไปภาพรวม
          </BaseButton>
        </NuxtLink>
      </div>
      <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900">
        รอบบิล: {{ dayjs(activeRun.period).format("MMMM BBBB") }}
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        ทำตามขั้นตอนเพื่อสร้างและส่งใบแจ้งหนี้สำหรับสัญญา
        {{ activeRun.totalContracts }} ฉบับ
      </p>
    </header>

    <div class="space-y-6 max-w-3xl">
      <div class="p-5 rounded-xl bg-white ring-1 ring-gray-900/5">
        <div class="flex items-start gap-x-4">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
            :class="[isStep1Complete ? 'bg-green-100' : 'bg-gray-100']"
          >
            <CheckCircleIcon
              class="h-6 w-6"
              :class="[isStep1Complete ? 'text-green-600' : 'text-gray-400']"
            />
          </div>
          <div>
            <h2 class="font-semibold text-gray-900">
              ขั้นตอนที่ 1: สร้างใบแจ้งหนี้ฉบับร่าง
            </h2>
            <p v-if="isStep1Complete" class="text-sm text-gray-500">
              ระบบได้สร้างใบแจ้งหนี้สำหรับ
              <strong>{{ activeRun.totalContracts }} สัญญา</strong>
              เรียบร้อยแล้ว
            </p>
          </div>
        </div>
      </div>

      <div
        class="p-5 rounded-xl bg-white ring-1"
        :class="[
          isMeterReadingStepActive
            ? 'ring-blue-500 shadow-lg'
            : 'ring-gray-900/5',
        ]"
      >
        <div class="flex items-start gap-x-4">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
            :class="[
              isMeterReadingFullyComplete
                ? 'bg-green-100'
                : isMeterReadingStepActive
                ? 'bg-blue-100'
                : 'bg-gray-100',
            ]"
          >
            <PencilSquareIcon
              class="h-6 w-6"
              :class="[
                isMeterReadingFullyComplete
                  ? 'text-green-600'
                  : isMeterReadingStepActive
                  ? 'text-blue-600'
                  : 'text-gray-400',
              ]"
            />
          </div>
          <div>
            <h2 class="font-semibold text-gray-900">
              ขั้นตอนที่ 2: จดบันทึกมิเตอร์
            </h2>
            <p v-if="isMeterReadingFullyComplete" class="text-sm text-gray-500">
              จดมิเตอร์ครบถ้วนแล้ว!
            </p>
            <p v-else class="text-sm text-gray-500">
              บันทึกค่าน้ำและค่าไฟสำหรับ
              <strong>{{ activeRun.meterReadingRequired }} ห้อง</strong>
              ที่ต้องจดมิเตอร์
            </p>
            <div class="mt-4">
              <NuxtLink :to="`/billing/run/${runId}/meter-reading`">
                <BaseButton :disabled="!isStep1Complete">
                  {{
                    isMeterReadingFullyComplete
                      ? "ดู/แก้ไขข้อมูลมิเตอร์"
                      : "ไปที่หน้าจดมิเตอร์"
                  }}
                </BaseButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div
        class="p-5 rounded-xl bg-white ring-1"
        :class="[
          !isMeterReadingStepActive && isReviewAndSendStepActive
            ? 'ring-blue-500 shadow-lg'
            : 'ring-gray-900/5',
        ]"
      >
        <div class="flex items-start gap-x-4">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
            :class="[
              isProcessFinished
                ? 'bg-green-100'
                : isReviewAndSendStepActive
                ? 'bg-blue-100'
                : 'bg-gray-100',
            ]"
          >
            <EnvelopeIcon
              class="h-6 w-6"
              :class="[
                isProcessFinished
                  ? 'text-green-600'
                  : isReviewAndSendStepActive
                  ? 'text-blue-600'
                  : 'text-gray-400',
              ]"
            />
          </div>
          <div>
            <h2 class="font-semibold text-gray-900">
              ขั้นตอนที่ 3: ตรวจสอบและส่งใบแจ้งหนี้
            </h2>
            <p v-if="isProcessFinished" class="text-sm text-green-600">
              ใบแจ้งหนี้ทั้งหมดถูกส่งเรียบร้อยแล้ว
            </p>
            <p v-else class="text-sm text-gray-500">
              ตรวจสอบความถูกต้องของใบแจ้งหนี้ทั้งหมดก่อนทำการส่ง
            </p>
            <div class="mt-4">
              <NuxtLink :to="`/billing/run/${runId}/review`">
                <BaseButton
                  :disabled="!isReviewAndSendStepActive"
                  :icon="MagnifyingGlassIcon"
                  variant="secondary"
                >
                  ไปที่หน้าตรวจสอบใบแจ้งหนี้
                </BaseButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
