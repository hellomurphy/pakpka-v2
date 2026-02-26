<script setup>
defineOptions({
  inheritAttrs: false
})

const model = defineModel()

defineProps({
  label: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<template>
  <UCheckbox
    v-model="model"
    :label="label"
    :description="description"
    color="primary"
    icon="i-lucide-check"
    class="w-full"
  />
</template>
