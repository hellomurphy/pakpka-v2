import { usePropertyStore } from "~/store/propertyStore";
import { useAppAuth } from "~/composables/useAppAuth";
import { useApiFetch } from "~/composables/useApiFetch";

export const useInitializeSession = () => {
  const propertyStore = usePropertyStore();
  const { data: session } = useAppAuth();

  const initialize = async () => {
    if (session.value?.user && !propertyStore.isSessionInitialized) {
      const data = await useApiFetch<{ properties: any[] }>(
        "/api/session/init",
        {
          showNotification: false, // ปิดการแจ้งเตือนตอน init
        }
      );

      if (data?.properties?.length) {
        propertyStore.setInitialProperties(data.properties);
      }
    }
  };

  return { initialize };
};
