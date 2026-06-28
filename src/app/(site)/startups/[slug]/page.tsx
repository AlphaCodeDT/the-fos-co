import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BackedBySection } from '@/components/community/BackedByList'
import { ChipList } from '@/components/community/ChipList'
import { CohortBadge } from '@/components/community/CohortBadge'
import { ClaimStartupButton } from '@/components/community/ClaimStartupButton'
import { CommunityProfileContent } from '@/components/community/CommunityProfileContent'
import { OpportunityBadges } from '@/components/community/OpportunityBadges'
import { SocialLinks } from '@/components/community/SocialLinks'
import { StartupCompanyDetails } from '@/components/community/StartupCompanyDetails'
import { StartupOpportunitiesList } from '@/components/community/StartupOpportunitiesList'
import { TrustBadge } from '@/components/community/TrustBadge'
import { WomenLedBadge } from '@/components/community/WomenLedBadge'
import { SiteFooter } from '@/components/layout/site-chrome'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { getCurrentFounder } from '@/lib/auth/founder'
import { formatTeamRole } from '@/lib/community'
import { getStartupBySlug } from '@/lib/data/community'
import { formatLocationLine } from '@/lib/format-location'
import { hasSocialLinks } from '@/lib/social-links'
import { lexicalToPlainText } from '@/lib/richtext'
import { buildCommunityProfileMetadata, buildStartupOrganizationJsonLd } from '@/lib/seo'
import { isIndexable } from '@/lib/trust'
import { resolveStartupLogoUrl } from '@/lib/media-image'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const startup = await getStartupBySlug(slug)

  if (!startup) {
    return {
      title: 'Startup not found',
      robots: { index: false, follow: false },
    }
  }

  return buildCommunityProfileMetadata(
    {
      name: startup.name,
      slug: startup.slug,
      tagline: startup.tagline,
      descriptionPlainText: lexicalToPlainText(startup.description),
      moderationStatus: startup.moderationStatus,
      verificationStatus: startup.verificationStatus,
    },
    'startups',
  )
}

export default async function StartupProfilePage({ params }: PageProps) {
  const { slug } = await params
  const [startup, founder] = await Promise.all([getStartupBySlug(slug), getCurrentFounder()])

  if (!startup) notFound()

  const claimantId =
    typeof startup.claim?.claimedBy === 'object'
      ? startup.claim.claimedBy?.id
      : startup.claim?.claimedBy

  const logo = resolveStartupLogoUrl(startup)

  const team = [...(startup.team || [])].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return 0
  })

  const descriptionPlainText = lexicalToPlainText(startup.description)
  const jsonLd = isIndexable(startup)
    ? buildStartupOrganizationJsonLd(startup, descriptionPlainText)
    : null

  const socialLinks = {
    linkedIn: startup.linkedIn,
    twitter: startup.twitter,
    instagram: startup.instagram,
    facebook: startup.facebook,
    youtube: startup.youtube,
    github: startup.github,
    website: startup.website,
  }

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-brand-white/10">
            {logo ? (
              <Image src={logo} alt={startup.name} fill className="object-cover" sizes="96px" />
            ) : (
              <div className="flex h-full items-center justify-center text-xl font-bold text-brand-yellow">
                {startup.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold text-brand-white">{startup.name}</h1>
              <TrustBadge
                moderationStatus={startup.moderationStatus}
                verificationStatus={startup.verificationStatus}
              />
            </div>
            {startup.tagline ? (
              <p className="text-lg text-brand-white/70">{startup.tagline}</p>
            ) : null}
            {[startup.city, startup.state, startup.country].filter(Boolean).length > 0 ? (
              <p className="text-sm text-brand-white/50">
                {formatLocationLine(startup.city, startup.state, startup.country)}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <CohortBadge cohortName={startup.cohortName} cohortYear={startup.cohortYear} />
              <WomenLedBadge womenLed={startup.womenLed} />
              <OpportunityBadges startup={startup} />
            </div>
            {hasSocialLinks(socialLinks) ? (
              <SocialLinks links={socialLinks} className="pt-1" />
            ) : null}
          </div>
        </div>

        {startup.industry || startup.organizations?.length ? (
          <div className="mt-8 space-y-4">
            {startup.industry ? (
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-yellow">
                  Industry
                </h2>
                <ChipList items={[startup.industry]} />
              </div>
            ) : null}
            {startup.organizations?.length ? (
              <BackedBySection organizations={startup.organizations} />
            ) : null}
          </div>
        ) : null}

        <StartupCompanyDetails startup={startup} />

        {startup.description ? (
          <div className="mt-10 border-t border-brand-white/10 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">About</h2>
            <div className="mt-3">
              <CommunityProfileContent content={startup.description} />
            </div>
          </div>
        ) : null}

        <StartupOpportunitiesList opportunities={startup.opportunities} />

        {team.length > 0 ? (
          <div className="mt-10 border-t border-brand-white/10 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Team</h2>
            <ul className="mt-4 space-y-3">
              {team.map((member, index) => {
                const founder =
                  member.founder && typeof member.founder === 'object' ? member.founder : null
                const displayName = founder?.name || member.name?.trim()

                if (!displayName) return null

                const rowClassName = `flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                  member.isPrimary
                    ? 'border-brand-yellow/40 bg-brand-yellow/5'
                    : 'border-brand-white/10 bg-brand-black/60'
                }`

                if (founder) {
                  return (
                    <li key={`${founder.id}-${index}`}>
                      <Link
                        href={`/founders/${founder.slug}`}
                        className={`${rowClassName} hover:border-brand-yellow/40`}
                      >
                        <span className="font-medium text-brand-white">{displayName}</span>
                        <span className="text-sm text-brand-yellow">{formatTeamRole(member.role)}</span>
                      </Link>
                    </li>
                  )
                }

                return (
                  <li key={`unlinked-${index}`}>
                    <div className={rowClassName}>
                      <span className="font-medium text-brand-white">{displayName}</span>
                      <span className="text-sm text-brand-yellow">{formatTeamRole(member.role)}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        <ClaimStartupButton
          startupId={startup.id}
          startupName={startup.name}
          startupSlug={startup.slug}
          isAuthenticated={Boolean(founder)}
          claimStatus={startup.claim?.claimStatus}
          claimantId={claimantId}
          currentFounderId={founder?.id}
        />
      </main>
      <SiteFooter />
    </>
  )
}
