<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

/* eslint-disable vue/require-prop-types -- model type from defineModel */
const model = defineModel()

const props = defineProps({
  label: { type: String, default: '' },
  labelClass: { type: String, default: 'block text-sm font-medium leading-6 text-gray-900' },
  options: { type: Array, required: true },
  required: { type: Boolean, default: false },
  optionValue: { type: String, default: 'value' },
  optionLabel: { type: String, default: 'label' },
  grouped: { type: Boolean, default: false },
  placeholder: { type: String, default: 'กรุณาเลือก' },
  disabled: { type: Boolean, default: false },
})

const getOptionValue = (option) => {
  if (typeof option === 'object' && option !== null) return option[props.optionValue]
  return option
}

const getOptionLabel = (option) => {
  if (typeof option === 'object' && option !== null) return option[props.optionLabel]
  return option
}

const selectItems = computed(() => {
  if (props.grouped) {
    return props.options.map((group) =>
      (group.options || []).map((opt) => ({
        label: getOptionLabel(opt),
        value: getOptionValue(opt),
      })),
    )
  }
  return props.options.map((opt) => ({
    label: getOptionLabel(opt),
    value: getOptionValue(opt),
  }))
})

const hasOptions = computed(() => {
  if (!props.options?.length) return false
  if (props.grouped) return props.options.some((g) => g.options?.length)
  return true
})
</script>

<template>
  <div class="w-full">
    <label v-if="label" :class="labelClass">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <USelect
      v-model="model"
      :items="selectItems"
      value-key="value"
      :placeholder="placeholder"
      :disabled="disabled || !hasOptions"
      icon="i-lucide-chevron-down"
      color="neutral"
      variant="outline"
      size="md"
      :class="[{ 'mt-2': label }, 'w-full']"
    />
    <p v-if="!hasOptions" class="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
      <UIcon name="i-lucide-info" class="h-4 w-4 shrink-0" />
      ไม่มีตัวเลือก
    </p>
  </div>
</template>
