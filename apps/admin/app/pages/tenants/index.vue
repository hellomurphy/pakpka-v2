<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useTenantsStore } from "./store/tenantsStore";
import { usePropertyStore } from "~/store/propertyStore";
import { useContractsStore } from "~/store/contractsStore";
import { useConfirm } from "~/composables/useConfirm";
import { useDebounceFn } from "@vueuse/core";

// // --- Icon Imports ---
import { PlusIcon } from "@heroicons/vue/24/solid";
import {
  UserIcon as UserIconSolid,
  ClockIcon as ClockIconSolid,
  ArrowLeftStartOnRectangleIcon as ArrowLeftOnRectangleIconSolid,
  ArchiveBoxXMarkIcon as ArchiveBoxXMarkIconSolid,
  UserPlusIcon as UserPlusIconSolid,
} from "@heroicons/vue/24/solid";

// // --- Component Imports ---
import TenantsTable from "./components/TenantsTable.vue";
import AddTenantModal from "./components/AddTenantModal.vue";
import EditTenantModal from "./components/EditTenantModal.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseSearchInput from "~/components/form/BaseSearchInput.vue";

import NoticeMoveOutModal from "./components/NoticeMoveOutModal.vue";
import FinalizeMoveOutModal from "./components/FinalizeMoveOutModal.vue";
import TenantHistoryModal from "./components/TenantHistoryModal.vue";
import RenewContractModal from "./components/RenewContractModal.vue";
import ViewContractModal from "../contracts/components/ViewContractModal.vue";

const route = useRoute(); // ✨ ใช้งาน route
const router = useRouter(); // ✨ ใช้งาน router

onMounted(async () => {
  const { action, fromContractId } = route.query;

  // Case 1: ต่อสัญญา (Renew Contract)
  if (action === "renew" && fromContractId) {
    // ดึงข้อมูลสัญญาเก่าฉบับเต็ม
    const response = await useApiFetch(`/api/contracts/${fromContractId}`);
    if (response.success) {
      const oldContract = response.data;
      const primaryTenant = oldContract.tenants.find(
        (t) => t.isPrimary
      )?.tenant;

      // เตรียมข้อมูลเริ่มต้นสำหรับ Modal
      const initialData = {
        intent: "ACTIVE", // กำหนดเจตนาเป็นการทำสัญญาใหม่
        tenantName: primaryTenant?.name,
        tenantPhone: primaryTenant?.phone,
        roomId: oldContract.roomId,
        rentAmount: oldContract.rentAmount,
        depositAmount: oldContract.deposits[0]?.amount || 0,
        // (สามารถเพิ่ม field อื่นๆ ได้ตามต้องการ)
      };

      // เปิด Modal พร้อมส่งข้อมูลเริ่มต้นเข้าไป
      addModal.value?.open(initialData);
    }
    // เคลียร์ query params ออกจาก URL เพื่อความสะอาด
    router.replace({ query: undefined });
  }
});

const handleCreateFromWaitingList = (tenant) => {
  addModal.value?.open({
    intent: "ACTIVE",
    tenantName: tenant.name,
    tenantPhone: tenant.phone,
  });
};

// // --- Store & State ---
const tenantsStore = useTenantsStore();
const propertyStore = usePropertyStore();
const contractsStore = useContractsStore();
const { show: showConfirm } = useConfirm();

// // ดึง State จาก store มาใช้ใน component แบบ reactive
const { counts } = storeToRefs(tenantsStore);
const { propertyId } = storeToRefs(propertyStore);

// State ที่ใช้ควบคุม UI ในหน้านี้โดยเฉพาะ
const activeTab = ref("ACTIVE");
const searchQuery = ref("");
const currentPage = ref(1);

// --- Data Fetching Logic ---
// ฟังก์ชันกลางสำหรับเรียก fetch action ใน store
const triggerFetch = async () => {
  if (propertyId.value) {
    await tenantsStore.fetchTenants({
      propertyId: propertyId.value,
      status: activeTab.value,
      q: searchQuery.value,
      page: currentPage.value,
      limit: tenantsStore.itemsPerPage,
    });
  }
};

const debouncedFetch = useDebounceFn(() => {
  currentPage.value = 1; // รีเซ็ตหน้าเป็น 1 ทุกครั้งที่ค้นหาใหม่
  triggerFetch();
}, 400);

watch(searchQuery, () => {
  debouncedFetch();
});

watch(
  activeTab,
  async () => {
    currentPage.value = 1;
    triggerFetch();
  },
  { deep: true }
);

watch(currentPage, () => {
  console.log("Current page changed:", currentPage.value);
  triggerFetch();
});

watch(
  propertyId,
  () => {
    triggerFetch();
  },
  { immediate: true }
);

// --- Tabs Data ---
const tabs = computed(() => [
  {
    id: "ACTIVE",
    name: "พักอาศัย",
    count: counts.value.ACTIVE || 0,
    icon: UserIconSolid,
  },
  {
    id: "UPCOMING",
    name: "รอเข้าพัก",
    count: counts.value.UPCOMING || 0,
    icon: ClockIconSolid,
  },
  {
    id: "NOTICE_GIVEN",
    name: "แจ้งย้ายออก",
    count: counts.value.NOTICE_GIVEN || 0,
    icon: ArrowLeftOnRectangleIconSolid,
  },
  {
    id: "WAITING_LIST",
    name: "จองหอพัก",
    count: counts.value.WAITING_LIST || 0,
    icon: UserPlusIconSolid,
  },
  {
    id: "MOVED_OUT",
    name: "ย้ายออกแล้ว",
    count: counts.value.MOVED_OUT || 0,
    icon: ArchiveBoxXMarkIconSolid,
  },
]);

const onChangeTab = (tabId) => {
  activeTab.value = tabId;
  searchQuery.value = ""; // เคลียร์ช่องค้นหาเมื่อเปลี่ยนแท็บ
};

// // --- Modal Handling ---
const addModal = ref(null);
const editModal = ref(null);
const tenantToEdit = ref(null);

const openAddTenantModal = (tenant) => addModal.value?.open();

const handleEditTenant = (tenant) => {
  tenantToEdit.value = tenant;
  nextTick(() => {
    editModal.value?.open();
  });
};

// --- Delete Actions ---
const handleDelete = async (tenant) => {
  const confirmed = await showConfirm({
    title: "ยืนยันการย้ายออก (Archive)",
    message: `คุณต้องการเปลี่ยนสถานะของคุณ "${tenant.name}" เป็น 'ย้ายออกแล้ว' ใช่หรือไม่?`,
    intent: "danger",
    confirmText: "ยืนยัน",
  });
  if (confirmed) {
    await tenantsStore.archiveTenant(tenant.id, propertyId.value);
    onActionSuccess("MOVED_OUT");
  }
};

const handleDeletePermanent = async (tenant) => {
  const confirmed = await showConfirm({
    title: "ยืนยันการลบถาวร",
    message: `คุณต้องการลบผู้เช่า "${tenant.name}" และข้อมูลที่เกี่ยวข้องทั้งหมดออกจากระบบอย่างถาวรใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
    intent: "danger",
    confirmText: "ลบถาวร",
  });
  if (confirmed) {
    console.log("Deleting tenant permanently:", tenant.id);
    await tenantsStore.deleteTenantPermanent(tenant.id, propertyId.value);
    onActionSuccess("MOVED_OUT");
  }
};

const handleWaitingDeletePermanent = async (tenant) => {
  const confirmed = await showConfirm({
    title: "ยืนยันการลบถาวร",
    message: `คุณต้องการลบผู้เช่า "${tenant.name}" และข้อมูลที่เกี่ยวข้องทั้งหมดออกจากระบบอย่างถาวรใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
    intent: "danger",
    confirmText: "ลบถาวร",
  });
  if (confirmed) {
    console.log("Deleting tenant permanently:", tenant.id);
    await tenantsStore.deleteTenantPermanent(tenant.id, propertyId.value);
    onActionSuccess("WAITING_LIST");
  }
};

const finalizeMoveOutModal = ref(null);
const openFinalizeMoveOutModal = (tenant) => {
  finalizeMoveOutModal.value.open(tenant);
};

const noticeMoveOutModal = ref(null);
const openNoticeMoveOutModal = (tenant) => {
  noticeMoveOutModal.value.open(tenant);
};

const refreshTenantList = async () => {
  console.log("Refreshing tenant list due to modal success...");
  await triggerFetch();
};

const onActionSuccess = async (newTenantStatus) => {
  if (newTenantStatus) {
    activeTab.value = newTenantStatus;
  }

  await triggerFetch();
};

const viewContractModal = ref(null);
const openViewContractModal = (tenant) => {
  viewContractModal.value?.open(tenant);
};

const handleConfirmCheckIn = async (tenant) => {
  const contractId = tenant.activeContract?.id;
  if (!contractId) return;

  const confirmed = await showConfirm({
    title: `ยืนยันการย้ายเข้า`,
    message: `คุณต้องการยืนยันการย้ายเข้าสำหรับ "${tenant.name}" ในห้อง ${tenant.roomNumber} ใช่หรือไม่?`,
    intent: "info",
    confirmText: "ยืนยัน",
  });

  if (confirmed) {
    const response = await contractsStore.confirmCheckIn(contractId);
    if (response.success) {
      // เมื่อสำเร็จ ให้ย้ายไปแท็บ ACTIVE
      onActionSuccess("ACTIVE");
    }
  }
};

const handleCancelContract = async (tenant) => {
  const contractId = tenant.activeContract?.id;
  if (!contractId) return;

  const confirmed = await showConfirm({
    title: `ยกเลิกสัญญา`,
    message: `คุณแน่ใจหรือไม่ว่าจะยกเลิกสัญญาของ "${tenant.name}"? การกระทำนี้จะทำให้ห้องกลับสู่สถานะ "ว่าง"`,
    intent: "danger",
    confirmText: "ยืนยันการยกเลิก",
  });

  if (confirmed) {
    const response = await contractsStore.cancelUpcomingContract(contractId);
    if (response.success) {
      // เมื่อสำเร็จ ให้อยู่ที่แท็บเดิม (UPCOMING) แล้ว refresh
      onActionSuccess("UPCOMING");
    }
  }
};

const tenantHistoryModal = ref(null);
const openTenantHistoryModal = (tenant) => {
  tenantHistoryModal.value?.open(tenant);
};

const renewContractModal = ref(null);
const openRenewContractModal = (tenant) => {
  renewContractModal.value?.open(tenant);
};
</script>

<template>
  <div class="p-6 md:px-8 bg-white rounded-xl shadow-md h-full flex flex-col">
    <header class="mb-4">
      <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-x-4">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          จัดการผู้เช่า
        </h1>
        <p class="mt-1 sm:mt-0 text-base text-gray-500">
          <span class="hidden sm:inline-block mr-2 text-gray-300">|</span>
          เลือกแท็บเพื่อจัดการผู้เช่าในแต่ละสถานะ
        </p>
      </div>
    </header>

    <div
      class="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3 border-b border-gray-200"
    >
      <div class="overflow-x-auto">
        <div
          class="inline-flex items-center bg-slate-200/60 rounded-full p-1 space-x-1"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="onChangeTab(tab.id)"
            :class="[
              'flex-shrink-0 flex items-center gap-x-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus:outline-none',
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            <component :is="tab.icon" class="h-5 w-5" />
            <span>{{ tab.name }}</span>
            <span
              v-if="tab.count > 0"
              :class="[
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-white text-gray-600',
                'rounded-full px-2 py-0.5 text-xs',
              ]"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>
      </div>
      <div class="flex-shrink-0 flex items-center gap-x-3">
        <div class="w-full sm:w-52">
          <BaseSearchInput
            v-model="searchQuery"
            placeholder="ค้นหาผู้เช่า..."
            debounce="500"
          />
        </div>
        <BaseButton @click="openAddTenantModal" :icon="PlusIcon">
          <span class="hidden sm:inline">เพิ่มผู้เช่า</span>
        </BaseButton>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto min-h-0">
      <TenantsTable
        :active-tab="activeTab"
        v-model:currentPage="currentPage"
        @edit-tenant="handleEditTenant"
        @delete-tenant="handleDelete"
        @create-from-waiting-list="handleCreateFromWaitingList"
        @delete-permanent="handleDeletePermanent"
        @final-move-out="openFinalizeMoveOutModal"
        @view-contract="openViewContractModal"
        @notice-move-out="openNoticeMoveOutModal"
        @confirm-check-in="handleConfirmCheckIn"
        @cancel-contract="handleCancelContract"
        @add-tenant="openAddTenantModal"
        @view-tenant-history="openTenantHistoryModal"
        @renew-contract="openRenewContractModal"
        @delete-waiting-list="handleWaitingDeletePermanent"
      />
    </div>

    <AddTenantModal ref="addModal" @success="onActionSuccess" />
    <EditTenantModal
      ref="editModal"
      :tenant="tenantToEdit"
      @success="refreshTenantList"
    />

    <NoticeMoveOutModal ref="noticeMoveOutModal" @success="onActionSuccess" />
    <ViewContractModal ref="viewContractModal" />
    <FinalizeMoveOutModal
      ref="finalizeMoveOutModal"
      @success="onActionSuccess"
    />

    <TenantHistoryModal ref="tenantHistoryModal" />

    <RenewContractModal ref="renewContractModal" @success="onActionSuccess" />
  </div>
</template>
