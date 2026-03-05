/**
 * เมื่อมี navigation ไปที่ path ที่ขึ้นต้นด้วย /api/ ให้โหลดเต็มหน้าแทน
 * เพื่อไม่ให้ Vue Router พยายาม match (และโผล่ warn "No match found")
 */
export default defineNuxtPlugin(() => {
  const router = useRouter()
  router.beforeEach((to, _from, next) => {
    if (to.path.startsWith('/api/')) {
      window.location.href = to.fullPath
      next(false)
      return
    }
    next()
  })
})
