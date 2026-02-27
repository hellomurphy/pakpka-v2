// composables/useCountdown.ts

// 1. import onMounted และ onUnmounted เข้ามา
import { ref, onMounted, onUnmounted } from "vue";

export function useCountdown(targetDate: string) {
  const target = new Date(targetDate).getTime();

  const days = ref(0);
  const hours = ref(0);
  const minutes = ref(0);
  const seconds = ref(0);

  // 2. ประกาศตัวแปร interval ไว้นอก scope เพื่อให้ onUnmounted เรียกใช้ได้
  let interval: NodeJS.Timeout | null = null;

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = target - now;

    if (distance < 0) {
      days.value = 0;
      hours.value = 0;
      minutes.value = 0;
      seconds.value = 0;
      if (interval) clearInterval(interval); // หยุด interval เมื่อเวลาหมด
      return;
    }

    days.value = Math.floor(distance / (1000 * 60 * 60 * 24));
    hours.value = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    minutes.value = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    seconds.value = Math.floor((distance % (1000 * 60)) / 1000);
  };

  // 3. ย้ายการสร้าง interval เข้ามาไว้ใน onMounted
  // โค้ดส่วนนี้จะรัน "เฉพาะบนเบราว์เซอร์" เท่านั้น
  onMounted(() => {
    interval = setInterval(updateCountdown, 1000);
  });

  // 4. onUnmounted ยังคงทำงานเหมือนเดิม คือล้าง interval เมื่อออกจากหน้า
  onUnmounted(() => {
    if (interval) {
      clearInterval(interval);
    }
  });

  // เรียกใช้ครั้งแรกเพื่อให้มีตัวเลขแสดงผลทันที ไม่ต้องรอ 1 วินาที
  updateCountdown();

  return { days, hours, minutes, seconds };
}
