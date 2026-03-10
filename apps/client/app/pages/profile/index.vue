<template>
  <div class="bg-slate-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <Icon name="ph:spinner-duotone" class="text-4xl animate-spin text-indigo-600" />
    </div>

    <!-- Main Content -->
    <main v-else class="p-4 max-w-2xl mx-auto space-y-6">
      <section class="flex flex-col items-center space-y-4">
        <div class="relative">
          <div
            class="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-md"
          >
            <span class="text-white text-3xl font-bold">
              {{ formData.name?.charAt(0)?.toUpperCase() || '?' }}
            </span>
          </div>
        </div>

        <div v-if="!isEditing" class="w-full pt-2">
          <button
            @click="isEditing = true"
            class="w-full bg-white text-slate-700 font-bold py-2.5 px-4 rounded-lg border-2 border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="solar:pen-new-square-line-duotone" class="text-xl" />
            <span>แก้ไขโปรไฟล์</span>
          </button>
        </div>
      </section>

      <section class="space-y-4">
        <div class="form-group">
          <label for="name">ชื่อที่แสดง</label>
          <input
            id="name"
            type="text"
            v-model="formData.name"
            :disabled="!isEditing"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="phone" class="flex items-center gap-1.5">
            <Icon name="ph:seal-check-fill" class="text-green-500" />
            <span>เบอร์โทรศัพท์</span>
          </label>
          <input id="phone" type="tel" v-model="formData.phone" disabled class="form-input" />
          <p v-if="isEditing" class="form-hint">
            ไม่สามารถแก้ไขได้ เนื่องจากเชื่อมต่อกับบัญชี LINE
          </p>
        </div>

        <div class="form-group">
          <label for="property">หอพัก</label>
          <input
            id="property"
            type="text"
            :value="formData.property?.name || '-'"
            disabled
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="status">สถานะ</label>
          <input
            id="status"
            type="text"
            :value="getStatusLabel(formData.status)"
            disabled
            class="form-input"
          />
        </div>
      </section>

      <div v-if="isEditing" class="pt-6 border-t flex items-center gap-3">
        <button
          @click="cancelEdit"
          class="w-full font-bold text-slate-700 bg-slate-200 px-4 py-3 rounded-xl hover:bg-slate-300 transition-all active:scale-95"
        >
          ยกเลิก
        </button>

        <button
          @click="saveProfile"
          :disabled="isSaving"
          class="w-full font-bold text-white bg-indigo-600 px-4 py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Icon v-if="isSaving" name="ph:spinner-duotone" class="animate-spin h-5 w-5" />
          <span v-else>บันทึก</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { UserProfile } from '@repo/db'

definePageMeta({
  title: 'โปรไฟล์ของฉัน',
  showFooter: false,
})

// Stores
const userStore = useUserStore()

// State
const isEditing = ref(false)
const isSaving = ref(false)
const originalData = ref<UserProfile | null>(null)

// Form data
const formData = reactive<Partial<UserProfile>>({
  name: '',
  phone: '',
  status: '',
  propertyId: '',
  property: undefined,
})

// Computed
const isLoading = computed(() => userStore.isLoading)

// Methods
const loadProfile = () => {
  if (userStore.user) {
    originalData.value = { ...userStore.user }
    Object.assign(formData, userStore.user)
  }
}

const getStatusLabel = (status: string | undefined): string => {
  if (!status) return '-'
  const labels: Record<string, string> = {
    ACTIVE: 'ใช้งานอยู่',
    PENDING: 'รอดำเนินการ',
    INACTIVE: 'ไม่ใช้งาน',
  }
  return labels[status] || status
}

const cancelEdit = () => {
  // Reset form data to original state
  if (originalData.value) {
    Object.assign(formData, originalData.value)
  }
  isEditing.value = false
}

const saveProfile = async () => {
  isSaving.value = true

  try {
    // อัปเดตโปรไฟล์ผ่าน store
    await userStore.updateProfile({
      name: formData.name,
      // image: formData.image, // TODO: เพิ่มเมื่อมี image upload
    })

    // อัปเดต original data
    originalData.value = { ...userStore.user } as UserProfile
    isEditing.value = false
  } catch (error) {
    console.error('Failed to save profile:', error)
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Fetch profile if not already loaded
  if (!userStore.user) {
    await userStore.fetchProfile()
  }
  loadProfile()
})
</script>

<style scoped>
.form-group {
  margin-bottom: 0.25rem;
}
.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
}
.form-input {
  width: 100%;
  background-color: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #1e293b;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.form-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px #c7d2fe;
  outline: none;
}
.form-input:disabled {
  background-color: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
}
.form-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}
</style>
