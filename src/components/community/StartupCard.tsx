import Image from 'next/image'
import Link from 'next/link'

import { CohortBadge } from '@/components/community/CohortBadge'
import { OpportunityBadges } from '@/components/community/OpportunityBadges'
import { SocialLinks } from '@/components/community/SocialLinks'
import { TrustBadge } from '@/components/community/TrustBadge'
import { WomenLedBadge } from '@/components/community/WomenLedBadge'
import { formatLocationLine } from '@/lib/format-location'
import { resolveStartupLogoUrl } from '@/lib/media-image'
import { hasSocialLinks } from '@/lib/social-links'
import { formatStartupStage } from '@/lib/startup-stage'
import type { Industry, Media, Startup } from '@/payload-types'

type StartupCardProps = {
  startup: Pick<
    Startup,
    | 'name'
    | 'slug'
    | 'tagline'
    | 'city'
    | 'state'
    | 'country'
    | 'cohortName'
    | 'cohortYear'
    | 'womenLed'
    | 'isHiring'
    | 'isRaising'
    | 'isLookingForCoFounder'
    | 'moderationStatus'
    | 'verificationStatus'
    | 'logoUrl'
    | 'linkedIn'
    | 'twitter'
    | 'instagram'
    | 'facebook'
    | 'youtube'
    | 'github'
    | 'website'
    | 'stage'
    | 'fundingStatus'
    | 'foundedYear'
  > & {
    logo?: Media | number | null
    industry?: Industry | number | null
  }
}

export function StartupCard({ startup }: StartupCardProps) {
  const logo = resolveStartupLogoUrl(startup)

  const industryName =
    startup.industry && typeof startup.industry === 'object' ? startup.industry.name : null

  const stageLabel = formatStartupStage(startup.stage)

  const location = formatLocationLine(startup.city, startup.state, startup.country)

  const socialLinks = {
    linkedIn: startup.linkedIn,
    twitter: startup.twitter,
    instagram: startup.instagram,
    facebook: startup.facebook,
    youtube: startup.youtube,
    github: startup.github,
    website: startup.website,
  }

  const metadataParts = [
    stageLabel,
    startup.fundingStatus?.trim() || null,
    startup.foundedYear ? `Founded ${startup.foundedYear}` : null,
  ].filter(Boolean)

  return (
    <article className="group overflow-hidden rounded-2xl border border-brand-white/10 bg-brand-black/60">
      <Link href={`/startups/${startup.slug}`} className="block p-5">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-white/10">
            {logo ? (
              <Image src={logo} alt={startup.name} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="flex h-full items-center justify-center text-lg font-bold text-brand-yellow">
                {startup.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-brand-white group-hover:text-brand-yellow">
                {startup.name}
              </h3>
              <TrustBadge
                moderationStatus={startup.moderationStatus}
                verificationStatus={startup.verificationStatus}
              />
            </div>
            {startup.tagline ? (
              <p className="line-clamp-2 text-sm text-brand-white/70">{startup.tagline}</p>
            ) : null}
            {location ? <p className="text-xs text-brand-white/50">{location}</p> : null}
            <div className="flex flex-wrap items-center gap-2">
              {industryName ? (
                <span className="text-xs uppercase tracking-wide text-brand-yellow">{industryName}</span>
              ) : null}
              <CohortBadge cohortName={startup.cohortName} cohortYear={startup.cohortYear} />
              <WomenLedBadge womenLed={startup.womenLed} />
              <OpportunityBadges startup={startup} />
            </div>
            {metadataParts.length > 0 ? (
              <p className="text-xs text-brand-white/50">{metadataParts.join(' · ')}</p>
            ) : null}
            {hasSocialLinks(socialLinks) ? (
              <SocialLinks links={socialLinks} limit={3} iconClassName="h-7 w-7" />
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  )
}
