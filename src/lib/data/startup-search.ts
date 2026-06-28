import { resolveStartupLogoUrl } from '@/lib/media-image'
import { getPayloadClient } from '@/lib/payload'
import { approvedCommunityWhere } from '@/lib/queries'
import { mapStartupToSearchResult, type StartupSearchResult } from '@/lib/startup-search-utils'
import type { Startup } from '@/payload-types'

export type { StartupSearchResult } from '@/lib/startup-search-utils'

export async function searchStartups(
  query: string,
  currentFounderId?: number | null,
): Promise<StartupSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'startups',
    where: {
      and: [approvedCommunityWhere, { name: { contains: trimmed } }],
    },
    limit: 8,
    depth: 0,
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      logoUrl: true,
      logo: true,
      owner: true,
      claim: true,
    },
    overrideAccess: true,
  })

  return (result.docs as Pick<
    Startup,
    'id' | 'name' | 'slug' | 'tagline' | 'logoUrl' | 'logo' | 'owner' | 'claim'
  >[]).map((startup) =>
    mapStartupToSearchResult(
      {
        ...startup,
        logoUrl: resolveStartupLogoUrl(startup),
      },
      currentFounderId,
    ),
  )
}
