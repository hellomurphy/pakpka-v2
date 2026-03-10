<template>
  <div class="space-y-3">
    <!-- Upload Area -->
    <div
      v-if="!previewUrl"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
      :class="
        isDragging
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
      "
    >
      <Icon
        name="ph:upload-duotone"
        class="text-5xl mx-auto mb-3"
        :class="isDragging ? 'text-indigo-500' : 'text-slate-400'"
      />
      <p class="font-semibold text-slate-700 mb-1">
        {{ isDragging ? 'วางไฟล์ที่นี่' : 'อัปโหลดหลักฐานการชำระเงิน' }}
      </p>
      <p class="text-sm text-slate-500">คลิกหรือลากไฟล์มาวางที่นี่</p>
      <p class="text-xs text-slate-400 mt-2">รองรับ: JPG, PNG, WebP (ไม่เกิน 5MB)</p>
    </div>

    <!-- Preview Area -->
    <div v-else class="relative">
      <div class="border-2 border-slate-200 rounded-xl overflow-hidden bg-white">
        <img
          v-if="isImage"
          :src="previewUrl"
          alt="Preview"
          class="w-full h-auto max-h-96 object-contain"
        />
        <div v-else class="flex items-center justify-center p-8 bg-slate-50">
          <Icon name="ph:file-pdf-duotone" class="text-6xl text-red-500" />
          <div class="ml-4">
            <p class="font-semibold text-slate-700">{{ fileName }}</p>
            <p class="text-sm text-slate-500">{{ fileSize }}</p>
          </div>
        </div>
      </div>

      <!-- Remove Button -->
      <button
        @click="removeFile"
        class="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all"
      >
        <Icon name="ph:x-bold" class="text-xl" />
      </button>

      <!-- Upload Again Button -->
      <button
        @click="triggerFileInput"
        class="mt-3 w-full py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
      >
        <Icon name="ph:arrow-clockwise-bold" class="text-lg" />
        <span>เปลี่ยนไฟล์</span>
      </button>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      @change="handleFileSelect"
      class="hidden"
    />

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
      <Icon name="ph:warning-circle-duotone" class="text-red-500 text-xl flex-shrink-0 mt-0.5" />
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024, // 5MB
  },
})

const emit = defineEmits(['update:modelValue', 'file-selected'])

// State
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(props.modelValue)
const fileName = ref<string>('')
const fileSize = ref<string>('')
const isDragging = ref(false)
const error = ref<string>('')
const currentFile = ref<File | null>(null)

// Computed
const isImage = computed(() => {
  return currentFile.value?.type.startsWith('image/')
})

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file: File) => {
  error.value = ''

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    error.value = 'ประเภทไฟล์ไม่ถูกต้อง กรุณาอัปโหลด JPG, PNG หรือ WebP'
    return
  }

  // Validate file size
  if (file.size > props.maxSize) {
    error.value = `ขนาดไฟล์เกิน ${props.maxSize / 1024 / 1024}MB`
    return
  }

  currentFile.value = file
  fileName.value = file.name
  fileSize.value = formatFileSize(file.size)

  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
    emit('update:modelValue', previewUrl.value)
    emit('file-selected', file)
  }
  reader.readAsDataURL(file)
}

const removeFile = () => {
  previewUrl.value = null
  fileName.value = ''
  fileSize.value = ''
  currentFile.value = null
  error.value = ''
  emit('update:modelValue', null)
  emit('file-selected', null)

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>
