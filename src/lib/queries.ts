import type { Where } from 'payload'

/** Published editorial content only */
export const publishedStoriesWhere: Where = {
  _status: {
    equals: 'published',
  },
}

/** Public community visibility — moderation approved only */
export const approvedCommunityWhere: Where = {
  moderationStatus: {
    equals: 'approved',
  },
}

/** Indexable community records — approved moderation + verified identity/legitimacy */
export const indexableCommunityWhere: Where = {
  and: [
    { moderationStatus: { equals: 'approved' } },
    { verificationStatus: { equals: 'verified' } },
  ],
}
