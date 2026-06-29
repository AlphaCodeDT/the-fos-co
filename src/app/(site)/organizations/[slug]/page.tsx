import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FounderCard } from '@/components/community/FounderCard'
import { ProgramCard } from '@/components/community/ProgramCard'
import { StartupCard } from '@/components/community/StartupCard'
import { SiteFooter } from '@/components/layout/site-chrome'
import { SiteHeader } from '@/components/layout/SiteHeader'
import {
  getFoundersForOrganization,
  getOrganizationBySlug,
  getStartupsForOrganization,
} from '@/lib/data/community'
import { getUpcomingProgramsForOrganization } from '@/lib/data/programs'
import { resolveOrganizationLogoUrl } from '@/lib/media-image'
import { formatOrgTypeLabel } from '@/lib/organization-types'
import { formatPageTitle } from '@/lib/site'
import { absoluteUrl } from '@/lib/url'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const organization = await getOrganizationBySlug(slug)

  if (!organization) {
    return {
      title: formatPageTitle('Organization not found'),
      robots: { index: false, follow: false },
    }
  }

  return {
    title: formatPageTitle(organization.name),
    description: organization.description || `${organization.name} on Founders of Startups.`,
    alternates: {
      canonical: absoluteUrl(`/organizations/${organization.slug}`),
    },
  }
}

export default async function OrganizationProfilePage({ params }: PageProps) {
  const { slug } = await params
  const organization = await getOrganizationBySlug(slug)

  if (!organization) notFound()

  const [foundersResult, startupsResult, programs] = await Promise.all([
    getFoundersForOrganization(organization.id),
    getStartupsForOrganization(organization.id),
    getUpcomingProgramsForOrganization(organization.id),
  ])

  const logoUrl = resolveOrganizationLogoUrl(organization)
  const founders = foundersResult.docs
  const startups = startupsResult.docs

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {logoUrl ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-brand-white/10 bg-brand-white/5">
              <Image src={logoUrl} alt="" fill className="object-cover" sizes="96px" priority />
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-brand-white/10 bg-brand-white/5 text-3xl font-bold text-brand-yellow">
              {organization.name.charAt(0)}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold break-words text-brand-white sm:text-4xl">{organization.name}</h1>
              <span className="rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-yellow">
                {formatOrgTypeLabel(organization.type)}
              </span>
            </div>

            {organization.location ? (
              <p className="text-sm text-brand-white/50">{organization.location}</p>
            ) : null}

            {organization.website ? (
              <p>
                <Link
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-yellow hover:underline"
                >
                  {organization.website.replace(/^https?:\/\//, '')}
                </Link>
              </p>
            ) : null}

            {organization.description ? (
              <p className="max-w-2xl text-brand-white/70">{organization.description}</p>
            ) : null}
          </div>
        </div>

        {founders.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">Founders</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {founders.map((founder) => (
                <FounderCard key={founder.id} founder={founder} />
              ))}
            </div>
          </section>
        ) : null}

        {startups.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">Startups</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {startups.map((startup) => (
                <StartupCard key={startup.id} startup={startup} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">
            Cohorts &amp; Programs
          </h2>
          {programs.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} variant="compact" />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-brand-white/50">No upcoming programs.</p>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
