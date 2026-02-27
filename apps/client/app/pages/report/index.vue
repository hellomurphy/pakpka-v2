<template>
  <div class="bg-slate-50">
    <main class="p-4 max-w-2xl mx-auto">
      <div v-if="userRooms.length === 0" class="text-center pt-16 px-6">
        <Icon
          name="solar:home-remove-bold-duotone"
          class="text-8xl text-amber-500 mb-4"
        />
        <h2 class="text-2xl font-bold text-slate-800">คุณยังไม่มีห้องพัก</h2>
        <p class="text-slate-500 mt-2 mb-6">
          กรุณาเพิ่มห้องพักของคุณก่อน จึงจะสามารถแจ้งปัญหาได้
        </p>
        <NuxtLink
          to="/dashboard"
          class="w-full max-w-xs mx-auto bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center space-x-2"
        >
          <Icon name="solar:add-square-bold" class="text-xl" />
          <span>ไปที่หน้าแดชบอร์ด</span>
        </NuxtLink>
      </div>

      <div v-else>
        <div v-if="step === 'select_room'">
          <section class="space-y-3">
            <div class="text-center mb-6">
              <Icon
                name="solar:home-bold-duotone"
                class="text-5xl text-indigo-500 mb-2"
              />
              <h1 class="text-xl font-bold text-slate-800">แจ้งปัญหา</h1>
              <p class="text-slate-500">กรุณาเลือกห้องที่ต้องการแจ้งปัญหา</p>
            </div>
            <div class="space-y-3">
              <button
                v-for="room in userRooms"
                :key="room.id"
                @click="selectRoom(room)"
                class="w-full flex items-center p-3 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
              >
                <img
                  :src="room.imageUrl"
                  alt="Room"
                  class="w-16 h-16 rounded-lg object-cover mr-4"
                />
                <div class="flex-grow">
                  <p class="font-bold text-slate-800">{{ room.roomNumber }}</p>
                  <p class="text-sm text-slate-500">{{ room.name }}</p>
                </div>
                <Icon
                  name="solar:alt-arrow-right-linear"
                  class="text-slate-400 text-xl"
                />
              </button>
            </div>
          </section>
        </div>

        <div v-else-if="step === 'fill_form' && selectedRoom" class="space-y-6">
          <div
            class="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center"
          >
            <div>
              <p class="text-xs text-slate-500">กำลังแจ้งปัญหาสำหรับ:</p>
              <p class="font-bold text-indigo-700">
                {{ selectedRoom.roomNumber }} - {{ selectedRoom.name }}
              </p>
            </div>
            <button
              v-if="userRooms.length > 1"
              @click="resetToRoomSelection"
              class="text-xs font-semibold text-slate-500 hover:underline"
            >
              เปลี่ยนห้อง
            </button>
          </div>

          <section class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="step-circle">1</div>
              <h2 class="step-title">แจ้งปัญหาเกี่ยวกับอะไร?</h2>
            </div>
            <div class="space-y-2">
              <button
                v-for="t in types"
                :key="t.value"
                @click="handleTypeSelect(t.value)"
                class="w-full flex items-center p-4 rounded-xl border transition-all duration-200 text-left"
                :class="
                  selectedType === t.value
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 hover:border-slate-400'
                "
              >
                <Icon :name="t.icon" class="text-2xl text-slate-500 mr-4" />
                <div class="flex-grow">
                  <p class="font-semibold text-slate-700">{{ t.label }}</p>
                  <p class="text-xs text-slate-500">{{ t.description }}</p>
                </div>
                <div class="text-2xl">
                  <Icon
                    :name="
                      selectedType === t.value
                        ? 'ph:radio-button-fill'
                        : 'ph:circle-duotone'
                    "
                    :class="
                      selectedType === t.value
                        ? 'text-indigo-600'
                        : 'text-slate-300'
                    "
                  />
                </div>
              </button>
            </div>
          </section>

          <section v-if="selectedType === 'cleaning'" class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="step-circle">2</div>
              <h2 class="step-title">เลือกวันและเวลาที่สะดวก</h2>
            </div>
            <div class="space-y-4">
              <div>
                <label for="date" class="form-label">วันที่สะดวก</label>
                <VueDatePicker
                  id="date"
                  v-model="form.preferredDate"
                  :enable-time-picker="false"
                  :min-date="new Date()"
                  locale="th"
                  format="dd/MM/yyyy"
                  auto-apply
                  placeholder="เลือกวันที่"
                />
              </div>
              <div>
                <label class="form-label">ช่วงเวลาที่สะดวก</label>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <button
                    @click="form.preferredTime = 'morning'"
                    class="filter-option"
                    :class="{ active: form.preferredTime === 'morning' }"
                  >
                    ช่วงเช้า (09:00-12:00)
                  </button>
                  <button
                    @click="form.preferredTime = 'afternoon'"
                    class="filter-option"
                    :class="{ active: form.preferredTime === 'afternoon' }"
                  >
                    ช่วงบ่าย (13:00-17:00)
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section v-if="selectedType" class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="step-circle">{{ stepNumberForDetails }}</div>
              <h2 class="step-title">ระบุรายละเอียดเพิ่มเติม (ถ้ามี)</h2>
            </div>
            <div class="relative">
              <textarea
                id="detail"
                class="w-full border-slate-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
                rows="5"
                placeholder="เช่น แอร์ไม่เย็น, หลอดไฟห้องน้ำขาด"
                v-model.trim="form.detail"
                maxlength="500"
              ></textarea>
              <div class="absolute bottom-3 right-3 text-xs text-slate-400">
                {{ form.detail.length }} / 500
              </div>
            </div>
          </section>

          <section
            v-if="selectedType && selectedType !== 'emergency'"
            class="space-y-3"
          >
            <div class="flex items-center gap-3">
              <div class="step-circle">{{ stepNumberForPhotos }}</div>
              <h2 class="step-title">แนบรูปภาพ (ถ้ามี)</h2>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <div
                v-for="(image, index) in imagePreviews"
                :key="index"
                class="relative"
              >
                <img
                  :src="image"
                  alt="Preview"
                  class="rounded-lg object-cover w-full h-24 sm:h-28 border border-slate-200"
                />
                <button
                  @click="removeImage(index)"
                  class="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full p-0.5 shadow-md"
                >
                  <Icon name="ph:x-bold" class="w-4 h-4" />
                </button>
              </div>
              <label
                v-if="imagePreviews.length < 5"
                for="imageUpload"
                class="flex flex-col items-center justify-center w-full h-24 sm:h-28 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition text-slate-500"
              >
                <Icon name="ph:camera-plus-duotone" class="text-3xl" />
                <span class="text-xs mt-1">เพิ่มรูปภาพ</span>
              </label>
            </div>
            <input
              id="imageUpload"
              type="file"
              multiple
              class="hidden"
              accept="image/*"
              @change="handleImageUpload"
            />
          </section>

          <div v-if="selectedType" class="pt-4">
            <button
              @click="submit"
              :disabled="!isFormValid || isSubmitting"
              class="w-full text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 active:scale-95 shadow-lg"
              :class="
                selectedType === 'emergency'
                  ? 'bg-red-600 shadow-red-500/30'
                  : 'bg-indigo-600 shadow-indigo-500/30'
              "
            >
              <Icon
                v-if="isSubmitting"
                name="ph:spinner-duotone"
                class="animate-spin h-5 w-5"
              />
              <span>{{ submitButtonText }}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

definePageMeta({
  title: "แจ้งปัญหา",
  headerVariant: "page",
  showFooter: false,
});

// --- STATE MANAGEMENT FOR THE FLOW ---
const step = ref("");
const selectedRoom = ref(null);
const selectedType = ref(null);
const form = ref({
  detail: "",
  preferredDate: null,
  preferredTime: "",
});
const imagePreviews = ref<string[]>([]);
const isSubmitting = ref(false);

// --- MOCK DATA ---
const userRooms = ref([
  {
    id: "r-1",
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2940&auto=format&fit=crop",
    name: "The Modern Property",
    roomNumber: "ห้อง A203",
  },
  {
    id: "r-2",
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2940&auto=format&fit=crop",
    name: "The Modern Property",
    roomNumber: "ห้อง A203",
  },
]);

const types = ref([
  {
    value: "repair",
    label: "ซ่อมแซม",
    icon: "ph:wrench-duotone",
    description: "อุปกรณ์ในห้องชำรุด เช่น แอร์, ไฟ, ท่อประปา",
  },
  {
    value: "cleaning",
    label: "ทำความสะอาด",
    icon: "ph:broom-duotone",
    description: "ขอรับบริการทำความสะอาดห้องพัก",
  },
  {
    value: "emergency",
    label: "เหตุฉุกเฉิน",
    icon: "ph:siren-duotone",
    description: "เช่น ไฟฟ้าดับ, น้ำไม่ไหล, เหตุเร่งด่วน",
  },
  {
    value: "etc",
    label: "เรื่องอื่นๆ",
    icon: "ph:dots-three-outline-fill",
    description: "ปัญหาอื่นๆ ที่ไม่เข้าพวก",
  },
]);

// --- SMART FLOW LOGIC ---
if (userRooms.value.length === 1) {
  selectedRoom.value = userRooms.value[0];
  step.value = "fill_form";
} else if (userRooms.value.length > 1) {
  step.value = "select_room";
}

// --- COMPUTED PROPERTIES ---
const isFormValid = computed(() => {
  if (!selectedType.value) return false;
  if (selectedType.value === "emergency") return form.value.detail.length > 0;
  if (selectedType.value === "cleaning") {
    return (
      form.value.detail.length > 0 &&
      form.value.preferredDate &&
      form.value.preferredTime !== ""
    );
  }
  return form.value.detail.length > 0;
});
const stepNumberForDetails = computed(() =>
  selectedType.value === "cleaning" ? 3 : 2
);
const stepNumberForPhotos = computed(() =>
  selectedType.value === "cleaning" ? 4 : 3
);
const submitButtonText = computed(() => {
  if (isSubmitting.value) return "กำลังส่งข้อมูล...";
  switch (selectedType.value) {
    case "emergency":
      return "ส่งเรื่องฉุกเฉินทันที";
    case "cleaning":
      return "ส่งคำขอทำความสะอาด";
    default:
      return "ส่งเรื่องแจ้งปัญหา";
  }
});

// --- FUNCTIONS ---
function selectRoom(room: any) {
  selectedRoom.value = room;
  step.value = "fill_form";
  if (process.client) {
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function resetToRoomSelection() {
  selectedRoom.value = null;
  selectedType.value = null;
  form.value = { detail: "", preferredDate: null, preferredTime: "" };
  imagePreviews.value = [];
  if (userRooms.value.length > 1) {
    step.value = "select_room";
  }
}

function handleTypeSelect(type: string) {
  selectedType.value = type;
  // ไม่ reset form ในตอนเลือกประเภท เพื่อให้ผู้ใช้สามารถเปลี่ยนประเภทไปมาได้โดยข้อมูลไม่หาย
}

// --- ✨ แก้ไข: เพิ่มโค้ดที่ถูกต้องและสมบูรณ์ในฟังก์ชันนี้ ---
function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  const maxFiles = 5 - imagePreviews.value.length;
  // วนลูปตามจำนวนไฟล์ที่เลือก แต่ไม่เกินจำนวนสูงสุดที่รับได้
  for (let i = 0; i < Math.min(target.files.length, maxFiles); i++) {
    const file = target.files[i];
    if (file) {
      const reader = new FileReader();
      // เมื่อ reader อ่านไฟล์เสร็จ
      reader.onload = (e) => {
        // นำผลลัพธ์ (Base64 string) ไปใส่ใน array เพื่อแสดงผล preview
        if (e.target?.result) {
          imagePreviews.value.push(e.target.result as string);
        }
      };
      // สั่งให้ reader เริ่มอ่านไฟล์
      reader.readAsDataURL(file);
    }
  }
  // เคลียร์ค่าใน input เพื่อให้สามารถเลือกไฟล์เดิมซ้ำได้
  target.value = "";
}

// --- ✨ แก้ไข: เพิ่มโค้ดที่ถูกต้องและสมบูรณ์ในฟังก์ชันนี้ ---
function removeImage(index: number) {
  imagePreviews.value.splice(index, 1);
}

function submit() {
  if (!isFormValid.value) return;
  isSubmitting.value = true;
  console.log({
    roomId: selectedRoom.value?.id,
    type: selectedType.value,
    detail: form.value.detail,
    preferredDate: form.value.preferredDate,
    preferredTime: form.value.preferredTime,
    imagesCount: imagePreviews.value.length,
  });
  setTimeout(() => {
    isSubmitting.value = false;
    alert("ส่งเรื่องแจ้งปัญหาสำเร็จ!");
    // TODO: อาจจะ redirect ไปหน้า history
  }, 2000);
}
</script>

<style>
/* Global override for vue-datepicker to match theme */
:root {
  --dp-border-radius: 0.5rem; /* rounded-lg */
  --dp-border-color: #cbd5e1; /* slate-300 */
  --dp-primary-color: #4f46e5; /* indigo-600 */
  --dp-font-family: inherit; /* Use the app's font */
}
</style>

<style scoped>
.form-label {
  display: block;
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  color: #334155; /* text-slate-700 */
  margin-bottom: 0.25rem; /* mb-1 */
}
.step-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem; /* w-8 */
  height: 2rem; /* h-8 */
  border-radius: 9999px; /* rounded-full */
  background-color: #4f46e5; /* bg-indigo-600 */
  color: #fff; /* text-white */
  font-weight: 700; /* font-bold */
  font-size: 1.125rem; /* text-lg */
}
.step-title {
  font-size: 1.125rem; /* text-lg */
  font-weight: 700; /* font-bold */
  color: #1e293b; /* text-slate-800 */
}
.filter-option {
  width: 100%;
  text-align: center;
  padding: 0.5rem; /* p-2 */
  border-radius: 0.5rem; /* rounded-lg */
  border-width: 2px; /* border-2 */
  border-color: #e2e8f0; /* border-slate-200 */
  background-color: #fff; /* bg-white */
  font-weight: 600; /* font-semibold */
  color: #334155; /* text-slate-700 */
}
.filter-option.active {
  border-color: #6366f1; /* border-indigo-500 */
  background-color: #eef2ff; /* bg-indigo-50 */
  color: #4338ca; /* text-indigo-700 */
  box-shadow: 0 0 0 2px #c7d2fe; /* ring-2 ring-indigo-200 */
}
</style>
