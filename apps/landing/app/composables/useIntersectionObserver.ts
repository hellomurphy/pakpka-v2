// composables/useIntersectionObserver.ts
import { ref, onMounted, onUnmounted } from "vue";

export function useIntersectionObserver(
  targets: Ref<HTMLElement[]>,
  onIntersect: (id: string) => void,
  options: IntersectionObserverInit = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  }
) {
  const observer = ref<IntersectionObserver | null>(null);

  onMounted(() => {
    observer.value = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect(entry.target.id);
        }
      });
    }, options);

    targets.value.forEach((target) => {
      if (target) observer.value?.observe(target);
    });
  });

  onUnmounted(() => {
    observer.value?.disconnect();
  });
}
