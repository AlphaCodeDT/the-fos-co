/** Moderation gates public visibility */
export type ModerationStatus = 'draft' | 'pending' | 'approved'

/** Verification gates indexing + trust badge only */
export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export type CommunityTrustFields = {
  moderationStatus: ModerationStatus
  verificationStatus: VerificationStatus
}

export function isPubliclyVisible(record: CommunityTrustFields): boolean {
  return record.moderationStatus === 'approved'
}

export function isIndexable(record: CommunityTrustFields): boolean {
  return record.moderationStatus === 'approved' && record.verificationStatus === 'verified'
}

export function shouldNoIndexCommunityProfile(record: CommunityTrustFields): boolean {
  return !isIndexable(record)
}

export function showVerifiedBadge(record: CommunityTrustFields): boolean {
  return record.verificationStatus === 'verified'
}
