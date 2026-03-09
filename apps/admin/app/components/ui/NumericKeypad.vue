<script setup>
const emit = defineEmits(['key-press'])

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace']

const handlePress = (key) => {
  emit('key-press', key)
}
</script>

<template>
  <div class="grid grid-cols-3 gap-2 text-center">
    <button
      v-for="key in keys"
      :key="key"
      class="py-4 rounded-lg text-2xl font-bold transition-colors duration-150 active:bg-blue-200"
      :class="
        key === 'clear' || key === 'backspace'
          ? 'bg-slate-200 text-slate-700'
          : 'bg-white text-slate-900'
      "
      @click="handlePress(key)"
    >
      <template v-if="key === 'clear'"> C </template>
      <template v-else-if="key === 'backspace'">
        <svg
          class="w-7 h-7 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"
          />
        </svg>
      </template>
      <template v-else>
        {{ key }}
      </template>
    </button>
  </div>
</template>
