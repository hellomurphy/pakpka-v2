<script setup>
import { ref, watch, nextTick } from 'vue'

defineOptions({
  inheritAttrs: false
})

const modelValue = defineModel({
  type: [String, Number],
  default: null
})

const props = defineProps({
  label: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' }
})

const displayValue = ref('')
const inputRef = ref(null)

const format = (value) => {
  if (value === null || value === undefined || value === '') return ''
  return new Intl.NumberFormat('en-US').format(value)
}

const parse = (value) => {
  if (value === null || value === undefined) return null
  const numericString = String(value).replace(/[^0-9.-]/g, '')
  return numericString === '' ? null : parseFloat(numericString)
}

watch(
  modelValue,
  (newValue) => {
    const numericValue = parse(newValue)
    const currentDisplayNumericValue = parse(displayValue.value)
    if (numericValue === currentDisplayNumericValue) return
    displayValue.value = format(numericValue)
  },
  { immediate: true }
)

const onInput = (event) => {
  const { value, selectionStart } = event.target
  const originalLength = value.length
  const numericValue = parse(value)
  modelValue.value = numericValue

  nextTick(() => {
    const formattedValue = displayValue.value
    const newLength = formattedValue.length
    if (inputRef.value) {
      const cursorPosition = Math.min(selectionStart + (newLength - originalLength), formattedValue.length)
      inputRef.value.value = formattedValue
      inputRef.value.setSelectionRange(cursorPosition, cursorPosition)
    }
  })
}
</script>

<template>
  <UFormField
    :label="label"
    :error="error"
    :required="required"
  >
    <div class="relative" :class="{ 'mt-2': label }">
      <span
        v-if="placeholder"
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm"
      >
        {{ placeholder }}
      </span>
      <input
        ref="inputRef"
        :value="displayValue"
        type="text"
        inputmode="numeric"
        :class="[
          'block w-full rounded-lg border-0 py-2.5 text-right text-gray-900 shadow-sm ring-1 ring-inset transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm',
          error
            ? 'ring-red-500 focus:ring-red-600'
            : 'ring-gray-300 focus:ring-primary',
          placeholder ? 'pl-16 pr-3' : 'px-3'
        ]"
        @input="onInput"
      />
    </div>
  </UFormField>
</template>
