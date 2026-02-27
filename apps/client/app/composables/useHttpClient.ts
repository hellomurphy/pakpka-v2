// composables/useHttpClient.ts
import { ofetch } from "ofetch";

let apiClient: ReturnType<typeof ofetch.create> | null = null;

/**
 * Export composable ที่ return apiClient ของเรา
 * เพื่อให้สามารถเรียกใช้ในแอปได้ง่ายๆ เหมือน httpClient
 */
export const useHttpClient = () => {
  // Create client lazily inside the composable to ensure Nuxt context is available
  if (!apiClient) {
    const config = useRuntimeConfig();

    apiClient = ofetch.create({
      // ตั้งค่า Base URL สำหรับ Server API ของเรา (ใช้จาก env)
      baseURL: config.public.apiBaseUrl || "http://localhost:3001/api",

      // Enable credentials (cookies) for NextAuth
      credentials: "include",

      // Interceptor: ทำงานก่อนที่ request จะถูกส่งออกไป
      onRequest({ options }) {
        // NextAuth uses cookies, no need for Bearer token
        // Keep credentials: include for cookie-based auth
        options.credentials = "include";
      },

      // Interceptor: ทำงานเมื่อได้รับ Response สำเร็จ
      onResponse({ response }) {
        // สามารถ log หรือจัดการข้อมูล response ได้ที่นี่
      },

      // Interceptor: ทำงานเมื่อ API response กลับมาเป็น Error
      async onResponseError({ response, options }) {
        // Import stores inside the interceptor to ensure they're called in the right context
        const { useUiStore } = await import("~/stores/ui");
        const { useUserStore } = await import("~/stores/user");

        const uiStore = useUiStore();
        const userStore = useUserStore();

        // แสดง Notification error
        uiStore.showNotification({
          type: "error",
          message: response._data?.message || "An unexpected error occurred",
        });

        // ถ้าเจอ Error 401 Unauthorized ให้ทำการ logout
        if (response.status === 401) {
          userStore.logout();
          // อาจจะ redirect ไปหน้า login
          await navigateTo("/login");
        }
      },
    });
  }

  return apiClient;
};
