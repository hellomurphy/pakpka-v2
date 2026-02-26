<script setup>
import { ref, computed } from "vue";
import { useFormatters } from "~/composables/useFormatters";
import BaseModal from "~/components/ui/BaseModal.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import {
  UserCircleIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  SunIcon,
  CloudIcon,
} from "@heroicons/vue/24/outline";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.locale("th");
dayjs.extend(buddhistEra);

const isModalOpen = ref(false);
const contract = ref(null);
const roomInfo = ref(null);
const isLoading = ref(false);

const { currency, fullDate } = useFormatters();
const { getContractStatusInfo } = useStatusStyles();

/**
 * ฟังก์ชันสาธารณะสำหรับเปิด Modal
 * @param {object} dataObject - object ที่รับเข้ามาอาจจะเป็น room หรือ tenant
 * ซึ่งต้องมี activeContract อยู่ข้างใน
 */
const open = async (dataObject) => {
  const contractData = dataObject?.activeContract;

  if (!contractData?.id) {
    console.error("ViewContractModal: No activeContract data provided.");
    return;
  }

  // เปิด modal ก่อน (แสดง loading)
  isModalOpen.value = true;
  isLoading.value = true;
  contract.value = null;

  // ดึงข้อมูลห้องจาก object ที่ส่งมา
  roomInfo.value = {
    roomNumber: dataObject.roomNumber || contractData.room?.roomNumber,
    roomType: dataObject.roomType || contractData.room?.roomType,
  };

  try {
    // Lazy load: ดึงข้อมูลสัญญาแบบเต็มจาก API
    const response = await useApiFetch(`/api/contracts/${contractData.id}`);

    if (response.success) {
      contract.value = response.data;

      // อัปเดต roomInfo ถ้ามีข้อมูลจาก API
      if (response.data.room) {
        roomInfo.value = {
          roomNumber: response.data.room.roomNumber,
          roomType: response.data.room.roomType,
        };
      }
    }
  } catch (error) {
    console.error("Failed to load contract details:", error);
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  contract.value = null;
  isLoading.value = false;
};

defineExpose({ open });

// --- Helper Functions for Display ---
const getBillingTypeLabel = (type) => {
  return type === "FLAT_RATE" ? "เหมาจ่าย" : "ตามหน่วย";
};

const primaryTenant = computed(() => {
  return contract.value?.tenants?.find((t) => t.isPrimary)?.tenant;
});
</script>

<template>
  <BaseModal v-model="isModalOpen" maxWidth="lg">
    <template #title>
      <div class="flex justify-between items-center">
        <span>รายละเอียดสัญญา: ห้อง {{ roomInfo?.roomNumber || '...' }}</span>
        <span
          v-if="contract?.status"
          :class="[
            getContractStatusInfo(contract.status).class,
            'text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-inset',
          ]"
        >
          {{ getContractStatusInfo(contract.status).text }}
        </span>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="mt-6 flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Content -->
    <div v-else-if="contract && roomInfo" class="mt-6 space-y-6">
      <div>
        <h3
          class="text-base font-semibold text-gray-800 flex items-center gap-2"
        >
          <UserCircleIcon class="h-5 w-5 text-gray-500" />
          ข้อมูลผู้เช่าและห้องพัก
        </h3>
        <dl class="mt-2 divide-y divide-gray-100 border-t border-gray-200">
          <div class="py-3 grid grid-cols-3 gap-4">
            <dt class="text-sm font-medium text-gray-600">ผู้เช่าหลัก</dt>
            <dd class="text-sm text-gray-900 col-span-2 font-semibold">
              {{ primaryTenant?.name || "N/A" }}
            </dd>
          </div>
          <div class="py-3 grid grid-cols-3 gap-4">
            <dt class="text-sm font-medium text-gray-600">เบอร์โทรศัพท์</dt>
            <dd class="text-sm text-gray-900 col-span-2">
              {{ primaryTenant?.phone || "-" }}
            </dd>
          </div>
          <div class="py-3 grid grid-cols-3 gap-4">
            <dt class="text-sm font-medium text-gray-600">ประเภทห้อง</dt>
            <dd class="text-sm text-gray-900 col-span-2">
              {{ roomInfo.roomType?.name || "N/A" }}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h3
          class="text-base font-semibold text-gray-800 flex items-center gap-2"
        >
          <BanknotesIcon class="h-5 w-5 text-gray-500" />
          การเงินและระยะเวลาสัญญา
        </h3>
        <dl class="mt-2 divide-y divide-gray-100 border-t border-gray-200">
          <div class="py-3 grid grid-cols-3 gap-4">
            <dt class="text-sm font-medium text-gray-600">ค่าเช่า</dt>
            <dd class="text-sm text-gray-900 col-span-2 font-semibold">
              {{ currency(contract.rentAmount) }} / เดือน
            </dd>
          </div>
          <div
            v-if="contract.deposits && contract.deposits.length > 0"
            class="py-3 grid grid-cols-3 gap-4"
          >
            <dt class="text-sm font-medium text-gray-600">เงินประกัน</dt>
            <dd class="text-sm text-gray-900 col-span-2">
              {{ currency(contract.deposits[0].amount) }}
            </dd>
          </div>
          <div class="py-3 grid grid-cols-3 gap-4">
            <dt class="text-sm font-medium text-gray-600">วันเริ่มสัญญา</dt>
            <dd class="text-sm text-gray-900 col-span-2">
              {{ fullDate(contract.startDate) }}
            </dd>
          </div>
          <div class="py-3 grid grid-cols-3 gap-4">
            <dt class="text-sm font-medium text-gray-600">วันสิ้นสุดสัญญา</dt>
            <dd class="text-sm text-gray-900 col-span-2">
              {{ fullDate(contract.endDate) }}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h3
          class="text-base font-semibold text-gray-800 flex items-center gap-2"
        >
          <WrenchScrewdriverIcon class="h-5 w-5 text-gray-500" />
          ค่าบริการสาธารณูปโภคและบริการเสริม
        </h3>
        <dl class="mt-2 divide-y divide-gray-100 border-t border-gray-200">
          <div class="py-3 grid grid-cols-3 gap-4">
            <dt
              class="text-sm font-medium text-gray-600 flex items-center gap-1.5"
            >
              <CloudIcon class="h-5 w-5 text-sky-600" />ค่าน้ำ
            </dt>
            <dd class="text-sm text-gray-900 col-span-2">
              <p>
                {{ getBillingTypeLabel(contract.waterBillingType) }}
                <span v-if="contract.waterBillingType === 'PER_UNIT'">
                  ({{ currency(contract.waterRate) }}/หน่วย)</span
                >
                <span v-else> ({{ currency(contract.waterRate) }}/เดือน)</span>
              </p>
              <p
                v-if="
                  contract.waterBillingType === 'PER_UNIT' &&
                  contract.waterMinimumCharge > 0
                "
                class="text-xs text-gray-500"
              >
                ขั้นต่ำ {{ currency(contract.waterMinimumCharge) }}
              </p>
            </dd>
          </div>
          <div class="py-3 grid grid-cols-3 gap-4">
            <dt
              class="text-sm font-medium text-gray-600 flex items-center gap-1.5"
            >
              <SunIcon class="h-5 w-5 text-amber-500" />ค่าไฟ
            </dt>
            <dd class="text-sm text-gray-900 col-span-2">
              <p>
                {{ getBillingTypeLabel(contract.electricityBillingType) }}
                <span v-if="contract.electricityBillingType === 'PER_UNIT'">
                  ({{ currency(contract.electricityRate) }}/หน่วย)</span
                >
                <span v-else>
                  ({{ currency(contract.electricityRate) }}/เดือน)</span
                >
              </p>
              <p
                v-if="
                  contract.electricityBillingType === 'PER_UNIT' &&
                  contract.electricityMinimumCharge > 0
                "
                class="text-xs text-gray-500"
              >
                ขั้นต่ำ {{ currency(contract.electricityMinimumCharge) }}
              </p>
            </dd>
          </div>
          <div v-if="contract.services && contract.services.length > 0">
            <div
              v-for="service in contract.services"
              :key="service.id"
              class="py-3 grid grid-cols-3 gap-4"
            >
              <dt class="text-sm font-medium text-gray-600">
                {{ service.service.name }}
              </dt>
              <dd class="text-sm text-gray-900 col-span-2">
                {{
                  currency(service.customPrice || service.service.defaultPrice)
                }}
                / เดือน
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </div>

    <template #footer>
      <div v-if="!isLoading && contract" class="w-full flex justify-between items-center">
        <NuxtLink :to="`/contracts/${contract.id}`">
          <BaseButton variant="secondary">ไปที่หน้าจัดการสัญญา</BaseButton>
        </NuxtLink>
        <BaseButton @click="closeModal">ปิด</BaseButton>
      </div>
      <div v-else class="w-full flex justify-end">
        <BaseButton @click="closeModal">ปิด</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
