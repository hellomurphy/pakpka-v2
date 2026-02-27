// plugins/analytics.client.ts

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // ใช้ Google Analytics 4 Measurement ID ของคุณ
    const GA_MEASUREMENT_ID = "G-SYMXSQGT7X";

    // สร้าง tag
    const script = document.createElement("script");
    script.setAttribute("async", "");
    script.setAttribute(
      "src",
      `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    );
    document.head.appendChild(script);

    // ตั้งค่า GA4
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }

    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
  }
});
