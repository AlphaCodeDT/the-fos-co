import { resolveFounderAvatarUrl } from '@/lib/media-image'
import type { Founder } from '@/payload-types'

export type FounderSearchResult = {
  id: number
  name: string
  slug: string
  headline: string | null
  avatarUrl: string | null
  city: string | null
  startups: string[]
}

export function formatFounderSearchSubtitle({
  headline,
  startups,
  city,
}: Pick<FounderSearchResult, 'headline' | 'startups' | 'city'>): string {
  const startupLabel = startups.length > 0 ? startups.join(', ') : null
  return [headline, startupLabel, city].filter(Boolean).join(' · ')
}

export function founderToSearchResult(
  founder: Pick<Founder, 'id' | 'name' | 'slug' | 'headline' | 'avatarUrl' | 'city'> & {
    avatar?: Founder['avatar']
  },
): FounderSearchResult {
  return {
    id: founder.id,
    name: founder.name,
    slug: founder.slug,
    headline: founder.headline ?? null,
    avatarUrl: resolveFounderAvatarUrl(founder),
    city: founder.city ?? null,
    startups: [],
  }
}
