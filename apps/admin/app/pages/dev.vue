<!-- file: pages/dev/seed.vue -->
<template>
  <div class="p-8 max-w-2xl mx-auto">
    <!-- Header -->
    <ServerStackIcon class="w-12 h-12 text-gray-400 mx-auto" />

    <!-- Card -->
    <div class="mt-8 bg-white shadow rounded-lg">
      <!-- Card Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="font-semibold text-gray-800">Database Seeding</h2>
      </div>

      <!-- Card Body -->
      <div class="px-6 py-4 space-y-4">
        <!-- Alert -->
        <div
          class="flex items-start bg-red-50 border-l-4 border-red-400 p-4 rounded"
        >
          <ExclamationTriangleIcon
            class="w-5 h-5 text-red-500 flex-shrink-0 mr-3"
          />
          <div class="text-sm text-red-700">
            การกระทำนี้จะลบข้อมูลทั้งหมดในฐานข้อมูลปัจจุบัน
            และสร้างข้อมูลทดสอบชุดใหม่ขึ้นมาแทนที่
          </div>
        </div>

        <!-- Seed Button -->
        <button
          @click="seedDatabase"
          :disabled="loading"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>Seed Test Data</span>
        </button>

        <!-- Result Message -->
        <div
          v-if="resultMessage"
          class="mt-4 p-4 rounded-md text-sm"
          :class="
            isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          "
        >
          {{ resultMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ServerStackIcon } from "@heroicons/vue/20/solid";
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";

definePageMeta({
  layout: false,
  auth: false,
});

const loading = ref(false);
const resultMessage = ref("");
const isError = ref(false);

const seedDatabase = async () => {
  loading.value = true;
  resultMessage.value = "";
  isError.value = false;

  try {
    const response = await $fetch("/api/dev/seed", {
      method: "POST",
    });
    resultMessage.value = response.message || "Seeding successful!";
  } catch (error) {
    isError.value = true;
    resultMessage.value =
      error.data?.statusMessage || "An unknown error occurred.";
  } finally {
    loading.value = false;
  }
};
</script>
