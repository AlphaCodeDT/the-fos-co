import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  formatProgramDateRange,
  formatProgramMode,
  resolveProgramOrganization,
} from '@/lib/data/programs'
import { isHttpOrHttpsUrl } from '@/lib/url'
import type { Program } from '@/payload-types'

type ProgramCardProps = {
  program: Program
  variant?: 'compact' | 'directory'
}

export function ProgramCard({ program, variant = 'compact' }: ProgramCardProps) {
  const dateRange = formatProgramDateRange(program.startDate, program.endDate)
  const mode = formatProgramMode(program.mode)
  const modeLocation = [mode, program.location].filter(Boolean).join(' · ')
  const applyUrl = isHttpOrHttpsUrl(program.applicationUrl) ? program.applicationUrl!.trim() : null
  const organization = resolveProgramOrganization(program.organization)

  return (
    <article className="flex h-full flex-col rounded-xl border border-brand-white/10 bg-brand-black/60 p-4">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-brand-white">
              <Link href={`/programs/${program.slug}`} className="hover:text-brand-yellow">
                {program.name}
              </Link>
            </h3>
            {variant === 'directory' && organization ? (
              <p className="mt-1 text-xs text-brand-white/50">
                <Link href={`/organizations/${organization.slug}`} className="hover:text-brand-yellow">
                  {organization.name}
                </Link>
              </p>
            ) : null}
            {program.cohort ? (
              <p className="mt-1 text-xs text-brand-yellow">{program.cohort}</p>
            ) : null}
          </div>
          {applyUrl ? (
            <Button asChild size="sm" className="shrink-0">
              <a href={applyUrl} target="_blank" rel="noopener noreferrer">
                Apply
              </a>
            </Button>
          ) : null}
        </div>

        {dateRange ? <p className="text-xs text-brand-white/60">{dateRange}</p> : null}
        {modeLocation ? <p className="text-xs text-brand-white/50">{modeLocation}</p> : null}
      </div>

      <div className="mt-4">
        <Link
          href={`/programs/${program.slug}`}
          className="text-xs font-medium text-brand-yellow hover:underline"
        >
          Details
        </Link>
      </div>
    </article>
  )
}
