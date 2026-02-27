// plugins/aos.client.ts
import AOS from "aos";
import "aos/dist/aos.css";

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window !== "undefined") {
    nuxtApp.AOS = AOS.init({
      // สามารถใส่การตั้งค่าเริ่มต้นของ AOS ได้ที่นี่
      // เช่น offset, duration, easing...
      // duration: 800,
      // once: false,
    });
  }
});
