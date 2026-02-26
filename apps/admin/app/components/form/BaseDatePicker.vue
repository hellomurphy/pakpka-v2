<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const model = defineModel()
const canRenderPicker = ref(false)

onMounted(() => {
  nextTick(() => {
    canRenderPicker.value = true
  })
})

const props = defineProps({
  label: { type: String, default: '' },
  error: { type: String, default: '' },
  placeholder: { type: String, default: 'เลือกวันที่' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  minDate: { type: Date, default: null },
  maxDate: { type: Date, default: null },
  rules: { type: Function, default: null },
  /** Pass "month" for month picker; otherwise single date. */
  mode: { type: String, default: 'date' }
})

const format = (date) => {
  if (date == null || typeof date.getMonth !== 'function') return ''
  const d = date.getDate()
  const m = date.getMonth() + 1
  const y = date.getFullYear() + 543
  return `${d}/${m}/${y}`
}

/** Accepts Date or { month (0-11), year } from VueDatePicker month mode. */
const formatMonth = (dateOrObj) => {
  if (dateOrObj == null) return ''
  if (typeof dateOrObj.getMonth === 'function') {
    return `${dateOrObj.getMonth() + 1}/${dateOrObj.getFullYear() + 543}`
  }
  if (typeof dateOrObj.month === 'number' && typeof dateOrObj.year === 'number') {
    return `${dateOrObj.month + 1}/${dateOrObj.year + 543}`
  }
  return ''
}

const isMonthPicker = computed(() => props.mode === 'month')

/** Single binding for VueDatePicker: Date in date mode, { month, year } in month mode. */
const pickerModel = computed({
  get() {
    if (isMonthPicker.value) {
      const v = model.value
      if (v == null || typeof v.getMonth !== 'function') {
        const d = new Date()
        return { month: d.getMonth(), year: d.getFullYear() }
      }
      return { month: v.getMonth(), year: v.getFullYear() }
    }
    return model.value
  },
  set(val) {
    if (isMonthPicker.value && val != null && typeof val.month === 'number' && typeof val.year === 'number') {
      model.value = new Date(val.year, val.month, 1)
    } else if (!isMonthPicker.value) {
      model.value = val
    }
  }
})

const displayFormat = computed(() => (isMonthPicker.value ? formatMonth : format))
</script>

<template>
  <UFormField
    :label="label"
    :error="error"
    :required="required"
  >
    <div class="mt-2">
      <template v-if="canRenderPicker">
        <VueDatePicker
          v-model="pickerModel"
          v-bind="$attrs"
          :placeholder="placeholder"
          locale="th"
          :formats="{ input: displayFormat }"
          :enable-time-picker="false"
          :disabled="disabled"
          :min-date="minDate"
          :max-date="maxDate"
          :month-picker="isMonthPicker"
          auto-apply
          input-class-name="dp-custom-input"
          :teleport="true"
          @update:model-value="(val) => rules?.(val)"
        >
          <template #input-icon>
            <UIcon name="i-lucide-calendar" class="h-5 w-5 text-gray-400 ml-2" />
          </template>
        </VueDatePicker>
      </template>
      <div v-else class="dp-custom-input flex items-center gap-2">
        <UIcon name="i-lucide-calendar" class="h-5 w-5 shrink-0 text-gray-400" />
        <span class="text-gray-500 text-sm">{{ placeholder }}</span>
      </div>
    </div>
  </UFormField>
</template>

<style>
.dp-custom-input {
  display: block;
  width: 100%;
  border-radius: 0.375rem;
  border: 0;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 2.5rem;
  padding-right: 0.75rem;
  color: #111827;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  box-shadow: 0 0 0 1px #d1d5db inset;
  font-size: 0.875rem;
  line-height: 1.5rem;
  cursor: pointer;
}

:root {
  --dp-font-family: inherit;
  --dp-border-radius: 0.5rem;
  --dp-primary-color: #2563eb;
  --dp-hover-color: #eff6ff;
  --dp-border-color: #d1d5db;
  --dp-border-color-hover: #9ca3af;
  --dp-success-color: #22c55e;
  --dp-danger-color: #ef4444;
}
</style>
