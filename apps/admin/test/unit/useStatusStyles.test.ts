import { describe, expect, it } from 'vitest'
import { useStatusStyles } from '../../app/composables/useStatusStyles'

describe('useStatusStyles', () => {
  it('returns correct info for ACTIVE status', () => {
    const { getContractStatusInfo } = useStatusStyles()
    const result = getContractStatusInfo('ACTIVE')
    expect(result).toEqual({
      text: 'กำลังใช้งาน',
      class: 'bg-green-100 text-green-800',
    })
  })

  it('returns correct info for PENDING status', () => {
    const { getContractStatusInfo } = useStatusStyles()
    const result = getContractStatusInfo('PENDING')
    expect(result).toEqual({
      text: 'รอดำเนินการ',
      class: 'bg-yellow-100 text-yellow-800',
    })
  })

  it('returns correct info for EXPIRED status', () => {
    const { getContractStatusInfo } = useStatusStyles()
    const result = getContractStatusInfo('EXPIRED')
    expect(result).toEqual({
      text: 'หมดอายุ',
      class: 'bg-gray-100 text-gray-800',
    })
  })

  it('returns correct info for TERMINATED status', () => {
    const { getContractStatusInfo } = useStatusStyles()
    const result = getContractStatusInfo('TERMINATED')
    expect(result).toEqual({
      text: 'ยกเลิก/สิ้นสุด',
      class: 'bg-red-100 text-red-800',
    })
  })

  it('returns fallback for unknown status', () => {
    const { getContractStatusInfo } = useStatusStyles()
    const result = getContractStatusInfo('UNKNOWN_STATUS')
    expect(result).toEqual({
      text: 'UNKNOWN_STATUS',
      class: 'bg-gray-100 text-gray-800',
    })
  })
})
