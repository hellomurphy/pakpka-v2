<template>
  <div class="h-screen flex flex-col overflow-hidden bg-slate-50">
    <!-- Header Fix Top -->
    <UiHeader :title="route.meta.title" :variant="route.meta.headerVariant" />

    <!-- Scrollable Main Area -->
    <main id="mainContent" class="flex-1 overflow-y-auto">
      <slot />
    </main>

    <!-- Footer Fix Bottom -->
    <UiFooter v-if="showFooter" class="flex-none" />
  </div>
</template>

<script lang="ts" setup>
import UiHeader from "~/components/ui/UiHeader.vue";
import UiFooter from "~/components/ui/UiFooter.vue";

const route = useRoute();

const showFooter = computed(() => route.meta.showFooter !== false);

const router = useRouter();

router.afterEach(() => {
  nextTick(() => {
    const mainContent = document.getElementById("mainContent");
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    }
  });
});
</script>

<style>
/* ป้องกัน overscroll บน iOS */
html,
body {
  overscroll-behavior: none;
}
</style>
