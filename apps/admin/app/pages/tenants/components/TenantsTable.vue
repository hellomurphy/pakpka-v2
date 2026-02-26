<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useTenantsStore } from "../store/tenantsStore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { Float } from "@headlessui-float/vue";
import { EllipsisVerticalIcon } from "@heroicons/vue/24/solid";
import BaseTable from "~/components/ui/BaseTable.vue";
import { useFormatters } from "~/composables/useFormatters";
import { useWindowSize } from "@vueuse/core";
import { useBillingStore } from "~/store/billingStore";
import {
  PencilIcon,
  ArrowRightStartOnRectangleIcon,
  CheckBadgeIcon,
  DocumentMagnifyingGlassIcon,
  TrashIcon,
  ArchiveBoxXMarkIcon,
  CreditCardIcon,
} from "@heroicons/vue/24/outline";
import { PlusCircleIcon } from "@heroicons/vue/20/solid";

// --- Props & Emits ---
const props = defineProps({
  activeTab: { type: String, required: true },
});

const { show } = useNotification();
const router = useRouter();

const emit = defineEmits([
  "edit-tenant",
  "delete-tenant",
  "delete-permanent",
  "view-contract",
  "final-move-out",
  "notice-move-out",
  "confirm-check-in",
  "cancel-contract",
  "view-tenant-history",
  "renew-contract",
  "delete-waiting-list",
]);

const currentPage = defineModel("currentPage", { type: Number, default: 1 });

// --- Store Connection ---
const store = useTenantsStore();
const { tenants, isLoading, totalTenants } = storeToRefs(store);

const billingStore = useBillingStore();

// --- Formatters ---
const { currency, shortDate, phoneNumber } = useFormatters();

const { height: windowHeight } = useWindowSize();

const tableHeight = computed(() => {
  const otherElementsHeight = 290;
  return windowHeight.value - otherElementsHeight;
});

// --- Column Definitions (ยังคง Dynamic เหมือนเดิม) ---
const columns = computed(() => {
  switch (props.activeTab) {
    case "UPCOMING":
      return [
        { key: "tenantInfo", label: "ผู้เช่า" },
        { key: "checkinDate", label: "วันที่กำหนดเข้า" },
        { key: "actions", label: "", cellClass: "text-right" },
      ];
    case "NOTICE_GIVEN":
      return [
        { key: "tenantInfo", label: "ผู้เช่า / ห้อง" },
        { key: "contractEndDate", label: "วันที่สิ้นสุดสัญญา" },
        { key: "clearanceStatus", label: "สถานะการเคลียร์" },
        { key: "actions", label: "", cellClass: "text-right" },
      ];
    case "MOVED_OUT":
      return [
        { key: "name", label: "ชื่อผู้เช่า" },
        { key: "formerRoom", label: "ห้องที่เคยพัก" },
        { key: "stayPeriod", label: "ช่วงเวลาที่เข้าพัก" },
        { key: "actions", label: "", cellClass: "text-right" },
      ];
    case "WAITING_LIST":
      return [
        { key: "name", label: "ชื่อผู้ที่สนใจ" },
        { key: "phone", label: "เบอร์โทรติดต่อ" },
        // { key: "roomType", label: "ประเภทห้องที่สนใจ" },
        { key: "actions", label: "", cellClass: "text-right" },
      ];
    case "ACTIVE":
    default:
      return [
        { key: "tenantInfo", label: "ผู้เช่า / ห้อง" },
        { key: "phone", label: "เบอร์โทรศัพท์" },
        { key: "rentAmount", label: "ค่าเช่า" },
        { key: "contractEndDate", label: "สิ้นสุดสัญญา" },
        { key: "actions", label: "", cellClass: "text-right" },
      ];
  }
});

// --- Event Handlers for Actions ---
// ✨ ทำให้ฟังก์ชันกระชับขึ้นโดย emit event โดยตรง
const handleEdit = (item) => emit("edit-tenant", item);
const handleDelete = (item) => emit("delete-tenant", item);
const handleDeletePermanent = (item) => emit("delete-permanent", item);

const handleManageBills = async (tenant) => {
  const latestRunId = await billingStore.findLatestRunId();

  if (latestRunId) {
    router.push(
      `/billing/run/${latestRunId}/review?q=${encodeURIComponent(tenant.name)}`
    );
  } else {
    show({
      type: "info",
      message: "ยังไม่มีการสร้างรอบบิล กรุณาสร้างรอบบิลก่อน",
    });
  }
};
</script>

<template>
  <div class="mt-6">
    <BaseTable
      :columns="columns"
      :items="tenants"
      :loading="isLoading"
      v-model:currentPage="currentPage"
      :items-per-page="store.itemsPerPage"
      :total-items="totalTenants"
      :height="tableHeight"
    >
      <template #cell-tenantInfo="{ item }">
        <span>{{ item.name }} ({{ item.roomNumber }})</span>
      </template>

      <template #cell-phone="{ item }">
        <span>{{ phoneNumber(item.phone) }}</span>
      </template>

      <template #cell-checkinDate="{ item }">
        <span>{{ shortDate(item.checkinDate) }}</span>
      </template>

      <template #cell-rentAmount="{ item }">
        <span>{{ currency(item.rentAmount) }}</span>
      </template>

      <template #cell-contractEndDate="{ item }">
        <span>{{ shortDate(item.contractEndDate) }}</span>
      </template>

      <template #cell-actions="{ item }">
        <Menu as="div" class="relative inline-block text-left">
          <Float
            placement="bottom-end"
            :offset="4"
            :shift="8"
            :flip="8"
            portal
            :size="{
              apply({ availableWidth, elements }) {
                elements.floating.style.maxWidth = `${availableWidth}px`;
              },
            }"
          >
            <MenuButton
              class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <EllipsisVerticalIcon class="h-5 w-5" />
            </MenuButton>

            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems
                class="mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div class="py-1">
                  <template v-if="activeTab === 'ACTIVE'">
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="$emit('notice-move-out', item)"
                        :class="[
                          active
                            ? 'bg-amber-50 text-amber-800'
                            : 'text-amber-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm cursor-pointer',
                        ]"
                      >
                        <ArrowRightStartOnRectangleIcon class="mr-3 h-5 w-5" />
                        แจ้งย้ายออก
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="$emit('view-contract', item)"
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm cursor-pointer',
                        ]"
                      >
                        <DocumentMagnifyingGlassIcon class="mr-3 h-5 w-5" />
                        ดู/แก้ไขสัญญา
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click.prevent="handleEdit(item)"
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm cursor-pointer',
                        ]"
                      >
                        <PencilIcon class="mr-3 h-5 w-5" />
                        แก้ไขข้อมูลผู้เช่า
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="handleManageBills(item)"
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm cursor-pointer',
                        ]"
                      >
                        <CreditCardIcon class="mr-3 h-5 w-5" />
                        จัดการบิล
                      </button>
                    </MenuItem>
                  </template>

                  <template v-if="activeTab === 'UPCOMING'">
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="$emit('confirm-check-in', item)"
                        :class="[
                          active ? 'bg-blue-50 text-blue-800' : 'text-blue-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm font-semibold cursor-pointer',
                        ]"
                      >
                        <CheckBadgeIcon class="mr-3 h-5 w-5" />
                        ยืนยันการย้ายเข้า
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="$emit('view-contract', item)"
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm cursor-pointer',
                        ]"
                      >
                        <DocumentMagnifyingGlassIcon class="mr-3 h-5 w-5" />
                        ดู/แก้ไขสัญญา
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="$emit('cancel-contract', item)"
                        :class="[
                          active ? 'bg-red-50 text-red-800' : 'text-red-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm cursor-pointer',
                        ]"
                      >
                        <ArchiveBoxXMarkIcon class="mr-3 h-5 w-5" />
                        ยกเลิกสัญญา
                      </button>
                    </MenuItem>
                  </template>

                  <template v-if="activeTab === 'NOTICE_GIVEN'">
                    <MenuItem v-slot="{ active }">
                      <button
                        @click.prevent="emit('final-move-out', item)"
                        :class="[
                          active
                            ? 'bg-amber-50 text-amber-800'
                            : 'text-amber-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm font-semibold cursor-pointer',
                        ]"
                      >
                        <ArrowRightStartOnRectangleIcon class="mr-3 h-5 w-5" />
                        จัดการการย้ายออก
                      </button>
                    </MenuItem>

                    <MenuItem v-slot="{ active }">
                      <button
                        @click.prevent="emit('renew-contract', item)"
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm cursor-pointer',
                        ]"
                      >
                        <PlusCircleIcon class="mr-3 h-5 w-5" />
                        ขยาย/ต่อสัญญา
                      </button>
                    </MenuItem>
                  </template>

                  <template v-if="activeTab === 'WAITING_LIST'">
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="$emit('add-tenant', item)"
                        :class="[
                          active ? 'bg-blue-50 text-blue-800' : 'text-blue-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm font-semibold cursor-pointer',
                        ]"
                      >
                        สร้างสัญญา / กำหนดห้อง
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click.prevent="handleEdit(item)"
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm cursor-pointer',
                        ]"
                      >
                        <PencilIcon class="mr-3 h-5 w-5" />
                        แก้ไขข้อมูล
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="$emit('delete-waiting-list', item)"
                        :class="[
                          active ? 'bg-red-50 text-red-800' : 'text-red-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm',
                        ]"
                      >
                        ลบออกจากลิสต์
                      </button>
                    </MenuItem>
                  </template>

                  <template v-if="activeTab === 'MOVED_OUT'">
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="$emit('view-tenant-history', item)"
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm cursor-pointer',
                        ]"
                      >
                        <DocumentMagnifyingGlassIcon class="mr-3 h-5 w-5" />
                        ดูประวัติ
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click.prevent="handleDeletePermanent(item)"
                        :class="[
                          active ? 'bg-red-50 text-red-800' : 'text-red-700',
                          'group flex w-full items-center rounded-md px-4 py-2 text-sm cursor-pointer',
                        ]"
                      >
                        <TrashIcon class="mr-3 h-5 w-5" />
                        ลบข้อมูลถาวร
                      </button>
                    </MenuItem>
                  </template>
                </div>
              </MenuItems>
            </transition>
          </Float>
        </Menu>
      </template>
    </BaseTable>
  </div>
</template>
