<template>
  <main
    class="relative min-h-screen w-full flex items-center justify-center p-4 bg-slate-100 overflow-hidden"
  >
    <div
      class="absolute inset-0 z-10"
      :style="{
        backgroundImage: `
          linear-gradient(to right, ${lineColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }"
    ></div>

    <div class="relative -mt-44 z-20">
      <slot />
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";

// We will define the color directly in the template for simplicity with Tailwind.
const lineColor = ref("rgba(203, 213, 225, 0.5)"); // slate-300 with 50% opacity
</script>

<style scoped>
/*
  The background grid is created using CSS's background-image property with multiple linear-gradients.
  This is more performant than using hundreds of div elements.
*/
</style>
