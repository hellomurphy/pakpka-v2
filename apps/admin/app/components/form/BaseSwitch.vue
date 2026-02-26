<script setup>
defineOptions({
  inheritAttrs: false
})

const model = defineModel({ type: Boolean })

defineProps({
  label: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<template>
  <USwitch
    v-model="model"
    :label="label"
    :description="description"
    color="primary"
    size="md"
  />
</template>
