<script setup>
import { storeToRefs } from "pinia";
import { useSettingsStore } from "./store/settingsStore";
import { PlusIcon, EllipsisVerticalIcon } from "@heroicons/vue/24/solid";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";

import BaseButton from "~/components/ui/BaseButton.vue";
import AddEditServiceModal from "./components/finance/AddEditServiceModal.vue";
import {
  CurrencyInput,
  BaseInput,
  BaseSelect,
  BaseSwitch,
} from "~/components/form";
import { useServicesStore } from "~/store/servicesStore";

const settingsStore = useSettingsStore();
const servicesStore = useServicesStore();

// ✨ ดึง State `settings` มาใช้ ซึ่งตอนนี้จะมี finance defaults อยู่
const { settings } = storeToRefs(settingsStore);
const { show: showConfirm } = useConfirm();
const { currency } = useFormatters();

const addEditServiceModal = ref(null);
const serviceToEdit = ref(null);

// --- Methods ---
const openAddServiceModal = () => {
  serviceToEdit.value = null;
  addEditServiceModal.value?.open();
};

const openEditServiceModal = (service) => {
  serviceToEdit.value = service;
  addEditServiceModal.value?.open(service);
};

const handleDeleteService = async (service) => {
  const confirmed = await showConfirm({
    title: `ลบบริการ "${service.name}"`,
    message: "คุณแน่ใจหรือไม่? การลบบริการนี้จะไม่มีผลกับสัญญาที่สร้างไปแล้ว",
    intent: "danger",
    confirmText: "ยืนยันการลบ",
  });
  if (confirmed) {
    await servicesStore.deleteService(service.id);
    await settingsStore.fetchSettings();
  }
};

const getBillingCycleLabel = (cycle) => {
  const map = {
    ONETIME: "ครั้งเดียว",
    MONTHLY: "รายเดือน",
    YEARLY: "รายปี",
  };
  return map[cycle] || cycle;
};

const onActionSuccess = () => {
  settingsStore.fetchSettings();
};
</script>

<template>
  <div v-if="settings" class="space-y-8">
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold leading-7 text-gray-900">
          การตั้งค่ารอบบิล
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          กำหนดวันตัดรอบและวันครบกำหนดชำระมาตรฐาน
        </p>
        <div
          class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-200 pt-4"
        >
          <BaseInput
            v-model.number="settings.finance.billingCycle.cutoffDay"
            label="วันที่ตัดรอบบิลของทุกเดือน"
            type="number"
            min="1"
            max="28"
          />
          <BaseInput
            v-model.number="settings.finance.billingCycle.dueDays"
            label="กำหนดชำระภายใน (วัน)"
            type="number"
            min="1"
          />
        </div>
      </div>
    </div>

    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold leading-7 text-gray-900">
          ค่าสาธารณูปโภค (ค่าเริ่มต้น)
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          กำหนดวิธีการคิดค่าน้ำ-ค่าไฟมาตรฐานสำหรับสัญญาใหม่
        </p>

        <div
          class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 border-t border-gray-200 pt-6"
        >
          <div class="space-y-4">
            <h4 class="font-medium text-gray-800">การตั้งค่าค่าน้ำ</h4>
            <BaseSelect
              v-model="settings.finance.utilities.water.type"
              label="วิธีการคิดเงิน"
              :options="[
                { value: 'PER_UNIT', label: 'ตามหน่วยที่ใช้' },
                { value: 'FLAT_RATE', label: 'เหมาจ่ายรายเดือน' },
              ]"
            />
            <CurrencyInput
              v-model="settings.finance.utilities.water.rate"
              :label="
                settings.finance.utilities.water.type === 'PER_UNIT'
                  ? 'ราคา (บาท / หน่วย)'
                  : 'ราคา (บาท / เดือน)'
              "
            />
            <CurrencyInput
              v-if="settings.finance.utilities.water.type === 'PER_UNIT'"
              v-model="settings.finance.utilities.water.minimumCharge"
              label="ค่าบริการขั้นต่ำ (บาท)"
            />
          </div>

          <div class="space-y-4">
            <h4 class="font-medium text-gray-800">การตั้งค่าค่าไฟ</h4>
            <BaseSelect
              v-model="settings.finance.utilities.electricity.type"
              label="วิธีการคิดเงิน"
              :options="[
                { value: 'PER_UNIT', label: 'ตามหน่วยที่ใช้' },
                { value: 'FLAT_RATE', label: 'เหมาจ่ายรายเดือน' },
              ]"
            />
            <CurrencyInput
              v-model="settings.finance.utilities.electricity.rate"
              :label="
                settings.finance.utilities.electricity.type === 'PER_UNIT'
                  ? 'ราคา (บาท / หน่วย)'
                  : 'ราคา (บาท / เดือน)'
              "
            />
            <CurrencyInput
              v-if="settings.finance.utilities.electricity.type === 'PER_UNIT'"
              v-model="settings.finance.utilities.electricity.minimumCharge"
              label="ค่าบริการขั้นต่ำ (บาท)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold leading-7 text-gray-900">
          การตั้งค่าค่าปรับล่าช้า
        </h3>
        <div class="mt-4 space-y-4">
          <BaseSwitch
            v-model="settings.finance.lateFee.enabled"
            label="เปิดใช้งานค่าปรับล่าช้า"
            description="ระบบจะเพิ่มค่าปรับในบิลถัดไปโดยอัตโนมัติเมื่อเกินกำหนดชำระ"
          />
          <div
            v-if="settings.finance.lateFee.enabled"
            class="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t pt-4"
          >
            <BaseSelect
              v-model="settings.finance.lateFee.type"
              label="ประเภทค่าปรับ"
              :options="[
                { value: 'FIXED', label: 'ปรับเป็นจำนวนเงินคงที่' },
                { value: 'PERCENTAGE', label: 'ปรับเป็นเปอร์เซ็นต์' },
              ]"
            />
            <CurrencyInput
              v-model="settings.finance.lateFee.value"
              label="จำนวน"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-base font-semibold leading-7 text-gray-900">
              ค่าบริการเสริม (Service Catalog)
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              สร้างแคตตาล็อกค่าบริการเสริมเพื่อนำไปผูกกับสัญญา
            </p>
          </div>
          <BaseButton @click="openAddServiceModal" :icon="PlusIcon"
            >เพิ่มบริการ</BaseButton
          >
        </div>

        <div class="mt-4 border-t border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50/50">
              <tr>
                <th
                  class="py-3 pl-6 text-left text-xs font-semibold uppercase text-gray-500"
                >
                  ชื่อบริการ
                </th>
                <th
                  class="py-3 px-3 text-left text-xs font-semibold uppercase text-gray-500"
                >
                  ราคามาตรฐาน
                </th>
                <th
                  class="py-3 px-3 text-left text-xs font-semibold uppercase text-gray-500"
                >
                  รอบบิล
                </th>
                <th class="relative py-3.5 pl-3 pr-6">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-if="
                  !settings.finance.services ||
                  settings.finance.services.length === 0
                "
              >
                <td colspan="4" class="text-center text-sm text-gray-500 py-10">
                  ยังไม่มีบริการเสริม, กด "เพิ่มบริการ" เพื่อเริ่มต้น
                </td>
              </tr>
              <tr
                v-for="service in settings.finance.services"
                :key="service.id"
                class="hover:bg-gray-50"
              >
                <td class="py-3 pl-6 text-sm font-medium text-gray-900">
                  <div class="flex items-center gap-x-2">
                    <span>{{ service.name }}</span>
                    <span
                      v-if="!service.isOptional"
                      class="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20"
                    >
                      บังคับ
                    </span>
                  </div>
                </td>
                <td class="px-3 py-3 text-sm text-gray-500">
                  {{ currency(service.defaultPrice) }}
                </td>
                <td class="px-3 py-3 text-sm text-gray-500">
                  {{ getBillingCycleLabel(service.billingCycle) }}
                </td>
                <td class="relative py-2 pr-4 text-right">
                  <Menu as="div" class="relative inline-block text-left">
                    <MenuButton
                      class="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                      ><EllipsisVerticalIcon class="h-5 w-5"
                    /></MenuButton>
                    <MenuItems
                      class="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div class="py-1">
                        <MenuItem v-slot="{ active }">
                          <button
                            @click="openEditServiceModal(service)"
                            :class="[
                              active ? 'bg-gray-100' : '',
                              'block w-full text-left px-4 py-2 text-sm text-gray-700',
                            ]"
                          >
                            แก้ไข
                          </button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                          <button
                            @click="handleDeleteService(service)"
                            :class="[
                              active ? 'bg-red-50' : '',
                              'block w-full text-left px-4 py-2 text-sm text-red-600',
                            ]"
                          >
                            ลบ
                          </button>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Menu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <AddEditServiceModal ref="addEditServiceModal" @success="onActionSuccess" />
  </div>
</template>
