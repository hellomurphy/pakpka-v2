<script setup>
defineOptions({
  inheritAttrs: false
})

const model = defineModel()

defineProps({
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' }
})
</script>

<template>
  <UFormField
    :label="label"
    :error="error"
    :required="required"
  >
    <UInput
      v-model="model"
      v-bind="$attrs"
      :type="type"
      :placeholder="placeholder"
      :color="error ? 'error' : 'neutral'"
      variant="outline"
      size="md"
      class="w-full"
    />
  </UFormField>
</template>
