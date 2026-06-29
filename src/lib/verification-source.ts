import type { Founder } from '@/payload-types'

/** Human-readable verification source for founder profile TrustBadge. */
export function formatVerificationSourceLabel(
  source?: Founder['verificationSource'] | null,
): string | null {
  if (!source?.type) return null

  if (source.type === 'manual') {
    return 'Manual'
  }

  if (source.type === 'organization') {
    const org = source.organization
    if (org && typeof org === 'object' && org.name) {
      return org.name
    }
  }

  return null
}
