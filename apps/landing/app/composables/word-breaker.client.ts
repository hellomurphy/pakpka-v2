import wordcut from "thai-wordcut";

// ตั้งค่าให้ library พร้อมใช้งาน
wordcut.init();

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("word-break", {
    // เมื่อ element ถูก mount เข้ามาใน DOM
    mounted(el: HTMLElement) {
      const originalText = el.textContent || "";

      // ใช้ wordcut.cut() แทน
      // ผลลัพธ์จะเป็นสตริงที่คั่นด้วย "|" เช่น "สวัสดี|ครับ"
      const segmentedText = wordcut.cut(originalText);

      // เราจะแทนที่ "|" ด้วย "Zero-Width Space" (\u200B)
      // ซึ่งเป็นอักขระพิเศษที่มองไม่เห็น แต่เบราว์เซอร์รู้ว่าตัดคำตรงนี้ได้
      const newText = segmentedText.replace(/\|/g, "\u200B");

      el.innerHTML = newText;
    },
    // ทำเช่นเดียวกันเมื่อมีการอัปเดตข้อมูล
    updated(el: HTMLElement) {
      const originalText = el.textContent || "";
      const segmentedText = wordcut.cut(originalText);
      const newText = segmentedText.replace(/\|/g, "\u200B");
      el.innerHTML = newText;
    },
  });
});
