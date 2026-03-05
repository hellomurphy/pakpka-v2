import { describe, expect, it } from 'vitest'
import {
  canChangeStaffRole,
  canDeleteStaffMember
} from '../../../../server/utils/staff-rules'
import { Role } from '@repo/db'

describe('staff-rules', () => {
  describe('canChangeStaffRole', () => {
    it('returns true only for OWNER', () => {
      expect(canChangeStaffRole(Role.OWNER)).toBe(true)
    })

    it('returns false for ADMIN and STAFF', () => {
      expect(canChangeStaffRole(Role.ADMIN)).toBe(false)
      expect(canChangeStaffRole(Role.STAFF)).toBe(false)
    })

    it('returns false for null and undefined', () => {
      expect(canChangeStaffRole(null)).toBe(false)
      expect(canChangeStaffRole(undefined)).toBe(false)
    })
  })

  describe('canDeleteStaffMember', () => {
    it('returns false for OWNER', () => {
      expect(canDeleteStaffMember(Role.OWNER)).toBe(false)
    })

    it('returns true for ADMIN and STAFF', () => {
      expect(canDeleteStaffMember(Role.ADMIN)).toBe(true)
      expect(canDeleteStaffMember(Role.STAFF)).toBe(true)
    })
  })
})
