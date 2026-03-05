<script setup>
import { ref } from 'vue'
import { useApiFetch } from '~/composables/useApiFetch'
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import { useFormatters } from '~/composables/useFormatters'
import { UserCircleIcon, CalendarDaysIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'

dayjs.locale('th')
dayjs.extend(buddhistEra)

const isModalOpen = ref(false)
const isLoading = ref(false)
const tenantHistory = ref(null)

const { currency, shortDate } = useFormatters()

/**
 * เปิด Modal และดึงข้อมูลประวัติทั้งหมดของผู้เช่า
 * @param {object} tenant - object ผู้เช่าพื้นฐาน (ต้องการแค่ id และ name)
 */
const open = async (tenant) => {
  if (!tenant) return

  isModalOpen.value = true
  isLoading.value = true
  tenantHistory.value = {
    name: tenant.name,
    phone: tenant.phone,
    contracts: [],
  } // แสดงชื่อชั่วคราวก่อน

  try {
    // เรียก API เฉพาะทางสำหรับดึงประวัติ
    const response = await useApiFetch(`/api/tenants/${tenant.id}/history`, {
      showNotification: false,
    })
    if (response.success) {
      tenantHistory.value = response.data
    }
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  isModalOpen.value = false
  tenantHistory.value = null // Clear data on close
}
defineExpose({ open })
</script>

<template>
  <BaseModal v-model="isModalOpen" max-width="lg">
    <template #title>
      <span v-if="tenantHistory">ประวัติผู้เช่า: {{ tenantHistory.name }}</span>
      <span v-else>กำลังโหลดประวัติ...</span>
    </template>

    <div v-if="isLoading" class="mt-4 text-center py-10">
      <p class="text-gray-500">กำลังดึงข้อมูลประวัติทั้งหมด...</p>
    </div>

    <div v-else-if="tenantHistory" class="mt-4 space-y-6">
      <div>
        <h3 class="text-sm font-semibold text-gray-500 flex items-center gap-2">
          <UserCircleIcon class="h-5 w-5" /> ข้อมูลส่วนตัว
        </h3>
        <dl class="mt-2 divide-y divide-gray-100 border-t border-gray-200">
          <div class="py-2 grid grid-cols-3 gap-4">
            <dt class="text-sm font-medium text-gray-600">ชื่อ-นามสกุล</dt>
            <dd class="text-sm text-gray-900 col-span-2 font-semibold">
              {{ tenantHistory.name }}
            </dd>
          </div>
          <div class="py-2 grid grid-cols-3 gap-4">
            <dt class="text-sm font-medium text-gray-600">เบอร์โทรศัพท์</dt>
            <dd class="text-sm text-gray-900 col-span-2">
              {{ tenantHistory.phone || '-' }}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-gray-500 flex items-center gap-2">
          <CalendarDaysIcon class="h-5 w-5" /> ประวัติสัญญาและการชำระเงิน
        </h3>
        <div class="mt-2 border-t border-gray-200 pt-3">
          <div
            v-if="!tenantHistory.contracts || tenantHistory.contracts.length === 0"
            class="text-center text-sm text-gray-500 py-6"
          >
            ไม่พบประวัติสัญญา
          </div>
          <div v-else class="flow-root">
            <ul role="list" class="-mb-8">
              <li v-for="(ct, ctIdx) in tenantHistory.contracts" :key="ct.id">
                <div class="relative pb-8">
                  <span
                    v-if="ctIdx !== tenantHistory.contracts.length - 1"
                    class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                  <div class="relative flex items-start space-x-3">
                    <div>
                      <div class="relative px-1">
                        <div
                          class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 ring-8 ring-white"
                        >
                          <BanknotesIcon class="h-5 w-5 text-white" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div>
                        <div class="text-sm flex justify-between">
                          <p class="font-medium text-gray-900">
                            สัญญาห้อง {{ ct.contract.room.roomNumber }}
                          </p>
                          <span
                            class="text-xs font-semibold px-2 py-0.5 rounded-full"
                            :class="{
                              'bg-gray-100 text-gray-700': ct.contract.status === 'EXPIRED',
                              'bg-red-100 text-red-700': ct.contract.status === 'TERMINATED',
                            }"
                          >
                            {{ ct.contract.status === 'EXPIRED' ? 'หมดอายุ' : 'สิ้นสุดสัญญา' }}
                          </span>
                        </div>
                        <p class="mt-0.5 text-xs text-gray-500">
                          {{ shortDate(ct.contract.startDate) }} -
                          {{ shortDate(ct.contract.endDate) }}
                        </p>
                      </div>
                      <div class="mt-3 text-sm text-gray-700 space-y-3">
                        <div
                          v-if="ct.contract.termination"
                          class="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-xs"
                        >
                          <p class="font-semibold">ยกเลิกสัญญาก่อนกำหนด</p>
                          <p class="mt-1">เหตุผล: {{ ct.contract.termination.reason }}</p>
                        </div>
                        <div
                          v-if="ct.contract.deposits && ct.contract.deposits.length > 0"
                          class="p-3 bg-slate-50 rounded-md"
                        >
                          <p class="font-semibold text-xs text-slate-700">สรุปเงินประกัน:</p>
                          <dl class="mt-1 text-xs grid grid-cols-3 gap-x-2">
                            <dt class="text-slate-500">ยอดเต็ม</dt>
                            <dd class="col-span-2 text-slate-800">
                              {{ currency(ct.contract.deposits[0].amount) }}
                            </dd>
                            <dt class="text-slate-500">หัก</dt>
                            <dd class="col-span-2 text-red-600">
                              -
                              {{ currency(ct.contract.deposits[0].deductions) }}
                            </dd>
                            <dt class="text-slate-500 font-semibold">ยอดคืนสุทธิ</dt>
                            <dd class="col-span-2 font-semibold text-green-600">
                              {{
                                currency(
                                  Number(ct.contract.deposits[0].amount) -
                                    Number(ct.contract.deposits[0].deductions),
                                )
                              }}
                            </dd>
                          </dl>
                        </div>
                        <ul
                          v-if="ct.contract.invoices.length > 0"
                          class="divide-y divide-gray-100 border rounded-md"
                        >
                          <li
                            v-for="invoice in ct.contract.invoices"
                            :key="invoice.id"
                            class="px-3 py-2 flex justify-between items-center"
                          >
                            <span>รอบบิล {{ dayjs(invoice.period).format('MM/BB') }}</span>
                            <span
                              class="font-semibold"
                              :class="invoice.status === 'PAID' ? 'text-green-600' : 'text-red-600'"
                              >{{ currency(invoice.totalAmount) }}</span
                            >
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="w-full flex justify-end">
        <BaseButton variant="secondary" @click="closeModal"> ปิด </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
