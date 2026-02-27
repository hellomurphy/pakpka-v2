<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#4679A3] to-[#87B3D9] p-4"
  >
    <div class="w-full max-w-md">
      <!-- Logo/Title -->
      <div class="text-center mb-8">
        <h1 class="text-white text-4xl font-bold mb-2">PakPak</h1>
        <p class="text-white/80 text-sm">ระบบจัดการหอพักสำหรับผู้เช่า</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-slate-800">เข้าสู่ระบบ</h2>
          <p class="text-slate-500 text-sm mt-1">
            กรุณาเข้าสู่ระบบเพื่อใช้งาน
          </p>
        </div>

        <!-- Dev Mode Login Form -->
        <div v-if="isDevMode" class="space-y-4">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p class="text-xs text-yellow-800 font-semibold">
              🔧 DEV MODE: ใช้ username/password เพื่อ login
            </p>
          </div>

          <form @submit.prevent="handleDevLogin" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>
              <input
                v-model="loginForm.username"
                type="text"
                placeholder="kittipong"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="password"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Icon
                v-if="isLoading"
                name="ph:spinner-duotone"
                class="animate-spin mr-2"
              />
              <span>{{ isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ" }}</span>
            </button>
          </form>

          <div v-if="errorMessage" class="text-center">
            <p class="text-sm text-red-600">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- LINE Login (Production) -->
        <div v-else class="space-y-4">
          <button
            @click="handleLineLogin"
            class="w-full bg-[#06C755] text-white font-semibold py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 hover:bg-[#05b04d] transition-all"
          >
            <img
              src="https://scdn.line-apps.com/n/line_login/btn_login_base.png"
              alt="LINE"
              class="w-6 h-6"
            />
            <span>Login with LINE</span>
          </button>

          <p class="text-xs text-slate-400 text-center">
            การเข้าสู่ระบบถือว่าคุณยอมรับ
            <a href="#" class="text-indigo-600 underline">เงื่อนไขการใช้งาน</a>
          </p>
        </div>
      </div>

      <!-- Dev Mode Toggle (for testing) -->
      <div v-if="canToggleDevMode" class="text-center mt-4">
        <button
          @click="isDevMode = !isDevMode"
          class="text-white/60 text-xs hover:text-white transition-colors"
        >
          {{ isDevMode ? "Switch to LINE Login" : "Switch to Dev Mode" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

definePageMeta({
  layout: "splash",
});

// State
const loginForm = ref({
  username: "kittipong",
  password: "password",
});

// เช็คว่าถ้า login อยู่แล้ว ให้ redirect ไป dashboard
const userStore = useUserStore();
onMounted(async () => {
  // ถ้า login อยู่แล้ว redirect ไป dashboard
  if (userStore.isLoggedIn) {
    await navigateTo("/dashboard", { replace: true });
  }
});
const isLoading = ref(false);
const errorMessage = ref("");

// Check if dev mode based on environment
const isDevMode = ref(
  process.env.NODE_ENV === "development" ||
    process.env.NUXT_PUBLIC_APP_MODE === "demo"
);

// Allow toggling in development
const canToggleDevMode = computed(() => process.env.NODE_ENV === "development");

// Dev mode login handler
const handleDevLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const baseURL = useRuntimeConfig().public.apiBaseUrl || "http://localhost:3001/api";

    // Step 1: Get CSRF token
    const csrfResponse = await $fetch(`${baseURL}/auth/csrf`, {
      credentials: "include",
    });

    const csrfToken = csrfResponse.csrfToken;

    // Step 2: Login with credentials
    const formData = new URLSearchParams();
    formData.append("login", loginForm.value.username);
    formData.append("password", loginForm.value.password);
    formData.append("csrfToken", csrfToken);
    formData.append("json", "true");

    const loginResponse = await $fetch(`${baseURL}/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      credentials: "include",
      redirect: "manual",
    });

    console.log("Login successful:", loginResponse);

    // Step 3: Verify session by fetching profile
    const api = useApi();
    try {
      await userStore.fetchProfile();

      if (userStore.user) {
        // Login successful, redirect to dashboard
        await navigateTo("/dashboard");
      } else {
        errorMessage.value = "ไม่พบข้อมูลผู้เช่า กรุณาติดต่อเจ้าของหอพัก";
      }
    } catch (profileError) {
      errorMessage.value = "ไม่พบข้อมูลผู้เช่า กรุณาติดต่อเจ้าของหอพัก";
    }
  } catch (error: any) {
    console.error("Login error:", error);
    errorMessage.value =
      error.data?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
  } finally {
    isLoading.value = false;
  }
};

// LINE login handler (placeholder for future)
const handleLineLogin = () => {
  // TODO: Implement LINE Login with LIFF
  alert("LINE Login will be implemented later");
};
</script>
