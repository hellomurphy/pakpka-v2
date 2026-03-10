import { useUserStore } from '~/stores/user'

/**
 * Global Authentication Middleware
 * ตรวจสอบสถานะ authentication ก่อนเข้าทุกหน้า
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side
  if (process.server) return

  // Public routes ที่ไม่ต้องเช็ค auth
  const publicRoutes = ['/login', '/register', '/forgot-password']
  const isPublicRoute = publicRoutes.includes(to.path)

  // ถ้าเป็น public route ให้ผ่านไปได้เลย
  if (isPublicRoute) {
    return
  }

  const userStore = useUserStore()

  // ถ้ายังไม่เคย fetch profile ให้ลองดึงก่อน
  if (userStore.status === 'idle') {
    try {
      await userStore.fetchProfile()
    } catch (error) {
      // ถ้า fetch ไม่ได้ แปลว่ายังไม่ login
      console.log('User not authenticated, redirecting to login...')
    }
  }

  // เช็คสถานะ login
  if (!userStore.isLoggedIn) {
    // ถ้ายังไม่ login ให้ redirect ไปหน้า login
    return navigateTo('/login', { replace: true })
  }

  // ถ้า login แล้วและพยายามเข้าหน้า index ให้ redirect ไป dashboard
  if (to.path === '/' && userStore.isLoggedIn) {
    return navigateTo('/dashboard', { replace: true })
  }
})
