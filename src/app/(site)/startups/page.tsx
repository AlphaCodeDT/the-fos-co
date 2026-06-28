import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { CommunityFilterBar } from '@/components/community/CommunityFilterBar'
import { DirectoryPagination } from '@/components/community/DirectoryPagination'
import { StartupCard } from '@/components/community/StartupCard'
import { SiteFooter } from '@/components/layout/site-chrome'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { parseStartupSearchParams } from '@/lib/community-filters'
import {
  getDirectoryLocationFilters,
  getFilterIndustries,
  getFilterOrganizations,
  getStartups,
} from '@/lib/data/community'
import { absoluteUrl } from '@/lib/url'

export const metadata: Metadata = {
  title: 'Startups',
  description: 'Browse approved startups in the ecosystem.',
  alternates: {
    canonical: absoluteUrl('/startups'),
  },
}

export const revalidate = 60

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function StartupsDirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { filters, page } = parseStartupSearchParams(params)

  const [startupsResult, industriesResult, organizationsResult, locationFilters] = await Promise.all([
    getStartups({ filters, page, limit: 24 }),
    getFilterIndustries(),
    getFilterOrganizations(),
    getDirectoryLocationFilters('startups'),
  ])

  const { docs: startups, totalDocs, totalPages, page: currentPage } = startupsResult

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-12">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Community</p>
          <h1 className="mt-2 text-4xl font-bold text-brand-white">Startups</h1>
          <p className="mt-3 max-w-2xl text-brand-white/70">
            Explore approved startups — filter by industry, organization, and opportunity signals.
          </p>
        </div>

        <Suspense fallback={<div className="mb-8 h-40 rounded-2xl border border-brand-white/10" />}>
          <CommunityFilterBar
            variant="startups"
            industries={industriesResult.docs}
            organizations={organizationsResult.docs}
            locationFilters={locationFilters}
            className="mb-8"
          />
        </Suspense>

        <p className="mb-6 text-sm text-brand-white/60">
          {totalDocs} {totalDocs === 1 ? 'startup' : 'startups'}
        </p>

        {startups.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {startups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-brand-white/20 p-8 text-brand-white/60">
            No startups match your filters.{' '}
            <Link href="/startups" className="text-brand-yellow hover:underline">
              Clear filters
            </Link>
          </p>
        )}

        <DirectoryPagination
          basePath="/startups"
          currentParams={params}
          page={currentPage ?? page}
          totalPages={totalPages}
        />
      </main>
      <SiteFooter />
    </>
  )
}
