<template>
  <div class="bg-white">
    <section class="bg-slate-50 border-b border-slate-200">
      <div class="container mx-auto px-4 py-16 sm:py-20">
        <div class="max-w-3xl mx-auto text-center" data-aos="fade-up">
          <h1
            class="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance"
          >
            Pakpak Blog & Resources
          </h1>
          <p class="mt-4 text-lg text-slate-600">
            เคล็ดลับ, ข่าวสาร, และเรื่องราวน่ารู้สำหรับคนทำหอพักยุคใหม่
          </p>
          <div class="mt-8 max-w-lg mx-auto">
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <Icon name="lucide:search" class="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="search"
                placeholder="ค้นหาบทความ..."
                class="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      class="py-16 sm:py-20"
      v-if="featuredPosts && featuredPosts.length > 0"
    >
      <div class="container mx-auto px-4">
        <div
          class="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-8 h-[50rem] lg:h-[40rem]"
        >
          <NuxtLink
            :to="`/blog/${featuredPosts[0].slug}`"
            class="lg:col-span-2 lg:row-span-2 group relative rounded-2xl overflow-hidden shadow-lg"
            data-aos="fade-up"
          >
            <img
              :src="featuredPosts[0].coverImage"
              :alt="featuredPosts[0].title"
              class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
            ></div>
            <div class="relative h-full flex flex-col justify-end p-8">
              <h2
                class="text-2xl lg:text-3xl font-bold text-white leading-tight text-balance"
              >
                {{ featuredPosts[0].title }}
              </h2>
              <p class="mt-2 text-white/80 text-sm line-clamp-2">
                {{ featuredPosts[0].description }}
              </p>
            </div>
          </NuxtLink>

          <NuxtLink
            v-for="post in featuredPosts.slice(1, 4)"
            :key="post.slug"
            :to="`/blog/${post.slug}`"
            class="group relative rounded-2xl overflow-hidden shadow-lg"
            data-aos="fade-up"
            :data-aos-delay="100 + featuredPosts.indexOf(post) * 100"
          >
            <img
              :src="post.coverImage"
              :alt="post.title"
              class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
            ></div>
            <div class="relative h-full flex flex-col justify-end p-6">
              <h2 class="text-lg font-bold text-white leading-tight">
                {{ post.title }}
              </h2>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="py-16 sm:py-20 bg-slate-50">
      <div class="container mx-auto px-4">
        <div class="text-center" data-aos="fade-up">
          <h2 class="text-2xl font-bold text-slate-900">หัวข้อแนะนำ</h2>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <NuxtLink
              v-for="topic in highlightTopics"
              :key="topic"
              :to="`/blog/category/${topic}`"
              class="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-colors"
            >
              #{{ topic }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 sm:py-20">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-slate-900 mb-8" data-aos="fade-up">
          บทความทั้งหมด
        </h2>
        <div v-if="pending" class="text-center">กำลังโหลด...</div>
        <div
          v-else-if="error || !posts.length"
          class="text-center text-slate-500"
        >
          ยังไม่มีบทความในตอนนี้
        </div>
        <div v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <NuxtLink
              v-for="post in paginatedPosts"
              :key="post.slug"
              :to="`/blog/${post.slug}`"
              class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              data-aos="fade-up"
            >
              <img
                :src="post.coverImage"
                :alt="post.title"
                class="w-full h-48 object-cover"
              />
              <div class="p-6">
                <h2
                  class="text-lg font-bold text-slate-800 group-hover:text-teal-600 transition-colors"
                >
                  {{ post.title }}
                </h2>
                <p class="mt-4 text-xs text-slate-400">
                  {{
                    new Date(post.createdAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }}
                </p>
              </div>
            </NuxtLink>
          </div>

          <nav
            v-if="totalPages > 1"
            class="mt-16 flex items-center justify-center space-x-2"
          >
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              <Icon name="lucide:chevron-left" class="w-5 h-5" />
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              class="pagination-btn"
              :class="
                currentPage === page
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-slate-700'
              "
            >
              {{ page }}
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              <Icon name="lucide:chevron-right" class="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>
    </section>

    <SectionsHomeCtaBanner />
  </div>
</template>

<script setup>
// ดึงข้อมูลบทความทั้งหมดมาครั้งเดียว
const {
  data: posts,
  pending,
  error,
} = await useAsyncData("all-posts", () => $fetch("/api/posts"));

useSeoMeta({ title: "บทความ", titleTemplate: "%s | Pakpak" });

// --- Logic สำหรับ Featured Posts ---
const featuredPosts = computed(() => posts.value?.slice(0, 4) || []);

// --- Logic สำหรับ Highlight Topics ---
// (ในชีวิตจริง ส่วนนี้อาจจะดึงมาจาก API แต่ตอนนี้เราจำลองขึ้นมาก่อน)
const highlightTopics = ref([
  "การจัดการหอพัก",
  "การตลาด",
  "การเงิน",
  "เรื่องน่ารู้",
  "เทคโนโลยี",
]);

// --- Logic สำหรับ Pagination ---
const currentPage = ref(1);
const postsPerPage = ref(8); // แสดง 8 บทความต่อหน้า (4 คอลัมน์ 2 แถว)

const archivePosts = computed(() => posts.value?.slice(4) || []); // บทความที่เหลือทั้งหมด

const totalPages = computed(() =>
  Math.ceil(archivePosts.value.length / postsPerPage.value)
);

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage.value;
  const end = start + postsPerPage.value;
  return archivePosts.value.slice(start, end);
});

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    // เลื่อนหน้าจอขึ้นไปบนสุดของลิสต์ (UX ที่ดี)
    window.scrollTo({
      top: document.querySelector(".list-of-blogs")?.offsetTop || 0,
      behavior: "smooth",
    });
  }
}

useSeoMeta({ title: "บทความ", titleTemplate: "%s | Pakpak" });
</script>

<style scoped>
.pagination-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb; /* slate-200 */
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke;
  transition-duration: 150ms;
  opacity: 1;
  cursor: pointer;
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination-btn:hover:not(:disabled) {
  background-color: #f1f5f9; /* slate-100 */
}
</style>
