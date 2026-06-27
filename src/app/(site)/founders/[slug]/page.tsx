import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ChipList } from '@/components/community/ChipList'
import { CommunityProfileContent } from '@/components/community/CommunityProfileContent'
import { TrustBadge } from '@/components/community/TrustBadge'
import { SiteFooter } from '@/components/layout/site-chrome'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { formatTeamRole } from '@/lib/community'
import { getFounderBySlug, getStartupsForFounder } from '@/lib/data/community'
import { buildCommunityProfileMetadata, buildFounderPersonJsonLd } from '@/lib/seo'
import { isIndexable } from '@/lib/trust'
import { resolveFounderAvatarUrl, resolveStartupLogoUrl } from '@/lib/media-image'
import { lexicalToPlainText } from '@/lib/richtext'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const founder = await getFounderBySlug(slug)

  if (!founder) {
    return {
      title: 'Founder not found',
      robots: { index: false, follow: false },
    }
  }

  return buildCommunityProfileMetadata(
    {
      name: founder.name,
      slug: founder.slug,
      headline: founder.headline,
      bioPlainText: lexicalToPlainText(founder.bio),
      moderationStatus: founder.moderationStatus,
      verificationStatus: founder.verificationStatus,
    },
    'founders',
  )
}

export default async function FounderProfilePage({ params }: PageProps) {
  const { slug } = await params
  const founder = await getFounderBySlug(slug)

  if (!founder) notFound()

  const startupsResult = await getStartupsForFounder(founder.id)
  const linkedStartups = startupsResult.docs

  const avatar = resolveFounderAvatarUrl(founder)

  const socialLinks = [
    { label: 'LinkedIn', href: founder.linkedIn },
    { label: 'Twitter', href: founder.twitter },
    { label: 'Website', href: founder.website },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href))

  const jsonLd = isIndexable(founder) ? buildFounderPersonJsonLd(founder) : null

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
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-brand-white/10">
            {avatar ? (
              <Image src={avatar} alt={founder.name} fill className="object-cover" sizes="112px" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-bold text-brand-yellow">
                {founder.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold text-brand-white">{founder.name}</h1>
              <TrustBadge
                moderationStatus={founder.moderationStatus}
                verificationStatus={founder.verificationStatus}
              />
            </div>
            {founder.headline ? (
              <p className="text-lg text-brand-white/70">{founder.headline}</p>
            ) : null}
            {[founder.city, founder.state, founder.country].filter(Boolean).length > 0 ? (
              <p className="text-sm text-brand-white/50">
                {[founder.city, founder.state, founder.country].filter(Boolean).join(', ')}
              </p>
            ) : null}
          </div>
        </div>

        {founder.industries?.length || founder.organizations?.length ? (
          <div className="mt-8 space-y-4">
            {founder.industries?.length ? (
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-yellow">
                  Industries
                </h2>
                <ChipList items={founder.industries} />
              </div>
            ) : null}
            {founder.organizations?.length ? (
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-yellow">
                  Organizations
                </h2>
                <ChipList items={founder.organizations} />
              </div>
            ) : null}
          </div>
        ) : null}

        {founder.bio ? (
          <div className="mt-10 border-t border-brand-white/10 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">About</h2>
            <div className="mt-3">
              <CommunityProfileContent content={founder.bio} />
            </div>
          </div>
        ) : null}

        {linkedStartups.length > 0 ? (
          <div className="mt-10 border-t border-brand-white/10 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Startups</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {linkedStartups.map((startup) => {
                const teamEntry = startup.team?.find(
                  (entry) =>
                    entry.founder &&
                    (typeof entry.founder === 'object'
                      ? entry.founder.id === founder.id
                      : entry.founder === founder.id),
                )
                const logo = resolveStartupLogoUrl(startup)

                return (
                  <Link
                    key={startup.id}
                    href={`/startups/${startup.slug}`}
                    className="flex items-start gap-3 rounded-xl border border-brand-white/10 bg-brand-black/60 p-4 transition-colors hover:border-brand-yellow/40"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-white/10">
                      {logo ? (
                        <Image src={logo} alt={startup.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-bold text-brand-yellow">
                          {startup.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-white">{startup.name}</p>
                      {startup.tagline ? (
                        <p className="mt-1 line-clamp-2 text-sm text-brand-white/60">{startup.tagline}</p>
                      ) : null}
                      {teamEntry ? (
                        <p className="mt-1 text-xs text-brand-yellow">{formatTeamRole(teamEntry.role)}</p>
                      ) : null}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : null}

        {socialLinks.length > 0 ? (
          <div className="mt-10 border-t border-brand-white/10 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Links</h2>
            <ul className="mt-3 flex flex-wrap gap-4">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-yellow hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </>
  )
}
