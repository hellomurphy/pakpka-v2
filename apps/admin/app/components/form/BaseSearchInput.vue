<script setup>
import { ref, watch, computed } from 'vue'

const model = defineModel({ type: String })

const props = defineProps({
  placeholder: { type: String, default: 'ค้นหา...' },
  debounce: {
    type: [Number, String],
    default: 300,
    validator: (v) => !isNaN(Number(v)),
  },
})

const debounceMs = computed(() => Number(props.debounce))

const internalValue = ref(model.value ?? '')
let debounceTimer = null

watch(internalValue, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    model.value = newVal
  }, debounceMs.value)
})

watch(model, (newVal) => {
  if (internalValue.value !== newVal) internalValue.value = newVal ?? ''
})

function clearInput() {
  internalValue.value = ''
  model.value = ''
}
</script>

<template>
  <UInput
    v-model="internalValue"
    icon="i-lucide-search"
    variant="outline"
    size="md"
    :placeholder="placeholder"
    :ui="{ trailing: 'pe-1' }"
    class="w-full"
  >
    <template v-if="internalValue?.length" #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        icon="i-lucide-circle-x"
        aria-label="ล้างค่า"
        @click="clearInput"
      />
    </template>
  </UInput>
</template>
