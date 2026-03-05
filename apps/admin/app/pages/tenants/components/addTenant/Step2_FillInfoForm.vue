<script setup>
import { BaseInput, BaseSelect } from '~/components/form'

// 2. ใช้ defineModel เพื่อสร้าง v-model สำหรับแต่ละ field
// ทำให้การสื่อสารกับ Component แม่สะอาดและง่ายดาย
/* eslint-disable vue/require-prop-types -- defineModel props are typed via macro */
const tenantName = defineModel('tenantName')
const tenantPhone = defineModel('tenantPhone')
const roomId = defineModel('roomId')
</script>

<template>
  <div class="mt-6 space-y-4">
    <template v-if="intent === 'WAITING_LIST'">
      <BaseInput
        v-model="tenantName"
        v-bind="tenantNameAttrs"
        label="ชื่อ-นามสกุล"
        :error="errors.tenantName"
        placeholder="กรอกชื่อและนามสกุลของผู้ที่สนใจ"
        required
      />
      <BaseInput
        v-model="tenantPhone"
        v-bind="tenantPhoneAttrs"
        label="เบอร์โทรศัพท์"
        type="tel"
        :error="errors.tenantPhone"
        placeholder="กรอกเบอร์โทรศัพท์ (ถ้ามี)"
      />
    </template>

    <template v-else>
      <BaseSelect
        v-model="roomId"
        v-bind="roomAttrs"
        label="เลือกห้องพัก"
        :options="groupedRoomOptions"
        :grouped="true"
        :error="errors.roomId"
        placeholder="เลือกห้องที่ต้องการ"
        required
      />
      <BaseInput
        v-model="tenantName"
        v-bind="tenantNameAttrs"
        label="ชื่อผู้เช่าหลัก"
        :error="errors.tenantName"
        placeholder="กรอกชื่อและนามสกุลผู้ทำสัญญา"
        required
      />
      <BaseInput
        v-model="tenantPhone"
        v-bind="tenantPhoneAttrs"
        label="เบอร์โทรศัพท์"
        type="tel"
        :error="errors.tenantPhone"
        placeholder="กรอกเบอร์โทรศัพท์ (ถ้ามี)"
      />
    </template>
  </div>
</template>
