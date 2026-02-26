<script setup>
import { ref, watch, computed, nextTick } from "vue";
import { useConfirm } from "~/composables/useConfirm";
import {
  ChevronDownIcon,
  XMarkIcon,
  PencilIcon,
  PlusIcon,
  EllipsisVerticalIcon,
} from "@heroicons/vue/24/solid";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "./store/settingsStore";
import { usePropertyStore } from "~/store/propertyStore";
import { useFormatters } from "~/composables/useFormatters";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseSelect from "~/components/form/BaseSelect.vue";
import BaseInput from "~/components/form/BaseInput.vue";

import AddEditRoomTypeModal from "./components/rooms/AddEditRoomTypeModal.vue";
import EditRoomModal from "./components/rooms/EditRoomModal.vue";

// --- Store Connection ---
const settingsStore = useSettingsStore();
const propertyStore = usePropertyStore(); // ✨ Import เพิ่ม
const { settings } = storeToRefs(settingsStore);
const { propertyId } = storeToRefs(propertyStore); // ✨ ดึง propertyId มาใช้

// --- UI STATE ---
const activeAccordionIndex = ref(0);
const floorGeneratorState = ref([]);
const { show: showConfirm } = useConfirm();
const { currency } = useFormatters();

// Modal Refs
const addEditRoomTypeModal = ref(null);
const editRoomModal = ref(null);
const roomTypeToEdit = ref(null);
const roomToEdit = ref(null);

// State for floor update UX
const floorCountInput = ref(settings.value?.totalFloors || 1);
const isStructureChanged = computed(() => {
  return settings.value
    ? floorCountInput.value !== settings.value.totalFloors
    : false;
});

// Watch for changes coming from the store
watch(
  settings,
  (newSettings) => {
    if (newSettings) {
      floorCountInput.value = Math.max(1, newSettings.totalFloors ?? 1);

      const newGenerators = [];
      for (let i = 0; i < newSettings.totalFloors; i++) {
        newGenerators.push({
          startRoom: "",
          endRoom: "",
          selectedTypeId: newSettings.roomTypes[0]?.id || null,
        });
      }
      floorGeneratorState.value = newGenerators;
    }
  },
  { immediate: true, deep: true }
);

// Writable computeds so number inputs always get a valid value on first paint (avoids HTML5 :invalid on load)
const roomTurnoverDaysInput = computed({
  get: () => settings.value?.roomTurnoverDays ?? 3,
  set: (v) => {
    if (settings.value) settings.value.roomTurnoverDays = v;
  },
});
const contractEndingSoonDaysInput = computed({
  get: () => settings.value?.contractEndingSoonDays ?? 60,
  set: (v) => {
    if (settings.value) settings.value.contractEndingSoonDays = v;
  },
});

const toggleAccordion = (index) => {
  activeAccordionIndex.value =
    activeAccordionIndex.value === index ? null : index;
};

const generateRooms = (floorIndex) => {
  if (!settings.value) return;
  const floor = settings.value.floors[floorIndex];
  const generator = floorGeneratorState.value[floorIndex];
  const start = parseInt(generator.startRoom);
  const end = parseInt(generator.endRoom);

  if (isNaN(start) || isNaN(end) || start > end || !generator.selectedTypeId)
    return;

  const prefix =
    settings.value.roomNamingFormat === "ALPHA_NUMERIC"
      ? String.fromCharCode(64 + floor.floorNumber)
      : floor.floorNumber.toString();

  for (let i = start; i <= end; i++) {
    const roomNumberStr = i.toString().padStart(2, "0");
    const roomNumber = `${prefix}${roomNumberStr}`;
    if (!floor.rooms.some((r) => r.roomNumber === roomNumber)) {
      floor.rooms.push({
        id: `temp-${Date.now()}-${i}`,
        roomNumber: roomNumber,
        roomTypeId: generator.selectedTypeId,
      });
    }
  }
  floor.rooms.sort((a, b) =>
    a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
  );
  generator.startRoom = "";
  generator.endRoom = "";
};

const deleteRoom = (floorIndex, roomToDelete) => {
  if (!settings.value) return;
  const floor = settings.value.floors[floorIndex];
  floor.rooms = floor.rooms.filter((room) => room.id !== roomToDelete.id);
};

// --- Modal Triggers ---
const openEditRoomModal = (room) => {
  roomToEdit.value = room;
  nextTick(() => {
    editRoomModal.value?.open();
  });
};
const openAddRoomTypeModal = () => {
  roomTypeToEdit.value = null;
  addEditRoomTypeModal.value?.open();
};
const openEditRoomTypeModal = (roomType) => {
  roomTypeToEdit.value = roomType;
  nextTick(() => {
    addEditRoomTypeModal.value?.open();
  });
};
const handleDeleteRoomType = async (roomType) => {
  const confirmed = await showConfirm({
    title: `ลบประเภทห้อง "${roomType.name}"`,
    message:
      "คุณแน่ใจหรือไม่? การกระทำนี้จะไม่มีผลกับห้องพักที่สร้างไปแล้ว แต่คุณจะไม่สามารถใช้ประเภทนี้สร้างห้องใหม่ได้อีก",
    intent: "danger",
    confirmText: "ยืนยันการลบ",
  });

  if (confirmed) {
    await settingsStore.deleteRoomType(roomType.id, propertyId.value);
  }
};

const onRoomTypeUpdate = () => {
  // TODO: Trigger store to re-fetch settings to get updated list
  // settingsStore.fetchSettings()
};

const handleUpdateStructure = async () => {
  if (!isStructureChanged.value) return;

  // เรียกใช้ Action จาก Store
  await settingsStore.updateFloorStructure(
    propertyId.value,
    floorCountInput.value
  );
};
</script>

<template>
  <div v-if="settings" class="space-y-8">
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold leading-7 text-gray-900">
          โครงสร้างอาคาร
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          กำหนดโครงสร้างทางกายภาพของอาคาร เช่น จำนวนชั้นและรูปแบบเลขห้อง
        </p>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          <div class="flex items-end gap-x-3">
            <BaseInput
              v-model.number="floorCountInput"
              type="number"
              min="1"
              label="จำนวนชั้นทั้งหมด"
              class="flex-1"
            />
            <BaseButton
              @click="handleUpdateStructure"
              :disabled="!isStructureChanged"
            >
              อัปเดต
            </BaseButton>
          </div>
          <BaseSelect
            v-model="settings.roomNamingFormat"
            label="รูปแบบการตั้งชื่อห้อง"
            :options="[
              { value: 'ALPHA_NUMERIC', label: 'ตัวอักษร+ตัวเลข (A101)' },
              { value: 'NUMERIC', label: 'ชั้น+ตัวเลข (101)' },
            ]"
          />
        </div>
      </div>
    </div>

    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold leading-7 text-gray-900">
          การตั้งค่าการดำเนินงาน
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          กำหนดกฎเกณฑ์มาตรฐานสำหรับการบริหารจัดการห้องพัก
        </p>
        <div
          class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-200 pt-4"
        >
          <BaseInput
            v-model.number="roomTurnoverDaysInput"
            type="number"
            min="0"
            label="ระยะเวลาเตรียมห้อง (วัน)"
          />

          <BaseInput
            v-model.number="contractEndingSoonDaysInput"
            type="number"
            min="1"
            label="แจ้งเตือนสัญญาล่วงหน้า (วัน)"
            help-text="จำนวนวันล่วงหน้าสำหรับฟิลเตอร์ 'ใกล้หมดอายุ'"
          />
        </div>
      </div>
    </div>

    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-base font-semibold leading-7 text-gray-900">
              ประเภทห้องพัก (แม่แบบ)
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              สร้างประเภทห้องเพื่อใช้เป็นแม่แบบในการเพิ่มห้องพัก
            </p>
          </div>
          <BaseButton @click="openAddRoomTypeModal" :icon="PlusIcon"
            >เพิ่มประเภทห้อง</BaseButton
          >
        </div>
        <div class="mt-4 border-t border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50/50">
              <tr>
                <th
                  class="py-3 pl-6 text-left text-xs font-semibold uppercase text-gray-500"
                >
                  ชื่อประเภท
                </th>
                <th
                  class="py-3 px-3 text-left text-xs font-semibold uppercase text-gray-500"
                >
                  ค่าเช่าพื้นฐาน
                </th>
                <th
                  class="py-3 px-3 text-left text-xs font-semibold uppercase text-gray-500"
                >
                  ค่ามัดจำ
                </th>
                <th class="relative py-3.5 pl-3 pr-6">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="settings.roomTypes.length === 0">
                <td colspan="4" class="text-center text-sm text-gray-500 py-6">
                  ยังไม่มีประเภทห้องพัก, กด "เพิ่มประเภทห้อง" เพื่อเริ่มต้น
                </td>
              </tr>
              <tr
                v-for="rt in settings.roomTypes"
                :key="rt.id"
                class="hover:bg-gray-50"
              >
                <td class="py-3 pl-6 text-sm font-medium text-gray-900">
                  {{ rt.name }}
                </td>
                <td class="px-3 py-3 text-sm text-gray-500">
                  {{ currency(rt.basePrice) }}
                </td>
                <td class="px-3 py-3 text-sm text-gray-500">
                  {{ currency(rt.deposit) }}
                </td>
                <td class="relative py-3 pr-6 text-right">
                  <Menu as="div" class="relative inline-block text-left">
                    <MenuButton
                      class="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                      ><EllipsisVerticalIcon class="h-5 w-5"
                    /></MenuButton>
                    <MenuItems
                      class="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <MenuItem v-slot="{ active }">
                        <a
                          href="#"
                          @click.prevent="openEditRoomTypeModal(rt)"
                          :class="[
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-gray-700',
                          ]"
                          >แก้ไข</a
                        >
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <a
                          href="#"
                          @click.prevent="handleDeleteRoomType(rt)"
                          :class="[
                            active ? 'bg-red-50' : '',
                            'block px-4 py-2 text-sm text-red-600',
                          ]"
                          >ลบ</a
                        >
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold leading-7 text-gray-900">
          จัดการห้องพักรายชั้น
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          ใช้เครื่องมือสร้างห้องเป็นชุด จากนั้นตรวจสอบและกด
          "บันทึกการเปลี่ยนแปลง" ที่หน้าหลัก
        </p>
      </div>
      <div class="border-t border-gray-200">
        <div
          v-if="settings.floors && settings.floors.length > 0"
          class="divide-y divide-gray-200"
        >
          <div
            v-for="(floor, index) in settings.floors"
            :key="floor.floorNumber"
          >
            <button
              @click="toggleAccordion(index)"
              class="w-full flex justify-between items-center px-4 py-4 sm:px-6 text-left hover:bg-gray-50/50 focus:outline-none"
            >
              <span class="text-base font-semibold text-gray-900"
                >ชั้นที่ {{ floor.floorNumber
                }}<span class="ml-2 text-sm font-normal text-gray-500"
                  >({{ floor.rooms.length }} ห้อง)</span
                ></span
              >
              <ChevronDownIcon
                class="h-6 w-6 text-gray-400 transition-transform"
                :class="{ 'rotate-180': activeAccordionIndex === index }"
              />
            </button>
            <div
              v-show="activeAccordionIndex === index"
              class="px-4 pb-5 sm:px-6 sm:pb-6 bg-slate-50/50"
            >
              <div class="mt-4 p-4 bg-white rounded-lg ring-1 ring-gray-200">
                <p class="text-sm font-medium text-gray-700">
                  เครื่องมือสร้างห้องเป็นชุด
                </p>
                <div
                  class="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
                >
                  <BaseInput
                    v-model="floorGeneratorState[index].startRoom"
                    label="ตั้งแต่ห้อง (เลขท้าย)"
                    placeholder="เช่น 01"
                  />
                  <BaseInput
                    v-model="floorGeneratorState[index].endRoom"
                    label="ถึงห้อง (เลขท้าย)"
                    placeholder="เช่น 08"
                  />
                  <BaseSelect
                    v-model="floorGeneratorState[index].selectedTypeId"
                    label="กำหนดเป็นประเภท"
                    :options="
                      settings.roomTypes.map((rt) => ({
                        value: rt.id,
                        label: rt.name,
                      }))
                    "
                  />
                </div>
                <BaseButton
                  @click="generateRooms(index)"
                  class="mt-3"
                  :icon="PlusIcon"
                  >สร้างห้อง (ตัวอย่าง)</BaseButton
                >
              </div>
              <div class="mt-4">
                <h5 class="text-sm font-medium text-gray-800">
                  ห้องในชั้นนี้:
                </h5>
                <div
                  v-if="floor.rooms.length > 0"
                  class="mt-2 flex flex-wrap gap-2"
                >
                  <div
                    v-for="(room, roomIndex) in floor.rooms"
                    :key="room.id"
                    class="group relative"
                  >
                    <span
                      class="inline-block rounded-full bg-blue-100 pl-4 pr-3 py-1.5 text-sm font-medium text-blue-800"
                      >{{ room.roomNumber }}</span
                    >
                    <div
                      class="absolute -top-2 -right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <button
                        @click="openEditRoomModal(room)"
                        class="bg-white rounded-full p-1 shadow-md hover:bg-gray-200"
                      >
                        <PencilIcon class="h-3 w-3 text-gray-600" />
                      </button>
                      <button
                        @click.stop="deleteRoom(index, room)"
                        class="bg-white rounded-full p-1 shadow-md hover:bg-gray-200"
                      >
                        <XMarkIcon class="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
                <p v-else class="mt-2 text-sm text-gray-500">
                  ยังไม่มีห้องในชั้นนี้
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AddEditRoomTypeModal
      ref="addEditRoomTypeModal"
      :room-type="roomTypeToEdit"
      @success="onRoomTypeUpdate"
    />
    <EditRoomModal
      ref="editRoomModal"
      :room="roomToEdit"
      :room-types="settings.roomTypes"
    />
  </div>
</template>
