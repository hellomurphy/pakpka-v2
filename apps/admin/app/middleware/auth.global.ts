/**
 * Global auth middleware. Reads route.meta.auth:
 * - auth: false -> allow (e.g. index, dev)
 * - auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/' } -> redirect logged-in users
 * - otherwise -> protected; redirect to /login if not logged in (when ready)
 */
export default defineNuxtRouteMiddleware((to) => {
  const authMeta = to.meta.auth as
    | false
    | { unauthenticatedOnly?: boolean; navigateAuthenticatedTo?: string }
    | undefined

  if (authMeta === false) return

  const { loggedIn, ready } = useAppAuth()

  if (authMeta?.unauthenticatedOnly) {
    if (ready.value && loggedIn.value) {
      return navigateTo(authMeta.navigateAuthenticatedTo ?? '/')
    }
    return
  }

  if (ready.value && !loggedIn.value) {
    return navigateTo('/login')
  }
})
