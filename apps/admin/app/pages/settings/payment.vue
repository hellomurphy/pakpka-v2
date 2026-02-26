<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { usePropertyStore } from "~/store/propertyStore";
import { useReceivingAccountsStore } from "./store/receivingAccounts";

import { useConfirm } from "~/composables/useConfirm";
import { PlusIcon, EllipsisVerticalIcon } from "@heroicons/vue/24/solid";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import { BaseSwitch } from "~/components/form";
import AddEditPaymentMethodModal from "./components/payment/AddEditPaymentMethodModal.vue";

// --- Store Connections ---
const propertyStore = usePropertyStore();
const accountsStore = useReceivingAccountsStore();

const { propertyId } = storeToRefs(propertyStore);
const { bankAccounts, promptPayAccounts, isLoading } =
  storeToRefs(accountsStore);
const { show: showConfirm } = useConfirm();

// --- Local State ---
const activeSubTab = ref("bank_account");
const addEditModal = ref(null);


// --- Data Fetching ---
const fetchAccountsData = () => {
  if (propertyId.value) {
    accountsStore.fetchAccounts(propertyId.value);
  }
};

watch(propertyId, fetchAccountsData, { immediate: true });

// --- Methods ---
const openAddModal = (type) => {
  // The modal's open method expects (methodToEdit, typeToAdd)
  addEditModal.value?.open(null, type);
};

const openEditModal = (method) => {
  addEditModal.value?.open(method);
};

const handleDelete = async (method) => {
  const confirmed = await showConfirm({
    title: "ยืนยันการลบ",
    message: `คุณต้องการลบช่องทางการชำระเงินนี้ใช่หรือไม่? ข้อมูลนี้จะถูกลบอย่างถาวร`,
    intent: "danger",
    confirmText: "ยืนยันและลบ",
  });
  if (confirmed) {
    await accountsStore.deleteAccount(method.id);
  }
};

const handleToggleActive = async (account) => {
  // The store action should handle the API call and optimistic update
  await accountsStore.updateAccount(account.id, { isActive: account.isActive });
};
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold leading-7 text-gray-900">
          ช่องทางการรับชำระเงิน
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          จัดการบัญชีธนาคารและพร้อมเพย์ที่จะแสดงในใบแจ้งหนี้เพื่อให้ผู้เช่าชำระเงิน
        </p>
      </div>

      <div class="border-b border-gray-200 px-4 sm:px-6">
        <nav class="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            @click="activeSubTab = 'bank_account'"
            :class="[
              activeSubTab === 'bank_account'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium',
            ]"
          >
            บัญชีธนาคาร
          </button>
          <button
            @click="activeSubTab = 'promptpay'"
            :class="[
              activeSubTab === 'promptpay'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium',
            ]"
          >
            พร้อมเพย์ (PromptPay)
          </button>
        </nav>
      </div>

      <div v-show="activeSubTab === 'bank_account'">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <p class="text-sm text-gray-600">
              จัดการรายชื่อบัญชีธนาคารสำหรับรับโอนเงิน
            </p>
            <BaseButton
              @click="openAddModal('BANK_ACCOUNT')"
              :icon="PlusIcon"
              size="sm"
              >เพิ่มบัญชี</BaseButton
            >
          </div>
          <div v-if="isLoading" class="text-center py-10 text-gray-500">
            กำลังโหลด...
          </div>
          <ul
            v-else-if="bankAccounts.length > 0"
            role="list"
            class="divide-y divide-gray-100"
          >
            <li
              v-for="account in bankAccounts"
              :key="account.id"
              class="flex justify-between items-center gap-x-6 py-4"
            >
              <div class="flex min-w-0 gap-x-4">
                <div class="min-w-0 flex-auto">
                  <p class="text-sm font-semibold leading-6 text-gray-900">
                    {{ account.details.bankName }}
                  </p>
                  <p class="mt-1 truncate text-xs leading-5 text-gray-500">
                    {{ account.details.accountName }}
                  </p>
                  <p class="mt-1 truncate text-xs leading-5 text-gray-500">
                    เลขที่: {{ account.details.accountNumber }}
                  </p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-x-4">
                <BaseSwitch
                  v-model="account.isActive"
                  @update:modelValue="handleToggleActive(account)"
                />
                <Menu as="div" class="relative inline-block text-left">
                  <MenuButton
                    class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    ><EllipsisVerticalIcon class="h-5 w-5"
                  /></MenuButton>
                  <transition>
                    <MenuItems
                      class="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="openEditModal(account)"
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
                          @click="handleDelete(account)"
                          :class="[
                            active ? 'bg-red-50' : '',
                            'block w-full text-left px-4 py-2 text-sm text-red-600',
                          ]"
                        >
                          ลบ
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </transition>
                </Menu>
              </div>
            </li>
          </ul>
          <div
            v-else
            class="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <p class="text-sm text-gray-500">ยังไม่มีบัญชีธนาคาร</p>
            <BaseButton
              @click="openAddModal('BANK_ACCOUNT')"
              :icon="PlusIcon"
              size="sm"
              class="mt-4"
              >เพิ่มบัญชีธนาคารแรก</BaseButton
            >
          </div>
        </div>
      </div>

      <div v-show="activeSubTab === 'promptpay'">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <p class="text-sm text-gray-600">
              จัดการข้อมูลพร้อมเพย์สำหรับสร้าง Dynamic QR Code
            </p>
            <BaseButton
              v-if="promptPayAccounts.length === 0"
              @click="openAddModal('PROMPTPAY')"
              :icon="PlusIcon"
              size="sm"
              >เพิ่มพร้อมเพย์</BaseButton
            >
          </div>
          <div v-if="isLoading" class="text-center py-10 text-gray-500">
            กำลังโหลด...
          </div>
          <ul
            v-else-if="promptPayAccounts.length > 0"
            role="list"
            class="divide-y divide-gray-100"
          >
            <li
              v-for="account in promptPayAccounts"
              :key="account.id"
              class="flex justify-between items-center gap-x-6 py-4"
            >
              <div class="flex min-w-0 gap-x-4">
                <div class="min-w-0 flex-auto">
                  <p class="text-sm font-semibold leading-6 text-gray-900">
                    {{ account.details.recipientName }}
                  </p>
                  <p class="mt-1 truncate text-xs leading-5 text-gray-500">
                    พร้อมเพย์: {{ account.details.promptpayNumber }}
                  </p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-x-4">
                <BaseSwitch
                  v-model="account.isActive"
                  @update:modelValue="handleToggleActive(account)"
                />
                <Menu as="div" class="relative inline-block text-left">
                  <MenuButton
                    class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    ><EllipsisVerticalIcon class="h-5 w-5"
                  /></MenuButton>
                  <transition>
                    <MenuItems
                      class="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="openEditModal(account)"
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
                          @click="handleDelete(account)"
                          :class="[
                            active ? 'bg-red-50' : '',
                            'block w-full text-left px-4 py-2 text-sm text-red-600',
                          ]"
                        >
                          ลบ
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </transition>
                </Menu>
              </div>
            </li>
          </ul>
          <div
            v-else
            class="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <p class="text-sm text-gray-500">ยังไม่มีข้อมูลพร้อมเพย์</p>
            <BaseButton
              @click="openAddModal('PROMPTPAY')"
              :icon="PlusIcon"
              size="sm"
              class="mt-4"
              >เพิ่มข้อมูลพร้อมเพย์</BaseButton
            >
          </div>
        </div>
      </div>
    </div>

    <AddEditPaymentMethodModal
      ref="addEditModal"
      @success="fetchAccountsData"
    />
  </div>
</template>
