<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { PlusIcon, ChevronDownIcon, BuildingOffice2Icon } from '@heroicons/vue/24/solid'

// --- Component Imports ---
import RoomCard from './components/RoomCard.vue'
import AddEditRoomModal from './components/AddEditRoomModal.vue'
import NoticeMoveOutModal from './components/NoticeMoveOutModal.vue'
import CreateReservationModal from './components/CreateReservationModal.vue'
import ViewContractModal from '../contracts/components/ViewContractModal.vue'
import FinalizeMoveOutModal from '../tenants/components/FinalizeMoveOutModal.vue'
import AddTenantModal from '../tenants/components/AddTenantModal.vue'
import { BaseButton } from '~/components/ui'

// --- Store & Composables ---
import { usePropertyStore } from '~/store/propertyStore'
import { useRoomsStore } from './store/roomsStore'
import { useReservationsStore } from '~/store/reservationsStore'
import { useConfirm } from '~/composables/useConfirm'

const propertyStore = usePropertyStore()
const roomsStore = useRoomsStore()
const reservationsStore = useReservationsStore()

const { propertyId } = storeToRefs(propertyStore)
const { floors, roomTypes, rooms, isLoading, initialFloorId } = storeToRefs(roomsStore)
const { show: showConfirm } = useConfirm()

// --- Local State ---
const selectedFloorId = ref(null)

const statusOptions = [
  { value: 'ALL', label: 'สถานะทั้งหมด' },
  { value: 'AVAILABLE', label: 'ว่าง' },
  { value: 'OCCUPIED', label: 'ไม่ว่าง' },
  { value: 'RESERVED', label: 'จองแล้ว' },
  { value: 'CLEANING', label: 'รอทำความสะอาด' },
  { value: 'MAINTENANCE', label: 'แจ้งซ่อม' },
]
const selectedStatus = ref(statusOptions[0])
const selectedRoomTypeId = ref('ALL')

// --- Actions ---
const clearFilters = () => {
  selectedStatus.value = statusOptions[0]
  selectedRoomTypeId.value = 'ALL'
}

// Modal Refs
const addEditRoomModal = ref(null)
const addTenantModal = ref(null)
const noticeMoveOutModal = ref(null)
const viewContractModal = ref(null)
const finalizeMoveOutModal = ref(null)
const createReservationModal = ref(null)

// --- Data Fetching ---
onMounted(() => {
  if (propertyId.value) {
    roomsStore.fetchInitialPageData(propertyId.value)
    selectedFloorId.value = roomsStore.initialFloorId
  }
})

watch(propertyId, (newId) => {
  if (newId) {
    selectedFloorId.value = null // Reset floor selection
    roomsStore.fetchInitialPageData(newId)
  }
})

watch(initialFloorId, (newInitialId) => {
  if (newInitialId && !selectedFloorId.value) {
    selectedFloorId.value = newInitialId
  }
})

watch(selectedFloorId, (newFloorId, oldFloorId) => {
  // Only fetch if the floor is actually changed by the user
  if (newFloorId && oldFloorId && newFloorId !== oldFloorId) {
    roomsStore.fetchRoomsForFloor(propertyId.value, newFloorId)
  }
})

// --- Computed Properties ---
const roomTypeOptions = computed(() => {
  if (!roomTypes.value) return []
  return [
    { value: 'ALL', label: 'ประเภททั้งหมด' },
    ...roomTypes.value.map((rt) => ({ value: rt.id, label: rt.name })),
  ]
})

const filteredRooms = computed(() => {
  if (!rooms.value) return []

  const sortedRooms = [...rooms.value].sort((a, b) =>
    a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }),
  )

  return sortedRooms.filter((room) => {
    const floorMatch = !selectedFloorId.value || room.floorId === selectedFloorId.value
    const statusMatch =
      selectedStatus.value.value === 'ALL' || room.status === selectedStatus.value.value
    const roomTypeMatch =
      selectedRoomTypeId.value === 'ALL' || room.roomTypeId === selectedRoomTypeId.value
    return floorMatch && statusMatch && roomTypeMatch
  })
})

// --- Action & Modal Handlers ---
const trickFetch = async () => {
  if (selectedFloorId.value) {
    await roomsStore.fetchRoomsForFloor(propertyId.value, selectedFloorId.value)
  }
}

const openAddRoomModal = () => addEditRoomModal.value?.open()
const editRoom = (room) => addEditRoomModal.value?.open(room)

const deleteRoom = async (room) => {
  const confirmed = await showConfirm({
    title: `ยืนยันการลบห้อง ${room.roomNumber}`,
    message: 'การลบห้องจะทำได้ก็ต่อเมื่อไม่มีสัญญาผูกอยู่ การกระทำนี้ไม่สามารถย้อนกลับได้',
    intent: 'danger',
  })
  if (confirmed) {
    await roomsStore.deleteRoom(room.id)
  }
}

const openAddTenantModal = (room) => addTenantModal.value?.open({ roomId: room.id })
const openViewContractModal = (room) => viewContractModal.value?.open(room)
const initiateMoveOut = (room) => noticeMoveOutModal.value?.open(room.activeContract)
const openCreateReservationModal = (room) => createReservationModal.value?.open(room)

const cancelReservation = async (room) => {
  if (!room.activeReservation) return

  const confirmed = await showConfirm({
    title: `ยกเลิกการจองห้อง ${room.roomNumber}`,
    message: `คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองสำหรับคุณ "${room.activeReservation.tenant.name}"?`,
    intent: 'danger',
  })
  if (confirmed) {
    await reservationsStore.cancelReservation(room.activeReservation.id)
    await trickFetch()
  }
}

const markRoomAsAvailable = async (room) => {
  const confirmed = await showConfirm({
    title: 'ยืนยันสถานะห้อง',
    message: `คุณต้องการเปลี่ยนสถานะห้อง ${room.roomNumber} เป็น "ว่าง" ใช่หรือไม่?`,
    intent: 'info',
  })
  if (confirmed) {
    await roomsStore.updateRoomStatus(room.id, 'AVAILABLE')
    await trickFetch()
  }
}

const initiateFinalizeMoveOut = (room) => {
  if (!room.tenant) return
  // The finalize modal expects a tenant object with an active contract
  const tenantWithContract = {
    ...room.tenant,
    activeContract: room.activeContract,
    roomNumber: room.roomNumber,
  }
  finalizeMoveOutModal.value.open(tenantWithContract)
}
</script>

<template>
  <div class="flex flex-col h-full bg-white rounded-xl shadow-sm">
    <header class="p-6 md:px-8 bg-white rounded-t-xl">
      <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-x-4">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">จัดการห้องพัก</h1>
        <p class="mt-1 sm:mt-0 text-base text-gray-500">
          <span class="hidden sm:inline-block mr-2 text-gray-300">|</span>
          ภาพรวมสถานะห้องพักทั้งหมด
        </p>
      </div>
    </header>

    <div class="px-6 md:px-8 pb-4 border-b border-gray-200">
      <div class="flex flex-col gap-4">
        <!-- Floor Tabs -->
        <div class="flex-shrink-0 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <div class="inline-flex items-center bg-slate-100 rounded-full p-1 space-x-1">
            <button
              v-for="floor in floors"
              :key="floor.id"
              :class="[
                'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200 focus:outline-none',
                selectedFloorId === floor.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800',
              ]"
              @click="selectedFloorId = floor.id"
            >
              {{ floor.name }}
            </button>
          </div>
        </div>

        <!-- Filters + Add Button -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <!-- Filters Row -->
          <div class="flex-1 grid grid-cols-2 sm:flex sm:flex-row gap-3">
            <Listbox
              v-model="selectedRoomTypeId"
              as="div"
              class="relative flex-1 sm:w-auto sm:min-w-[12rem]"
            >
              <ListboxButton
                class="relative w-full cursor-default rounded-lg bg-white py-2.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm"
              >
                <span class="block truncate">{{
                  roomTypeOptions.find((rt) => rt.value === selectedRoomTypeId)?.label ||
                  'ประเภททั้งหมด'
                }}</span>
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                  ><ChevronDownIcon class="h-5 w-5 text-gray-400"
                /></span>
              </ListboxButton>
              <transition>
                <ListboxOptions
                  class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                  <ListboxOption
                    v-for="rt in roomTypeOptions"
                    :key="rt.value"
                    v-slot="{ active, selected }"
                    :value="rt.value"
                  >
                    <li
                      :class="[
                        active ? 'bg-blue-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9',
                      ]"
                    >
                      <span
                        :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']"
                        >{{ rt.label }}</span
                      >
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </Listbox>
            <Listbox
              v-model="selectedStatus"
              as="div"
              class="relative flex-1 sm:w-auto sm:min-w-[12rem]"
            >
              <ListboxButton
                class="relative w-full cursor-default rounded-lg bg-white py-2.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm"
              >
                <span class="block truncate">{{ selectedStatus.label }}</span>
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                  ><ChevronDownIcon class="h-5 w-5 text-gray-400"
                /></span>
              </ListboxButton>
              <transition>
                <ListboxOptions
                  class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                  <ListboxOption
                    v-for="status in statusOptions"
                    :key="status.value"
                    v-slot="{ active, selected }"
                    :value="status"
                  >
                    <li
                      :class="[
                        active ? 'bg-blue-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9',
                      ]"
                    >
                      <span
                        :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']"
                        >{{ status.label }}</span
                      >
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </Listbox>
          </div>

          <!-- Add Button -->
          <BaseButton
            :icon="PlusIcon"
            class="w-full sm:w-auto sm:flex-shrink-0"
            @click="openAddRoomModal"
          >
            <span class="hidden sm:inline">เพิ่มห้องพัก</span>
            <span class="sm:hidden">เพิ่มห้อง</span>
          </BaseButton>
        </div>
      </div>
    </div>

    <main class="flex-1 overflow-y-auto p-6 md:px-8 bg-slate-50/50">
      <div
        v-if="isLoading"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-pulse"
      >
        <div v-for="n in 10" :key="n" class="h-40 rounded-xl bg-gray-200" />
      </div>
      <div
        v-else-if="filteredRooms.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        <RoomCard
          v-for="room in filteredRooms"
          :key="room.id"
          :room="room"
          @add-tenant="openAddTenantModal"
          @edit-room="editRoom"
          @delete-room="deleteRoom"
          @initiate-move-out="initiateMoveOut"
          @mark-as-available="markRoomAsAvailable"
          @view-contract="openViewContractModal"
          @cancel-reservation="cancelReservation"
          @create-reservation="openCreateReservationModal"
          @finalize-move-out="initiateFinalizeMoveOut"
        />
      </div>
      <div v-else class="text-center py-20">
        <BuildingOffice2Icon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-semibold text-gray-900">ไม่พบข้อมูลห้องพัก</h3>
        <p class="mt-1 text-sm text-gray-500">ไม่พบห้องที่ตรงกับเงื่อนไขการกรองของคุณ</p>
        <div class="mt-6">
          <BaseButton
            variant="secondary"
            size="sm"
            @click="clearFilters"
          >
            ล้างการกรอง
          </BaseButton>
        </div>
      </div>
    </main>

    <AddEditRoomModal ref="addEditRoomModal" @success="trickFetch" />
    <AddTenantModal ref="addTenantModal" @success="trickFetch" />
    <NoticeMoveOutModal ref="noticeMoveOutModal" @success="trickFetch" />
    <ViewContractModal ref="viewContractModal" />
    <FinalizeMoveOutModal ref="finalizeMoveOutModal" @success="trickFetch" />
    <CreateReservationModal ref="createReservationModal" @success="trickFetch" />
  </div>
</template>
