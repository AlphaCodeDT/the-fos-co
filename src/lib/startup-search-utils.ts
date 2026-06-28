export type StartupSearchResult = {
  id: number
  name: string
  slug: string
  tagline: string | null
  logoUrl: string | null
  claimStatus: 'unclaimed' | 'pending' | 'claimed'
  isClaimable: boolean
  isOwnedBySelf: boolean
  chipLabel: string
}

export function getStartupClaimStatus(
  status?: 'unclaimed' | 'pending' | 'claimed' | null,
): 'unclaimed' | 'pending' | 'claimed' {
  return status ?? 'unclaimed'
}

export function getRelationshipId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'number') {
    return value.id
  }
  return null
}

export function computeIsClaimable({
  hasOwner,
  claimStatus,
}: {
  hasOwner: boolean
  claimStatus: 'unclaimed' | 'pending' | 'claimed'
}): boolean {
  return !hasOwner && claimStatus !== 'claimed' && claimStatus !== 'pending'
}

export function describeStartupSearchChip({
  hasOwner,
  claimStatus,
  isOwnedBySelf,
  isClaimable,
}: {
  hasOwner: boolean
  claimStatus: 'unclaimed' | 'pending' | 'claimed'
  isOwnedBySelf: boolean
  isClaimable: boolean
}): string {
  if (isOwnedBySelf) {
    return 'You already own this'
  }

  if (isClaimable) {
    return 'Available'
  }

  if (claimStatus === 'pending') {
    return 'Claim pending'
  }

  if (hasOwner || claimStatus === 'claimed') {
    return 'Already claimed'
  }

  return 'Unavailable'
}

export function mapStartupToSearchResult(
  startup: {
    id: number
    name: string
    slug: string
    tagline?: string | null
    logoUrl: string | null
    owner?: unknown
    claim?: {
      claimStatus?: 'unclaimed' | 'pending' | 'claimed' | null
    } | null
  },
  currentFounderId?: number | null,
): StartupSearchResult {
  const ownerId = getRelationshipId(startup.owner)
  const hasOwner = ownerId !== null
  const claimStatus = getStartupClaimStatus(startup.claim?.claimStatus)
  const isOwnedBySelf = currentFounderId != null && ownerId === currentFounderId
  const isClaimable = computeIsClaimable({ hasOwner, claimStatus })

  return {
    id: startup.id,
    name: startup.name,
    slug: startup.slug,
    tagline: startup.tagline ?? null,
    logoUrl: startup.logoUrl,
    claimStatus,
    isClaimable,
    isOwnedBySelf,
    chipLabel: describeStartupSearchChip({
      hasOwner,
      claimStatus,
      isOwnedBySelf,
      isClaimable,
    }),
  }
}
