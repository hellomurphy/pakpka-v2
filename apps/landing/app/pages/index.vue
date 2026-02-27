<template>
  <div>
    <SectionsHomeHero />
    <SectionsHomePainPoints />
    <SectionsHomeFeaturesHighlight />
    <HomeWatchVideo />
    <SectionsHomeTestimonials />
    <!-- <SectionsHomeTechnologyPartners /> -->
    <SectionsHomeCtaBanner />
  </div>
</template>

<script setup>
import HomeWatchVideo from '~/components/sections/home/HomeWatchVideo.vue';

definePageMeta({
  headerTheme: "light",
});

useSeoMeta({
  title: "Pakpak เรื่องหอพัก จบ ครบ ในที่เดียว",
  description:
    "เปลี่ยนการจัดการหอพักที่วุ่นวายให้เป็นเรื่องง่ายด้วย Pakpak ระบบที่ใช้ง่ายที่สุดสำหรับเจ้าของหอพักและอพาร์ตเมนต์",
  titleTemplate: "%s",
  ogTitle: "Pakpak เรื่องหอพัก จบ ครบ ในที่เดียว",
  ogDescription:
    "เปลี่ยนการจัดการหอพักที่วุ่นวายให้เป็นเรื่องง่ายด้วย Pakpak ระบบที่ใช้ง่ายที่สุดสำหรับเจ้าของหอพักและอพาร์ตเมนต์",
});
</script>
