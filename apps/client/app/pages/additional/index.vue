<template>
  <div class="bg-slate-50">
    <main class="p-4 max-w-2xl mx-auto">
      <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm mb-6">
        <img
          v-if="user.pictureUrl"
          class="h-16 w-16 rounded-full object-cover border-2 border-white shadow"
          :src="user.pictureUrl"
          alt="User profile"
        />
        <div
          v-else
          class="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow"
        >
          <Icon name="solar:user-bold-duotone" class="h-8 w-8 text-slate-500" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-800">
            {{ user.displayName }}
          </h2>
          <p class="text-sm text-slate-500">ยินดีต้อนรับ! 👋</p>
        </div>
      </div>

      <div class="space-y-6">
        <section>
          <h3 class="px-4 mb-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
            บัญชี
          </h3>
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <ul class="divide-y divide-slate-100">
              <li v-for="item in accountMenu" :key="item.title">
                <NuxtLink
                  :to="item.url"
                  class="flex items-center p-4 gap-4 hover:bg-slate-50 transition-colors"
                >
                  <Icon :name="item.icon" class="text-2xl text-slate-500" />
                  <span class="font-semibold text-slate-700 flex-grow">{{ item.title }}</span>
                  <Icon name="solar:alt-arrow-right-linear" class="text-slate-400" />
                </NuxtLink>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h3 class="px-4 mb-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
            ช่วยเหลือและตั้งค่า
          </h3>
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <ul class="divide-y divide-slate-100">
              <li v-for="item in supportMenu" :key="item.title">
                <NuxtLink
                  :to="item.url"
                  class="flex items-center p-4 gap-4 hover:bg-slate-50 transition-colors"
                >
                  <Icon :name="item.icon" class="text-2xl text-slate-500" />
                  <span class="font-semibold text-slate-700 flex-grow">{{ item.title }}</span>
                  <Icon name="solar:alt-arrow-right-linear" class="text-slate-400" />
                </NuxtLink>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              @click="handleLogout"
              class="w-full flex items-center p-4 gap-4 hover:bg-red-50 transition-colors"
            >
              <Icon name="solar:logout-2-line-duotone" class="text-2xl text-red-500" />
              <span class="font-bold text-red-500 flex-grow text-left">ออกจากระบบ</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
// กำหนด Title ของหน้านี้
definePageMeta({
  title: 'เพิ่มเติม',
})

// ข้อมูลผู้ใช้ตัวอย่าง (ในแอปจริงควรดึงมาจาก State กลาง)
const user = {
  displayName: 'Suwit Jaidee',
  pictureUrl: 'https://profile.line-scdn.net/0h123abcdeFGHIJklmno_p1234567890t1234567890',
}

const userRooms = ref([
  { id: 'r-1', name: 'ห้อง A203', status: 'overdue' },
  { id: 'r-2', name: 'ห้อง 501', status: 'paid' },
  { id: 'r-3', name: 'ห้อง 12A', status: 'paid' },
])

const myRoomLink = computed(() => {
  if (userRooms.value.length === 1) {
    const room = userRooms.value[0]
    return room ? `/room/${room.id}` : '/my-rooms'
  }
  return '/my-rooms'
})

const accountMenu = ref([
  {
    title: 'โปรไฟล์ของฉัน',
    icon: 'solar:user-circle-line-duotone',
    url: '/profile',
  },
  {
    title: 'ห้องของฉัน',
    icon: 'solar:bed-line-duotone',
    url: myRoomLink.value,
  },
  {
    title: 'ประวัติการชำระเงิน',
    icon: 'solar:bill-list-line-duotone',
    url: '/history/payment',
  },
  {
    title: 'รายการแจ้งซ่อม',
    icon: 'solar:health-line-duotone',
    url: '/history/repairs',
  },
])

const supportMenu = [
  {
    title: 'ตั้งค่าการแจ้งเตือน',
    icon: 'solar:bell-bing-line-duotone',
    url: '/settings/notifications',
  },
  {
    title: 'ศูนย์ช่วยเหลือ',
    icon: 'solar:help-circle-line-duotone',
    url: '/support',
  },
  {
    title: 'ข้อตกลงและเงื่อนไข',
    icon: 'solar:document-text-line-duotone',
    url: '/terms',
  },
  {
    title: 'นโยบายความเป็นส่วนตัว',
    icon: 'solar:shield-check-line-duotone',
    url: '/privacy-policy',
  },
]

const userStore = useUserStore()
const handleLogout = async () => {
  await userStore.logout()
}
</script>
