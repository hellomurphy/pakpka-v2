<script setup>
import { ref } from "vue";
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";
import { XMarkIcon } from "@heroicons/vue/24/solid";

const isOpen = ref(false);
const imageUrl = ref("");
const isLoading = ref(true); // ✨ State ใหม่สำหรับจัดการ Loading

const open = (url) => {
  imageUrl.value = url;
  isLoading.value = true; // ✨ เริ่ม Loading ทุกครั้งที่เปิด
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

// ✨ ฟังก์ชันนี้จะถูกเรียกเมื่อรูปภาพโหลดเสร็จ
const onImageLoad = () => {
  isLoading.value = false;
};

defineExpose({ open });
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="close">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-0 z-50 w-screen overflow-y-auto" @click="close">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="relative w-full max-w-lg transform text-left transition-all"
            >
              <button
                @click="close"
                class="absolute -top-4 -right-4 z-10 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 focus:outline-none"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>

              <div
                v-if="isLoading"
                class="aspect-[3/4] w-full bg-slate-200 rounded-lg animate-pulse"
              ></div>

              <img
                :src="imageUrl"
                alt="Payment Slip"
                class="w-full h-auto object-contain rounded-lg shadow-2xl transition-opacity duration-300"
                :class="isLoading ? 'opacity-0' : 'opacity-100'"
                @load="onImageLoad"
              />
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
