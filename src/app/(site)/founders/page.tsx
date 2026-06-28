import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { CommunityFilterBar } from '@/components/community/CommunityFilterBar'
import { DirectoryPagination } from '@/components/community/DirectoryPagination'
import { FounderCard } from '@/components/community/FounderCard'
import { SiteFooter } from '@/components/layout/site-chrome'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { parseFounderSearchParams } from '@/lib/community-filters'
import {
  getDirectoryLocationFilters,
  getFilterIndustries,
  getFilterOrganizations,
  getFounders,
} from '@/lib/data/community'
import { absoluteUrl } from '@/lib/url'

export const metadata: Metadata = {
  title: 'Founders',
  description: 'Browse approved founders in the startup ecosystem.',
  alternates: {
    canonical: absoluteUrl('/founders'),
  },
}

export const revalidate = 60

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function FoundersDirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { filters, page } = parseFounderSearchParams(params)

  const [foundersResult, industriesResult, organizationsResult, locationFilters] = await Promise.all([
    getFounders({ filters, page, limit: 24 }),
    getFilterIndustries(),
    getFilterOrganizations(),
    getDirectoryLocationFilters('founders'),
  ])

  const { docs: founders, totalDocs, totalPages, page: currentPage } = foundersResult

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-12">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Community</p>
          <h1 className="mt-2 text-4xl font-bold text-brand-white">Founders</h1>
          <p className="mt-3 max-w-2xl text-brand-white/70">
            Discover approved founders building across industries and organizations.
          </p>
        </div>

        <Suspense fallback={<div className="mb-8 h-40 rounded-2xl border border-brand-white/10" />}>
          <CommunityFilterBar
            variant="founders"
            industries={industriesResult.docs}
            organizations={organizationsResult.docs}
            locationFilters={locationFilters}
            className="mb-8"
          />
        </Suspense>

        <p className="mb-6 text-sm text-brand-white/60">
          {totalDocs} {totalDocs === 1 ? 'founder' : 'founders'}
        </p>

        {founders.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {founders.map((founder) => (
              <FounderCard key={founder.id} founder={founder} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-brand-white/20 p-8 text-brand-white/60">
            No founders match your filters.{' '}
            <Link href="/founders" className="text-brand-yellow hover:underline">
              Clear filters
            </Link>
          </p>
        )}

        <DirectoryPagination
          basePath="/founders"
          currentParams={params}
          page={currentPage ?? page}
          totalPages={totalPages}
        />
      </main>
      <SiteFooter />
    </>
  )
}
