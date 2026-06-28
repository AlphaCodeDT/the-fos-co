import Image from 'next/image'
import Link from 'next/link'

import { CohortBadge } from '@/components/community/CohortBadge'
import { FounderOpportunityBadges } from '@/components/community/FounderOpportunityBadges'
import { SocialLinks } from '@/components/community/SocialLinks'
import { TrustBadge } from '@/components/community/TrustBadge'
import { resolveFounderAvatarUrl } from '@/lib/media-image'
import { hasSocialLinks } from '@/lib/social-links'
import type { Founder, Media } from '@/payload-types'

type FounderCardProps = {
  founder: Pick<
    Founder,
    'name' | 'slug' | 'headline' | 'city' | 'state' | 'country' | 'cohortName' | 'cohortYear' | 'moderationStatus' | 'verificationStatus' | 'avatarUrl'
    | 'lookingForCoFounder' | 'openToOpportunities'
    | 'linkedIn' | 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'github' | 'website'
  > & {
    avatar?: Media | number | null
  }
}

export function FounderCard({ founder }: FounderCardProps) {
  const avatar = resolveFounderAvatarUrl(founder)

  const location = [founder.city, founder.state, founder.country].filter(Boolean).join(', ')

  const socialLinks = {
    linkedIn: founder.linkedIn,
    twitter: founder.twitter,
    instagram: founder.instagram,
    facebook: founder.facebook,
    youtube: founder.youtube,
    github: founder.github,
    website: founder.website,
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-brand-white/10 bg-brand-black/60">
      <Link href={`/founders/${founder.slug}`} className="block p-5">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-brand-white/10">
            {avatar ? (
              <Image
                src={avatar}
                alt={founder.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-lg font-bold text-brand-yellow">
                {founder.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-brand-white group-hover:text-brand-yellow">
                {founder.name}
              </h3>
              <TrustBadge
                moderationStatus={founder.moderationStatus}
                verificationStatus={founder.verificationStatus}
              />
            </div>
            {founder.headline ? (
              <p className="line-clamp-2 text-sm text-brand-white/70">{founder.headline}</p>
            ) : null}
            {location ? <p className="text-xs text-brand-white/50">{location}</p> : null}
            <CohortBadge cohortName={founder.cohortName} cohortYear={founder.cohortYear} />
            <FounderOpportunityBadges founder={founder} />
            {hasSocialLinks(socialLinks) ? (
              <SocialLinks links={socialLinks} limit={3} iconClassName="h-7 w-7" />
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  )
}
