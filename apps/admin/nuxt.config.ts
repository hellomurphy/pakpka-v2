// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const adminRoot = __dirname
const dbUrl = process.env.DATABASE_URL
if (dbUrl?.startsWith('file:')) {
  const pathPart = dbUrl.replace(/^file:\/?/, '')
  if (pathPart.startsWith('.') || !path.isAbsolute(pathPart)) {
    process.env.DATABASE_URL = 'file:' + path.resolve(adminRoot, pathPart)
  }
}

export default defineNuxtConfig({
  modules: ['@nuxthub/core', '@nuxt/eslint', '@nuxt/ui', '@vueuse/nuxt', '@pinia/nuxt', 'nuxt-auth-utils', 'vue-sonner/nuxt'],

  runtimeConfig: {
    public: {
      appMode: process.env.NUXT_PUBLIC_APP_MODE ?? ''
    },
    server: {
      devUserId: process.env.DEV_USER_ID ?? '',
      allowedOrigins: process.env.ALLOWED_ORIGINS ?? ''
    },
    lineChannelId: process.env.LINE_CHANNEL_ID ?? process.env.NUXT_LINE_CHANNEL_ID ?? '',
    lineChannelSecret: process.env.LINE_CHANNEL_SECRET ?? process.env.NUXT_LINE_CHANNEL_SECRET ?? '',
    lineCallbackUrl: process.env.LINE_CALLBACK_URL ?? process.env.NUXT_LINE_CALLBACK_URL ?? ''
  },

  // nuxt-auth-utils: sealed cookie session (min 32-char NUXT_SESSION_PASSWORD in production)
  session: {
    password: process.env.NUXT_SESSION_PASSWORD ?? 'dev-session-secret-min-32-chars-long-for-sealed-cookie'
  },

  // Local dev: when DATABASE_URL is set, use libsql + lazy template so the app uses the
  // same SQLite file as root .wrangler (migrated DB). Production (Cloudflare): use default
  // so NuxtHub uses D1 Binding (driver 'd1'), not DATABASE_URL.
  hub: {
    db:
      process.env.NODE_ENV === 'development' && process.env.DATABASE_URL
        ? { dialect: 'sqlite', driver: 'libsql', connection: {} }
        : 'sqlite',
  },

  devServer: {
    port: 3001
  },

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  build: {
    transpile: ['@vuepic/vue-datepicker']
  }
})
