import type { H3Event } from 'h3'

/**
 * สร้าง Response สำหรับกรณีสำเร็จ
 */
export function successResponse(data: unknown, message = 'Success') {
  return { success: true, message, data }
}

/**
 * สร้าง Response สำหรับกรณีล้มเหลว (Nuxt 4 / Drizzle; Cloudflare Worker compatible)
 */
export function errorResponse(event: H3Event, error: unknown) {
  const err = error as {
    statusCode?: number
    statusMessage?: string
    message?: string
    cause?: unknown
  }
  const statusCode = err.statusCode ?? 500
  const statusMessage = err.statusMessage ?? 'An unexpected error occurred.'

  setResponseStatus(event, statusCode)

  // Log only server errors (5xx); 4xx are expected (validation, auth) and clutter test output
  if (statusCode >= 500) {
    console.error(`API Error: ${statusCode} - ${statusMessage}`, {
      path: event.path,
      cause: err.cause ?? err.message,
    })
  }

  return {
    success: false,
    error: { code: statusCode, message: statusMessage, details: undefined },
  }
}
