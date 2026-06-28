import type { Founder, Organization, Startup } from '@/payload-types'

import {
  buildFounderWhere,
  buildStartupWhere,
  isWomenFounderFromGender,
  type DirectoryLocationFilters,
  type FounderFilters,
  type StartupFilters,
} from '@/lib/community-filters'
import { getPayloadClient } from '@/lib/payload'
import { approvedCommunityWhere, indexableCommunityWhere } from '@/lib/queries'

const DEFAULT_LIMIT = 24

const founderDirectorySelect = {
  id: true,
  name: true,
  slug: true,
  headline: true,
  avatar: true,
  avatarUrl: true,
  city: true,
  state: true,
  country: true,
  cohortName: true,
  cohortYear: true,
  moderationStatus: true,
  verificationStatus: true,
  lookingForCoFounder: true,
  openToOpportunities: true,
  gender: true,
  industries: true,
  organizations: true,
  linkedIn: true,
  twitter: true,
  instagram: true,
  facebook: true,
  youtube: true,
  github: true,
  website: true,
} as const

const startupDirectorySelect = {
  id: true,
  name: true,
  slug: true,
  tagline: true,
  logo: true,
  industry: true,
  city: true,
  state: true,
  country: true,
  cohortName: true,
  cohortYear: true,
  womenLed: true,
  isHiring: true,
  isRaising: true,
  isLookingForCoFounder: true,
  moderationStatus: true,
  verificationStatus: true,
  linkedIn: true,
  twitter: true,
  instagram: true,
  facebook: true,
  youtube: true,
  github: true,
  website: true,
  stage: true,
  fundingStatus: true,
  foundedYear: true,
} as const

async function getIndustryIdBySlug(slug?: string): Promise<number | undefined> {
  if (!slug) return undefined

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'industries',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  return result.docs[0]?.id
}

async function getOrganizationIdBySlug(slug?: string): Promise<number | undefined> {
  if (!slug) return undefined

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'organizations',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  return result.docs[0]?.id
}

async function resolveFilterIds(filters: FounderFilters | StartupFilters) {
  const [industryId, organizationId] = await Promise.all([
    getIndustryIdBySlug(filters.industrySlug),
    getOrganizationIdBySlug(filters.organizationSlug),
  ])

  return { industryId, organizationId }
}

export function mapFounderForPublic<T extends { gender?: Founder['gender'] }>(doc: T) {
  const { gender, ...rest } = doc
  return { ...rest, isWomenFounder: isWomenFounderFromGender(gender) }
}

export async function getFounders({
  filters = {},
  page = 1,
  limit = DEFAULT_LIMIT,
}: {
  filters?: FounderFilters
  page?: number
  limit?: number
} = {}) {
  const payload = await getPayloadClient()
  const resolved = await resolveFilterIds(filters)

  const result = await payload.find({
    collection: 'founders',
    where: buildFounderWhere(filters, resolved),
    sort: 'name',
    page,
    limit,
    depth: 2,
    select: founderDirectorySelect,
  })

  return {
    ...result,
    docs: result.docs.map(mapFounderForPublic),
  }
}

export async function getStartups({
  filters = {},
  page = 1,
  limit = DEFAULT_LIMIT,
}: {
  filters?: StartupFilters
  page?: number
  limit?: number
} = {}) {
  const payload = await getPayloadClient()
  const resolved = await resolveFilterIds(filters)

  return payload.find({
    collection: 'startups',
    where: buildStartupWhere(filters, resolved),
    sort: 'name',
    page,
    limit,
    depth: 1,
    select: startupDirectorySelect,
  })
}

export async function getFounderBySlug(slug: string): Promise<Founder | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'founders',
    where: {
      and: [approvedCommunityWhere, { slug: { equals: slug } }],
    },
    limit: 1,
    depth: 2,
  })

  return result.docs[0] ?? null
}

export async function getStartupBySlug(slug: string): Promise<Startup | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'startups',
    where: {
      and: [approvedCommunityWhere, { slug: { equals: slug } }],
    },
    limit: 1,
    depth: 2,
  })

  return result.docs[0] ?? null
}

export async function getStartupsForFounder(founderId: number) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'startups',
    where: {
      and: [approvedCommunityWhere, { 'team.founder': { equals: founderId } }],
    },
    sort: 'name',
    limit: 100,
    depth: 1,
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      logo: true,
      team: true,
      moderationStatus: true,
      verificationStatus: true,
    },
  })
}

export async function getFilterIndustries() {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'industries',
    sort: 'name',
    limit: 200,
    depth: 0,
  })
}

export async function getFilterOrganizations() {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'organizations',
    sort: 'name',
    limit: 200,
    depth: 0,
  })
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'organizations',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 1,
  })

  return (result.docs[0] as Organization | undefined) ?? null
}

export async function getFoundersForOrganization(orgId: number) {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'founders',
    where: {
      and: [approvedCommunityWhere, { organizations: { equals: orgId } }],
    },
    sort: 'name',
    limit: 100,
    depth: 1,
    select: founderDirectorySelect,
  })

  return {
    ...result,
    docs: result.docs.map(mapFounderForPublic),
  }
}

export async function getStartupsForOrganization(orgId: number) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'startups',
    where: {
      and: [approvedCommunityWhere, { organizations: { equals: orgId } }],
    },
    sort: 'name',
    limit: 100,
    depth: 1,
    select: startupDirectorySelect,
  })
}

type LocationFilterCollection = 'founders' | 'startups'

export async function getDirectoryLocationFilters(
  collection: LocationFilterCollection,
): Promise<DirectoryLocationFilters> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection,
    where: approvedCommunityWhere,
    limit: 1000,
    depth: 0,
    select: {
      state: true,
      city: true,
      cohortYear: true,
    },
  })

  const states = new Set<string>()
  const citiesByState: Record<string, Set<string>> = {}
  const cohortYears = new Set<number>()

  for (const doc of result.docs) {
    const state = typeof doc.state === 'string' ? doc.state.trim() : ''
    const city = typeof doc.city === 'string' ? doc.city.trim() : ''

    if (state) {
      states.add(state)
      if (city) {
        citiesByState[state] ??= new Set<string>()
        citiesByState[state].add(city)
      }
    }

    if (typeof doc.cohortYear === 'number' && !Number.isNaN(doc.cohortYear)) {
      cohortYears.add(doc.cohortYear)
    }
  }

  return {
    states: [...states].sort((a, b) => a.localeCompare(b)),
    citiesByState: Object.fromEntries(
      Object.entries(citiesByState).map(([state, cities]) => [
        state,
        [...cities].sort((a, b) => a.localeCompare(b)),
      ]),
    ),
    cohortYears: [...cohortYears].sort((a, b) => b - a),
  }
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
