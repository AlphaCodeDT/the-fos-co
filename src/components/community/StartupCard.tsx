import Image from 'next/image'
import Link from 'next/link'

import { OpportunityBadges } from '@/components/community/OpportunityBadges'
import { TrustBadge } from '@/components/community/TrustBadge'
import { resolveStartupLogoUrl } from '@/lib/media-image'
import type { Industry, Media, Startup } from '@/payload-types'

type StartupCardProps = {
  startup: Pick<
    Startup,
    | 'name'
    | 'slug'
    | 'tagline'
    | 'womenLed'
    | 'isHiring'
    | 'isRaising'
    | 'isLookingForCoFounder'
    | 'moderationStatus'
    | 'verificationStatus'
    | 'logoUrl'
  > & {
    logo?: Media | number | null
    industry?: Industry | number | null
  }
}

export function StartupCard({ startup }: StartupCardProps) {
  const logo = resolveStartupLogoUrl(startup)

  const industryName =
    startup.industry && typeof startup.industry === 'object' ? startup.industry.name : null

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
            <div className="flex flex-wrap items-center gap-2">
              {industryName ? (
                <span className="text-xs uppercase tracking-wide text-brand-yellow">{industryName}</span>
              ) : null}
              <OpportunityBadges startup={startup} />
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
