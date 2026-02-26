// apps/admin/server/plugins/db-connection.ts
import { sql } from 'drizzle-orm'
import { db } from '@nuxthub/db'

export default defineNitroPlugin(async () => {
  console.log('🔍 [DB] Checking database connection...')

  try {
    await db.run(sql`SELECT 1`)
    console.log('✅ [DB] Connection established successfully')
  } catch (error: any) {
    console.error('❌ [DB] Connection failed!')
    console.error(`📝 Error: ${error.message}`)

    // ถ้าต่อติดแต่ query ผิดพลาด มันจะฟ้องที่นี่
    if (error.message.includes('no such table')) {
      console.warn('💡 Tip: The connection is fine, but the table "user" was not found.')
    }
  }
})
