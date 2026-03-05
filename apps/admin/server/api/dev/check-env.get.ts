/**
 * Dev-only: เช็คว่าแอปเห็น DATABASE_URL หรือไม่ (ใช้ตอน debug ว่า env โหลดถูกไหม)
 * เมื่อตั้ง DATABASE_URL แล้ว แอปจะใช้ไฟล์เดียวกับ root .wrangler (ที่ migrate แล้ว)
 */
export default defineEventHandler(() => {
  const url = process.env.DATABASE_URL
  const isSet = Boolean(url)
  const hint = isSet
    ? url.startsWith('file:')
      ? `file:...${url.slice(-40)}`
      : '(not a file: URL)'
    : ''
  return {
    databaseUrlSet: isSet,
    hint: isSet ? hint : 'DATABASE_URL not set — NuxtHub will use default local DB',
    suggestion: isSet
      ? 'App is using the same SQLite file as root .wrangler (migrated DB).'
      : 'Set DATABASE_URL in apps/admin/.env (copy from .env.example, uncomment) to use the migrated DB at root/.wrangler.',
  }
})
