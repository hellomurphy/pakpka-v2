export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const pixelId = "1363759558253184"; // <-- ใส่ Pixel ID ของคุณที่นี่

    // สร้าง script tag สำหรับ pixel
    !(function (f: any, b, e, v, n?, t?, s?) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode?.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );

    // เริ่มต้นด้วย pageview
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");

    const router = useRouter();

    router.afterEach(() => {
      if (process.env.NODE_ENV === "development") return;
      window.fbq?.("track", "PageView");
    });
  }
});
