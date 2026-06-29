import type { Metadata } from 'next'

import { ProgramCard } from '@/components/community/ProgramCard'
import { SiteFooter } from '@/components/layout/site-chrome'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { getAllUpcomingPrograms } from '@/lib/data/programs'
import { absoluteUrl } from '@/lib/url'

export const metadata: Metadata = {
  title: 'Programs',
  description: 'Upcoming cohorts and programs from ecosystem organizations.',
  alternates: {
    canonical: absoluteUrl('/programs'),
  },
}

export const revalidate = 60

export default async function ProgramsDirectoryPage() {
  const programs = await getAllUpcomingPrograms()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-12">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Community</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-white sm:text-4xl">Programs</h1>
          <p className="mt-3 max-w-2xl text-brand-white/70">
            Upcoming cohorts and accelerator programs from organizations in the ecosystem.
          </p>
        </div>

        <p className="mb-6 text-sm text-brand-white/60">
          {programs.length} {programs.length === 1 ? 'program' : 'programs'}
        </p>

        {programs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} variant="directory" />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-brand-white/20 p-8 text-brand-white/60">
            No upcoming programs.
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
