import { defineConfig } from 'drizzle-kit'

/**
 * Drizzle Kit config (used only for local/dev tooling).
 *
 * - generate: creates migration SQL in ./drizzle from schema.ts (no DB connection needed).
 * - studio: connects to the same SQLite file Wrangler uses for D1 local, so you see real data.
 *
 * Production: This file is NOT used to connect to production D1. The app uses Wrangler's D1
 * binding at runtime. Apply migrations with: wrangler d1 execute pakpak-db --remote --file=./drizzle/xxxx.sql
 *
 * Override: set DATABASE_URL (e.g. file:/path/to/other.sqlite) to point Studio elsewhere.
 * If the local D1 file hash changes: ls .wrangler/state/v3/d1/miniflare-D1DatabaseObject/
 */
const wranglerD1Path =
  '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/2745d5729486eded0d5c46a716e77d229e8e2423b6797adb34288688958525b6.sqlite'

export default defineConfig({
  dialect: 'sqlite',
  schema: './schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? `file:../../${wranglerD1Path}`,
  },
  verbose: true,
  strict: true,
})
