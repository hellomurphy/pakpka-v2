<template>
  <div>
    <NuxtLoadingIndicator color="#4f46e5" :height="3" />
    <template v-if="isAppLoading">
      <UiSplashScreen />
    </template>

    <template v-else>
      <NuxtLayout>
        <NuxtPage class="bg-slate-50" />
      </NuxtLayout>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import UiSplashScreen from "~/components/ui/UiSplashScreen.vue";

const isAppLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    isAppLoading.value = false;
  }, 1500);
});
</script>
