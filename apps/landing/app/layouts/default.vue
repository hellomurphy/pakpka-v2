<template>
  <div class="overflow-x-hidden">
    <TheHeader />
    <main>
      <slot />
    </main>
    <TheFooter />

    <GlobalScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
import GlobalScrollToTopButton from "~/components/global/ScrollToTopButton.vue";
</script>
