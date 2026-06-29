import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { SiteFooter } from '@/components/layout/site-chrome'
import { SiteHeader } from '@/components/layout/SiteHeader'
import {
  formatProgramDate,
  formatProgramDateRange,
  formatProgramMode,
  getProgramBySlug,
  resolveProgramOrganization,
} from '@/lib/data/programs'
import { formatPageTitle } from '@/lib/site'
import { absoluteUrl, isHttpOrHttpsUrl } from '@/lib/url'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const program = await getProgramBySlug(slug)

  if (!program) {
    return {
      title: formatPageTitle('Program not found'),
      robots: { index: false, follow: false },
    }
  }

  return {
    title: formatPageTitle(program.name),
    description: program.description || `${program.name} on Founders of Startups.`,
    alternates: {
      canonical: absoluteUrl(`/programs/${program.slug}`),
    },
  }
}

export default async function ProgramProfilePage({ params }: PageProps) {
  const { slug } = await params
  const program = await getProgramBySlug(slug)

  if (!program) notFound()

  const organization = resolveProgramOrganization(program.organization)
  const dateRange = formatProgramDateRange(program.startDate, program.endDate)
  const applicationDeadline = formatProgramDate(program.applicationDeadline)
  const mode = formatProgramMode(program.mode)
  const applyUrl = isHttpOrHttpsUrl(program.applicationUrl) ? program.applicationUrl!.trim() : null

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold break-words text-brand-white sm:text-4xl">{program.name}</h1>

              {organization ? (
                <p className="text-sm text-brand-white/60">
                  by{' '}
                  <Link
                    href={`/organizations/${organization.slug}`}
                    className="text-brand-yellow hover:underline"
                  >
                    {organization.name}
                  </Link>
                </p>
              ) : null}

              {program.cohort ? (
                <span className="inline-flex rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-yellow">
                  {program.cohort}
                </span>
              ) : null}
            </div>

            {applyUrl ? (
              <Button asChild size="sm" className="w-full shrink-0 sm:w-auto">
                <a href={applyUrl} target="_blank" rel="noopener noreferrer">
                  Apply
                </a>
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-brand-white/60">
            {dateRange ? (
              <span>
                {program.startDate ? (
                  <time dateTime={program.startDate}>{dateRange}</time>
                ) : program.endDate ? (
                  <time dateTime={program.endDate}>{dateRange}</time>
                ) : (
                  dateRange
                )}
              </span>
            ) : null}
            {applicationDeadline && program.applicationDeadline ? (
              <span>
                Apply by{' '}
                <time dateTime={program.applicationDeadline}>{applicationDeadline}</time>
              </span>
            ) : null}
            {mode ? <span>{mode}</span> : null}
            {program.location ? <span>{program.location}</span> : null}
          </div>

          {program.description ? (
            <p className="max-w-2xl text-brand-white/70">{program.description}</p>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
