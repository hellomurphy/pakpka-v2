<template>
  <div v-if="post" class="bg-white py-30">
    <div class="container mx-auto px-4 max-w-3xl">
      <h1
        class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
      >
        {{ post.title }}
      </h1>
      <p class="mt-2 text-slate-500">
        {{
          new Date(post.createdAt).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }}
      </p>
      <img
        v-if="post.coverImage"
        :src="post.coverImage"
        :alt="post.title"
        class="w-full h-auto rounded-2xl my-8 shadow-lg"
      />

      <article
        v-html="post.bodyHtml"
        class="prose lg:prose-xl max-w-none"
      ></article>
    </div>
  </div>
</template>
<script setup>
const { slug } = useRoute().params;
const { data: post } = await useAsyncData(`post-${slug}`, () =>
  $fetch(`/api/posts/${slug}`)
);

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
    fatal: true,
  });
}

useSeoMeta({
  title: `${post.value.title} | Pakpak Blog`,
  description: post.value.description,
});
</script>
