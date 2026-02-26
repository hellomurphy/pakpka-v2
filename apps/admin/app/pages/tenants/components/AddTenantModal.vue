<script setup>
import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import dayjs from "dayjs";

// Composables & Stores
import { useNotification } from "~/composables/useNotification";
import { usePropertyStore } from "~/store/propertyStore";
import { useTenantsStore } from "../store/tenantsStore";
import { useServicesStore } from "~/store/servicesStore";
import { useApiFetch } from "~/composables/useApiFetch";
import { useSettingsStore } from "~/pages/settings/store/settingsStore";

// UI Components
import BaseModal from "~/components/ui/BaseModal.vue";
import BaseButton from "~/components/ui/BaseButton.vue";

// Step Sub-components
import Step1_SelectIntent from "./addTenant/Step1_SelectIntent.vue";
import Step2_FillInfoForm from "./addTenant/Step2_FillInfoForm.vue";
import Step3_ReviewDetails from "./addTenant/Step3_ReviewDetails.vue";

// --- Initializations ---
const tenantsStore = useTenantsStore();
const propertyStore = usePropertyStore();
const settingsStore = useSettingsStore();
const servicesStore = useServicesStore();
const { showError, showSuccess } = useNotification();
const { services: serviceCatalog } = storeToRefs(servicesStore);
const emit = defineEmits(["success"]);

// --- Local State ---
const isModalOpen = ref(false);
const isLoading = ref(false);
const currentStep = ref("select_intent"); // 'select_intent', 'fill_info', 'review'
const selectedIntent = ref(null);
const availableNowRooms = ref([]);
const availableSoonRooms = ref([]);
const existingTenantId = ref(null);


const BillingType = {
  PER_UNIT: 'PER_UNIT',
  FLAT_RATE: 'FLAT_RATE'
};


// --- Zod Schema ---
const validationSchema = computed(() => {
  const tenantInfoSchema = {
    tenantName: z.string().min(1, "ต้องระบุชื่อผู้เช่า"),
    tenantPhone: z
      .string()
      .regex(/^0[0-9]{8,9}$/, "เบอร์โทรไม่ถูกต้อง")
      .optional()
      .or(z.literal("")),
  };
  const contractRoomSchema = {
    roomId: z.string({ required_error: "ต้องเลือกห้องพัก" }),
  };
  const contractDetailsSchema = {
    startDate: z.coerce.date({ required_error: "ต้องระบุวันที่เริ่มสัญญา" }),
    endDate: z.coerce.date({ required_error: "ต้องระบุวันที่สิ้นสุดสัญญา" }),
    rentAmount: z.coerce
      .number({ required_error: "ต้องระบุค่าเช่า" })
      .positive("ค่าเช่าต้องมากกว่า 0"),
    depositAmount: z.coerce
      .number({ required_error: "ต้องระบุค่ามัดจำ" })
      .min(0),
    waterBillingType: z.nativeEnum(BillingType),
    waterRate: z.coerce.number().min(0),
    waterMinimumCharge: z.coerce.number().min(0),
    electricityBillingType: z.nativeEnum(BillingType),
    electricityRate: z.coerce.number().min(0),
    electricityMinimumCharge: z.coerce.number().min(0),
    services: z
      .array(
        z.object({
          serviceId: z.string(),
          name: z.string(),
          price: z.coerce.number(),
          isOptional: z.boolean(),
        })
      )
      .optional(),
  };

  if (currentStep.value === "fill_info") {
    return toTypedSchema(
      selectedIntent.value === "WAITING_LIST"
        ? z.object(tenantInfoSchema)
        : z.object({ ...tenantInfoSchema, ...contractRoomSchema })
    );
  }
  if (currentStep.value === "review") {
    return toTypedSchema(
      z.object({
        ...tenantInfoSchema,
        ...contractRoomSchema,
        ...contractDetailsSchema,
      })
    );
  }
  return toTypedSchema(z.object({}));
});

// --- VeeValidate Form ---
const { values, errors, handleSubmit, resetForm, setValues, defineField } =
  useForm({
    validationSchema: validationSchema,
  });

// Define all fields that sub-components will interact with
const [tenantName, tenantNameAttrs] = defineField("tenantName");
const [tenantPhone, tenantPhoneAttrs] = defineField("tenantPhone");
const [roomId, roomAttrs] = defineField("roomId");
const [rentAmount, rentAmountAttrs] = defineField("rentAmount");
const [depositAmount, depositAmountAttrs] = defineField("depositAmount");
const [startDate, startDateAttrs] = defineField("startDate");
const [endDate, endDateAttrs] = defineField("endDate");
const [waterBillingType, waterBillingTypeAttrs] =
  defineField("waterBillingType");
const [waterRate, waterRateAttrs] = defineField("waterRate");
const [waterMinimumCharge, waterMinimumChargeAttrs] =
  defineField("waterMinimumCharge");
const [electricityBillingType, elecBillingTypeAttrs] = defineField(
  "electricityBillingType"
);
const [electricityRate, elecRateAttrs] = defineField("electricityRate");
const [electricityMinimumCharge, elecMinimumChargeAttrs] = defineField(
  "electricityMinimumCharge"
);
const [services, servicesAttrs] = defineField("services");

// --- Computed & Watchers ---
const groupedRoomOptions = computed(() => {
  const groups = [];
  if (availableNowRooms.value.length > 0)
    groups.push({
      label: "ห้องที่พร้อมเข้าอยู่",
      options: availableNowRooms.value,
    });
  if (availableSoonRooms.value.length > 0)
    groups.push({
      label: "ห้องที่กำลังจะว่าง",
      options: availableSoonRooms.value,
    });
  return groups;
});

const selectedRoomLabel = computed(() => {
  const allRooms = [...availableNowRooms.value, ...availableSoonRooms.value];
  return allRooms.find((r) => r.value === values.roomId)?.label || "N/A";
});

watch(roomId, (newRoomId) => {
  if (newRoomId) {
    const allRooms = [...availableNowRooms.value, ...availableSoonRooms.value];
    const roomInfo = allRooms.find((r) => r.value === newRoomId);
    if (roomInfo) {
      setValues({
        ...values,
        rentAmount: roomInfo.rent,
        depositAmount: roomInfo.deposit,
      });
    }
  }
});

watch(
  () => values.startDate,
  (newDateStr, oldDateStr) => {
    if (newDateStr && newDateStr !== oldDateStr) {
      const start = new Date(newDateStr);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setFullYear(start.getFullYear() + 1);
        end.setDate(end.getDate() - 1);
        setValues({ ...values, endDate: end.toISOString().split("T")[0] });
      }
    }
  },
  { deep: true }
);

// --- Methods ---
const open = async (initialData = {}) => {
  // รีเซ็ตฟอร์มให้มีค่าเริ่มต้นเป็น services ว่างๆ ก่อนเสมอ
  resetForm({ values: { services: [] } });

  // ตั้งค่า State เริ่มต้น
  currentStep.value = "select_intent";
  selectedIntent.value = null;
  existingTenantId.value = null;

  // ถ้ามีข้อมูลเริ่มต้นส่งเข้ามา
  if (Object.keys(initialData).length > 0) {
    // ใช้ setValues เพื่อเติมข้อมูลลงในฟอร์ม
    setValues(initialData);

    // กำหนดสถานะและขั้นตอนเริ่มต้นโดยอัตโนมัติ
    selectedIntent.value = initialData.intent || "ACTIVE";
    currentStep.value = "fill_info"; // ข้ามขั้นตอนแรกไปเลย
  }

  isModalOpen.value = true;
  // ดึงข้อมูลที่จำเป็นสำหรับ Modal
  await Promise.all([fetchAvailableRooms(), servicesStore.fetchServices(propertyStore.propertyId)]);
};

const closeModal = () => (isModalOpen.value = false);

const handleIntentSelected = (intent) => {
  selectedIntent.value = intent;
  currentStep.value = "fill_info";
  const initialStartDate =
    intent === "ACTIVE" ? dayjs().format("YYYY-MM-DD") : "";
  const existingName = values.tenantName || "";
  const existingPhone = values.tenantPhone || "";
  resetForm({
    values: {
      startDate: initialStartDate,
      tenantName: existingName,
      tenantPhone: existingPhone,
      services: [],
    },
  });
};

const goBack = () => {
  if (currentStep.value === "review") currentStep.value = "fill_info";
  else if (currentStep.value === "fill_info")
    currentStep.value = "select_intent";
};

const goToReview = handleSubmit(
  (formValues) => {
    if (selectedIntent.value === "WAITING_LIST") {
      finalSubmit(formValues);
      return;
    }
    const propertySettings = settingsStore.settings?.finance;
    const mandatoryServices = serviceCatalog.value
      .filter((s) => !s.isOptional)
      .map((s) => ({
        serviceId: s.id,
        name: s.name,
        price: s.defaultPrice,
        isOptional: s.isOptional,
      }));

    if (propertySettings) {
      setValues({
        ...formValues,
        services: mandatoryServices,
        waterBillingType: propertySettings.utilities.water.type,
        waterRate: propertySettings.utilities.water.rate,
        waterMinimumCharge: propertySettings.utilities.water.minimumCharge,
        electricityBillingType: propertySettings.utilities.electricity.type,
        electricityRate: propertySettings.utilities.electricity.rate,
        electricityMinimumCharge:
          propertySettings.utilities.electricity.minimumCharge,
      });
      currentStep.value = "review";
    } else {
      showError("ไม่พบการตั้งค่าการเงินเริ่มต้นของหอพัก");
    }
  },
  () => {
    showError("กรุณากรอกข้อมูลที่จำเป็นให้ถูกต้อง");
  }
);

const finalSubmit = handleSubmit(
  async (formValues) => {
    isLoading.value = true;
    try {
      const res = await tenantsStore.createTenant({
        ...formValues,
        status: selectedIntent.value,
        propertyId: propertyStore.propertyId,
      });
      if (res?.success) {
        showSuccess("สร้างสัญญาใหม่สำเร็จ");
        emit("success", selectedIntent.value);
        closeModal();
      }
    } finally {
      isLoading.value = false;
    }
  },
  (ctx) => {
    console.error("Validation Errors:", ctx.errors);
    showError("ข้อมูลยังไม่สมบูรณ์ กรุณาตรวจสอบค่าที่กรอกอีกครั้ง");
  }
);

const fetchAvailableRooms = async () => {
  if (!propertyStore.propertyId) return;
  isLoading.value = true;
  try {
    const response = await useApiFetch(
      `/api/rooms/available-for-contract?propertyId=${propertyStore.propertyId}`,
      { showNotification: false }
    );
    if (response.success && response.data) {
      const mapRoom = (r) => ({
        value: r.id,
        label: r.label,
        rent: r.roomType.basePrice,
        deposit: r.roomType.deposit,
      });
      availableNowRooms.value = response.data.availableNow.map(mapRoom);
      availableSoonRooms.value = response.data.availableSoon.map(mapRoom);
    }
  } finally {
    isLoading.value = false;
  }
};

defineExpose({ open });
</script>

<template>
  <BaseModal v-model="isModalOpen" maxWidth="lg">
    <template #title>
      <span v-if="currentStep === 'select_intent'">เพิ่มผู้เช่าใหม่</span>
      <span v-else-if="currentStep === 'fill_info'">กรอกข้อมูลเบื้องต้น</span>
      <span v-else>ตรวจสอบและยืนยันข้อมูล</span>
    </template>

    <Step1_SelectIntent
      v-if="currentStep === 'select_intent'"
      @intent-selected="handleIntentSelected"
    />

    <Step2_FillInfoForm
      v-if="currentStep === 'fill_info'"
      :intent="selectedIntent"
      :groupedRoomOptions="groupedRoomOptions"
      :errors="errors"
      v-model:tenantName="tenantName"
      :tenantNameAttrs="tenantNameAttrs"
      v-model:tenantPhone="tenantPhone"
      :tenantPhoneAttrs="tenantPhoneAttrs"
      v-model:roomId="roomId"
      :roomAttrs="roomAttrs"
    />

    <Step3_ReviewDetails
      v-if="currentStep === 'review'"
      :values="values"
      :roomLabel="selectedRoomLabel"
      :rentAmountAttrs="rentAmountAttrs"
      :depositAmountAttrs="depositAmountAttrs"
      :startDateAttrs="startDateAttrs"
      :endDateAttrs="endDateAttrs"
      :waterBillingTypeAttrs="waterBillingTypeAttrs"
      :waterRateAttrs="waterRateAttrs"
      :waterMinimumChargeAttrs="waterMinimumChargeAttrs"
      :elecBillingTypeAttrs="elecBillingTypeAttrs"
      :electricityRateAttrs="elecRateAttrs"
      :elecMinimumChargeAttrs="elecMinimumChargeAttrs"
      :servicesAttrs="servicesAttrs"
      v-model:rentAmount="rentAmount"
      v-model:depositAmount="depositAmount"
      v-model:startDate="startDate"
      v-model:endDate="endDate"
      v-model:waterBillingType="waterBillingType"
      v-model:waterRate="waterRate"
      v-model:waterMinimumCharge="waterMinimumCharge"
      v-model:electricityBillingType="electricityBillingType"
      v-model:electricityRate="electricityRate"
      v-model:electricityMinimumCharge="electricityMinimumCharge"
      v-model:services="services"
    />

    <template #footer>
      <div class="w-full flex justify-between items-center">
        <div>
          <BaseButton
            v-if="currentStep !== 'select_intent'"
            @click="goBack"
            variant="secondary"
            >← กลับ</BaseButton
          >
        </div>
        <div class="flex items-center gap-x-3">
          <BaseButton @click="closeModal" variant="secondary"
            >ยกเลิก</BaseButton
          >
          <BaseButton
            v-if="currentStep === 'fill_info'"
            type="button"
            @click="goToReview"
            :loading="isLoading"
          >
            {{
              selectedIntent === "WAITING_LIST" ? "บันทึก" : "ตรวจสอบสัญญา →"
            }}
          </BaseButton>
          <BaseButton
            v-if="currentStep === 'review'"
            @click="finalSubmit"
            :loading="isLoading"
            >✓ ยืนยันและสร้างสัญญา</BaseButton
          >
        </div>
      </div>
    </template>
  </BaseModal>
</template>
