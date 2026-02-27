<script setup lang="ts">
import { ref, computed } from "vue";

// รับ props
const props = defineProps({
  videoId: { type: String, required: true },
});

const showVideo = ref(false);
const loadVideo = () => {
  showVideo.value = true;
};

const thumbnailUrl = computed(
  () => `https://img.youtube.com/vi/${props.videoId}/maxresdefault.jpg`
);
</script>

<template>
  <div class="aspect-video w-full rounded-lg overflow-hidden">
    <!-- Cover Thumbnail -->
    <div
      v-if="!showVideo"
      class="relative h-full w-full cursor-pointer group"
      @click="loadVideo"
    >
      <img
        :src="thumbnailUrl"
        :srcset="`
          https://img.youtube.com/vi/${videoId}/mqdefault.jpg 320w,
          https://img.youtube.com/vi/${videoId}/hqdefault.jpg 480w,
          https://img.youtube.com/vi/${videoId}/maxresdefault.jpg 1280w
        `"
        sizes="(max-width: 640px) 100vw, 640px"
        :alt="props.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <!-- Overlay Play Button -->
      <div
        class="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition"
      >
        <svg
          class="h-16 w-16 text-white drop-shadow-lg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Youtube Iframe -->
    <div v-else class="h-full w-full">
      <iframe
        :src="`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="h-full w-full"
        loading="lazy"
      >
        ></iframe
      >
    </div>
  </div>
</template>
