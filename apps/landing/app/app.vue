<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <CookieControl locale="th">
      <template #bar="{ bar, text, acceptAll, declineAll, openModal }">
        <h2>การอนุญาตให้ใช้คุกกี้</h2>
        <p>
          เว็บไซต์นี้ใช้คุกกี้เพื่อเพิ่มประสิทธิภาพและประสบการณ์ที่ดีในการใช้งานของคุณ
          คุณสามารถเลือกตั้งค่าความยินยอมได้
        </p>
        <Transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="transform translate-y-12 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform translate-y-12 opacity-0"
        >
          <div
            v-if="text"
            class="fixed bottom-4 left-4 z-50 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl max-w-lg border border-slate-200 dark:border-slate-700"
          >
            <div class="flex flex-col gap-5">
              <div class="flex items-center gap-4">
                <Icon
                  name="lucide:cookie"
                  class="w-8 h-8 text-slate-700 dark:text-slate-200 flex-shrink-0"
                />
                <div>
                  <h3
                    class="text-base font-semibold text-slate-900 dark:text-white"
                  >
                    {{ text.barTitle }}
                  </h3>
                  <p class="text-sm text-slate-600 dark:text-slate-400">
                    เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ
                  </p>
                </div>
              </div>
              <p
                class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
              >
                {{ text.barDescription }}
              </p>
            </div>
          </div>
        </Transition>
      </template>
    </CookieControl>
  </div>
</template>

<script setup></script>
