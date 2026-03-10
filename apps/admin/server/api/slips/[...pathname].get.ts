import { blob } from '@nuxthub/blob'
import { getRouterParams } from 'h3'

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event)
  let pathname = params.pathname
  if (!pathname || typeof pathname !== 'string') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
  try {
    pathname = decodeURIComponent(pathname)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
  const normalized = pathname.replace(/\/+/g, '/').replace(/^\/|\/$/g, '')
  if (!normalized.startsWith('slips/') || normalized.includes('..')) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
  return blob.serve(event, normalized)
})
