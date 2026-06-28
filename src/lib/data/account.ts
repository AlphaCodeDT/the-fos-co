import { getPayloadClient } from '@/lib/payload'
import type { Founder, Startup } from '@/payload-types'

export async function getFounderStartups(founderId: number): Promise<Startup[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'startups',
    where: {
      or: [{ owner: { equals: founderId } }, { 'claim.claimedBy': { equals: founderId } }],
    },
    depth: 1,
    limit: 100,
    sort: '-updatedAt',
    overrideAccess: true,
  })

  return result.docs as Startup[]
}

export async function getFounderClaims(founderId: number): Promise<Startup[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'startups',
    where: {
      'claim.claimedBy': { equals: founderId },
    },
    depth: 1,
    limit: 100,
    sort: '-updatedAt',
    overrideAccess: true,
  })

  return result.docs as Startup[]
}

export async function getStartupForOwner(startupId: number, founderId: number): Promise<Startup | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'startups',
    where: {
      and: [
        { id: { equals: startupId } },
        {
          or: [{ owner: { equals: founderId } }, { 'claim.claimedBy': { equals: founderId } }],
        },
      ],
    },
    depth: 1,
    limit: 1,
    overrideAccess: true,
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      description: true,
      logo: true,
      logoUrl: true,
      industry: true,
      stage: true,
      teamSize: true,
      city: true,
      state: true,
      country: true,
      fundingStatus: true,
      foundedYear: true,
      linkedIn: true,
      twitter: true,
      instagram: true,
      facebook: true,
      youtube: true,
      github: true,
      website: true,
      organizations: true,
      isHiring: true,
      isRaising: true,
      isLookingForCoFounder: true,
      womenLed: true,
      team: true,
      opportunities: true,
      owner: true,
      moderationStatus: true,
    },
  })

  return (result.docs[0] as Startup | undefined) ?? null
}

export async function getTaxonomyOptions() {
  const payload = await getPayloadClient()

  const [industries, organizations] = await Promise.all([
    payload.find({ collection: 'industries', limit: 100, sort: 'name', overrideAccess: true }),
    payload.find({ collection: 'organizations', limit: 100, sort: 'name', overrideAccess: true }),
  ])

  return {
    industries: industries.docs,
    organizations: organizations.docs,
  }
}

export function describeModerationStatus(status: Founder['moderationStatus']): string {
  switch (status) {
    case 'approved':
      return 'Live on the public site'
    case 'pending':
      return 'Pending review — not yet public'
    default:
      return 'Draft — not yet public'
  }
}

export function describeVerificationStatus(status: Founder['verificationStatus']): string {
  switch (status) {
    case 'verified':
      return 'Verified'
    case 'rejected':
      return 'Verification declined'
    default:
      return 'Verification pending'
  }
}

export function describeClaimStatus(
  status?: 'unclaimed' | 'pending' | 'claimed' | null,
): string {
  switch (status) {
    case 'claimed':
      return 'Claim approved — you can edit this startup'
    case 'pending':
      return 'Claim under review'
    default:
      return 'Unclaimed'
  }
}
