import { getPayloadClient } from '@/lib/payload'
import { approvedCommunityWhere, indexableCommunityWhere } from '@/lib/queries'

export async function getApprovedFounderBySlug(slug: string) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'founders',
    where: {
      and: [approvedCommunityWhere, { slug: { equals: slug } }],
    },
    limit: 1,
    depth: 2,
  })
}

export async function getApprovedStartupBySlug(slug: string) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'startups',
    where: {
      and: [approvedCommunityWhere, { slug: { equals: slug } }],
    },
    limit: 1,
    depth: 2,
  })
}

/** Directory / list queries — approved moderation only */
export async function getApprovedFounders(limit = 48) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'founders',
    where: approvedCommunityWhere,
    sort: 'name',
    limit,
    depth: 1,
  })
}

export async function getApprovedStartups(limit = 48) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'startups',
    where: approvedCommunityWhere,
    sort: 'name',
    limit,
    depth: 1,
  })
}

/** Sitemap — indexable only (approved + verified) */
export async function getIndexableFoundersForSitemap() {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'founders',
    where: indexableCommunityWhere,
    sort: 'name',
    limit: 1000,
    depth: 0,
    select: {
      slug: true,
      updatedAt: true,
      moderationStatus: true,
      verificationStatus: true,
    },
  })
}

export async function getIndexableStartupsForSitemap() {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'startups',
    where: indexableCommunityWhere,
    sort: 'name',
    limit: 1000,
    depth: 0,
    select: {
      slug: true,
      updatedAt: true,
      moderationStatus: true,
      verificationStatus: true,
    },
  })
}
