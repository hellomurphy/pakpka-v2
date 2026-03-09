import { describe, expect, it } from 'vitest'
import { successResponse } from '../../../../server/utils/apiResponse'

describe('apiResponse', () => {
  describe('successResponse', () => {
    it('returns success shape with data and default message', () => {
      const result = successResponse({ id: '1' })
      expect(result).toEqual({ success: true, message: 'Success', data: { id: '1' } })
    })

    it('accepts custom message', () => {
      const result = successResponse(null, 'สร้างสำเร็จ')
      expect(result.success).toBe(true)
      expect(result.message).toBe('สร้างสำเร็จ')
      expect(result.data).toBeNull()
    })
  })

  // errorResponse ใช้ setResponseStatus(event) และขึ้นกับ H3Event — เทสได้ด้วย mock event ถ้าต้องการ
})
