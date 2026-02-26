import type { Ref } from 'vue'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AppAuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface AppAuthSession {
  user?: AppAuthUser | null
}

export interface SignInCredentialsOptions {
  login: string
  password: string
  redirect?: boolean
}

/**
 * Single entry point for auth. Uses useUserSession() from nuxt-auth-utils once;
 * all pages/components should use this composable instead of useAuth/useUserSession
 * to avoid redundant session subscriptions and token usage.
 */
export function useAppAuth() {
  const { user, loggedIn, ready, clear, fetch: fetchSession } = useUserSession()

  const status: Ref<AuthStatus> = computed(() => {
    if (!ready.value) return 'loading'
    return loggedIn.value ? 'authenticated' : 'unauthenticated'
  })

  const data: Ref<AppAuthSession | null> = computed(() => {
    const u = user.value
    if (!u) return null
    return {
      user: u as AppAuthUser
    }
  })

  const signOut = async (opts?: { callbackUrl?: string; redirect?: boolean }) => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      clear()
    }
    if (opts?.redirect !== false) {
      await navigateTo(opts?.callbackUrl ?? '/login')
    }
  }

  const signIn = async (
    provider: 'line' | 'credentials',
    options?: SignInCredentialsOptions
  ): Promise<{ ok?: boolean; error?: string }> => {
    if (provider === 'line') {
      await navigateTo('/api/auth/line')
      return {}
    }
    if (provider === 'credentials' && options?.login != null && options?.password != null) {
      try {
        await $fetch('/api/auth/credentials', {
          method: 'POST',
          body: {
            login: options.login,
            password: options.password
          }
        })
        if (options.redirect !== false) {
          await navigateTo('/')
        }
        return { ok: true }
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'data' in err && err.data && typeof (err.data as { statusMessage?: string }).statusMessage === 'string'
            ? (err.data as { statusMessage: string }).statusMessage
            : 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        return { error: message }
      }
    }
    return { error: 'Invalid credentials options' }
  }

  return {
    status,
    data,
    user,
    loggedIn,
    ready,
    signOut,
    signIn,
    fetchSession
  }
}
