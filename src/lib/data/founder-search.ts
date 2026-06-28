import { resolveFounderAvatarUrl } from '@/lib/media-image'
import { getPayloadClient } from '@/lib/payload'
import { approvedCommunityWhere } from '@/lib/queries'
import type { FounderSearchResult } from '@/lib/founder-search-utils'
import type { Founder, Startup } from '@/payload-types'

export type { FounderSearchResult } from '@/lib/founder-search-utils'

function addStartupName(map: Map<number, string[]>, founderId: number, startupName: string) {
  const names = map.get(founderId)
  if (!names || names.includes(startupName) || names.length >= 2) return
  names.push(startupName)
}

function getRelationshipId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'number') {
    return value.id
  }
  return null
}

export async function searchFounders(query: string): Promise<FounderSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const payload = await getPayloadClient()

  const foundersResult = await payload.find({
    collection: 'founders',
    where: {
      and: [approvedCommunityWhere, { name: { contains: trimmed } }],
    },
    limit: 8,
    depth: 0,
    select: {
      id: true,
      name: true,
      slug: true,
      headline: true,
      avatarUrl: true,
      avatar: true,
      city: true,
    },
    overrideAccess: true,
  })

  const founders = foundersResult.docs as Pick<
    Founder,
    'id' | 'name' | 'slug' | 'headline' | 'avatarUrl' | 'avatar' | 'city'
  >[]

  if (founders.length === 0) return []

  const founderIds = founders.map((founder) => founder.id)
  const startupNamesByFounder = new Map<number, string[]>(
    founderIds.map((id) => [id, []]),
  )

  const startupsResult = await payload.find({
    collection: 'startups',
    where: {
      and: [
        approvedCommunityWhere,
        {
          or: [{ owner: { in: founderIds } }, { 'team.founder': { in: founderIds } }],
        },
      ],
    },
    select: {
      name: true,
      owner: true,
      team: true,
    },
    depth: 0,
    limit: 50,
    overrideAccess: true,
  })

  for (const startup of startupsResult.docs as Pick<Startup, 'name' | 'owner' | 'team'>[]) {
    const ownerId = getRelationshipId(startup.owner)
    if (ownerId && startupNamesByFounder.has(ownerId)) {
      addStartupName(startupNamesByFounder, ownerId, startup.name)
    }

    for (const member of startup.team || []) {
      const memberFounderId = getRelationshipId(member.founder)
      if (memberFounderId && startupNamesByFounder.has(memberFounderId)) {
        addStartupName(startupNamesByFounder, memberFounderId, startup.name)
      }
    }
  }

  return founders.map((founder) => ({
    id: founder.id,
    name: founder.name,
    slug: founder.slug,
    headline: founder.headline ?? null,
    avatarUrl: resolveFounderAvatarUrl(founder),
    city: founder.city ?? null,
    startups: startupNamesByFounder.get(founder.id) ?? [],
  }))
}
