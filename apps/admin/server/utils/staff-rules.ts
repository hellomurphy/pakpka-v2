import { Role } from '@repo/db'

/**
 * Only OWNER can change another staff member's role.
 * Unit-testable without DB/Nitro.
 */
export function canChangeStaffRole(actorRole: string | null | undefined): boolean {
  return actorRole === Role.OWNER
}

/**
 * Whether the target staff member can be removed (not an OWNER).
 * OWNER cannot be deleted; handler must also enforce "at least one owner" separately.
 * Unit-testable without DB/Nitro.
 */
export function canDeleteStaffMember(targetRole: string): boolean {
  return targetRole !== Role.OWNER
}
