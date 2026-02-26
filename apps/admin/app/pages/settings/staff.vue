<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppAuth } from "~/composables/useAppAuth";
import { useConfirm } from "~/composables/useConfirm";
import { useFormatters } from "~/composables/useFormatters";
import { useNotification } from "~/composables/useNotification";
import { useStaffStore } from "./store/staffStore";
import { usePropertyStore } from "~/store/propertyStore";

// Component Imports
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import {
  PlusIcon,
  ClipboardDocumentIcon,
  TrashIcon,
} from "@heroicons/vue/24/solid";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseSelect from "~/components/form/BaseSelect.vue";
import InviteStaffModal from "./components/staff/InviteStaffModal.vue";

// --- Store Connections ---
const staffStore = useStaffStore();
const propertyStore = usePropertyStore();
const { staff, invitations, isLoading } = storeToRefs(staffStore);
const { propertyId } = storeToRefs(propertyStore);

// --- Composables ---
const { data: session } = useAppAuth();
const { show: showConfirm } = useConfirm();
const { timeAgo } = useFormatters();
const notify = useNotification();

// --- Local State ---
const inviteModal = ref(null);
const currentUserId = computed(() => session.value?.user?.id);
const roleOptions = [
  { value: "ADMIN", label: "ผู้ดูแลระบบ (Admin)" },
  { value: "STAFF", label: "พนักงาน (Staff)" },
];

// --- Data Fetching ---
const fetchData = () => {
  if (propertyId.value) {
    staffStore.fetchStaffAndInvitations(propertyId.value);
  }
};
onMounted(fetchData);
watch(propertyId, fetchData);

// --- Methods ---
const openInviteModal = () => {
  inviteModal.value?.open();
};

const copyInviteLink = (inviteId) => {
  const fullUrl = new URL(window.location.origin);
  fullUrl.pathname = `/invite/${inviteId}`;
  navigator.clipboard.writeText(fullUrl.href);
  notify.showSuccess("คัดลอกลิงก์คำเชิญแล้ว!");
};

const revokeInvitation = async (invite) => {
  const confirmed = await showConfirm({
    title: `ยกเลิกคำเชิญของ "${invite.nameForReference}"?`,
    message: "ผู้รับจะไม่สามารถใช้ลิงก์นี้ได้อีกต่อไป",
    intent: "danger",
    confirmText: "ยืนยันการยกเลิก",
  });
  if (confirmed) {
    await staffStore.revokeInvitation(invite.id);
  }
};

const handleRoleChange = async (staffMember, newRole) => {
  // ใช้ async/await เพื่อรอให้การอัปเดตสำเร็จ
  await staffStore.updateStaffRole(staffMember.userId, newRole);
};

const handleRemoveStaff = async (staffMember) => {
  const confirmed = await showConfirm({
    title: `นำ ${staffMember.user.name} ออกจากหอพัก?`,
    message: `คุณแน่ใจหรือไม่ว่าจะนำ ${staffMember.user.name} ออกจากทีมงานของหอพักนี้?`,
    intent: "danger",
    confirmText: "ยืนยัน",
  });
  if (confirmed) {
    await staffStore.removeStaff(staffMember.userId);
  }
};

const getDisplayName = (name) => {
  if (!name) return "";
  const parenthesisIndex = name.indexOf("(");
  if (parenthesisIndex > -1) {
    return name.substring(0, parenthesisIndex).trim();
  }
  return name;
};
</script>

<template>
  <div class="space-y-8">
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-base font-semibold leading-7 text-gray-900">
              คำเชิญที่รอดำเนินการ
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              ลิงก์คำเชิญที่ส่งไปแล้วและยังรอการตอบรับ
            </p>
          </div>
          <BaseButton @click="openInviteModal" :icon="PlusIcon"
            >เชิญทีมงานใหม่</BaseButton
          >
        </div>
        <div class="mt-4 border-t border-gray-200 pt-4">
          <div
            v-if="isLoading && invitations.length === 0"
            class="text-center py-6 text-sm text-gray-500"
          >
            กำลังโหลด...
          </div>
          <div
            v-else-if="invitations.length === 0"
            class="text-center py-6 text-sm text-gray-500"
          >
            ไม่มีคำเชิญที่รอดำเนินการ
          </div>
          <ul v-else role="list" class="divide-y divide-gray-100">
            <li
              v-for="invite in invitations"
              :key="invite.id"
              class="flex items-center justify-between gap-x-6 py-3"
            >
              <div>
                <p class="text-sm font-semibold text-gray-900">
                  {{ invite.nameForReference }}
                  <span class="ml-2 font-normal text-gray-500"
                    >({{ invite.role }})</span
                  >
                </p>
                <p class="text-xs text-gray-500">
                  จะหมดอายุ {{ timeAgo(invite.expiresAt) }}
                </p>
              </div>
              <div class="flex items-center gap-x-2">
                <BaseButton
                  @click="copyInviteLink(invite.id)"
                  variant="secondary"
                  size="sm"
                  :icon="ClipboardDocumentIcon"
                  >คัดลอกลิงก์</BaseButton
                >
                <BaseButton
                  @click="revokeInvitation(invite)"
                  variant="secondary"
                  size="sm"
                  class="!p-2 text-red-600 hover:bg-red-50"
                >
                  <TrashIcon class="h-4 w-4" />
                </BaseButton>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-5 sm:p-6 border-b border-gray-200">
        <h3 class="text-base font-semibold leading-7 text-gray-900">
          ทีมงานปัจจุบัน
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          ผู้ที่สามารถเข้าถึงข้อมูลหอพักนี้ได้
        </p>
      </div>
      <div
        v-if="isLoading && staff.length === 0"
        class="p-6 text-center text-gray-500"
      >
        กำลังโหลด...
      </div>
      <ul
        v-else-if="staff.length > 0"
        role="list"
        class="divide-y divide-gray-200"
      >
        <li
          v-for="member in staff"
          :key="member.userId"
          class="flex items-center justify-between gap-x-6 px-4 py-4 sm:px-6"
        >
          <div class="flex min-w-0 items-center gap-x-4">
            <img
              class="h-10 w-10 flex-none rounded-full bg-gray-50 object-cover"
              :src="
                member.user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${getDisplayName(
                  member.user.name
                )}&background=random`
              "
              alt="Avatar"
            />
            <div class="min-w-0 flex-auto">
              <p class="text-sm font-semibold leading-6 text-gray-900">
                {{ member.user.name }}
                <span
                  v-if="member.userId === currentUserId"
                  class="text-xs font-normal text-gray-500"
                  >(คุณ)</span
                >
              </p>
              <p class="text-xs leading-5 text-gray-500">
                {{ member.user.email }}
              </p>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-x-4">
            <div class="w-40">
              <p
                v-if="member.role === 'OWNER'"
                class="text-sm font-semibold leading-6 text-gray-900"
              >
                เจ้าของ (Owner)
              </p>
              <BaseSelect
                v-else
                :model-value="member.role"
                @update:modelValue="handleRoleChange(member, $event)"
                :options="roleOptions"
                :disabled="member.userId === currentUserId"
              />
            </div>
            <div>
              <BaseButton
                v-if="member.role !== 'OWNER'"
                @click="handleRemoveStaff(member)"
                variant="secondary"
                size="sm"
                class="text-red-600 hover:bg-red-50"
                :disabled="member.userId === currentUserId"
              >
                นำออก
              </BaseButton>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <InviteStaffModal ref="inviteModal" @success="fetchData" />
  </div>
</template>
