import type { ReactNode } from 'react'

import { STARTUP_STAGE_OPTIONS } from '@/components/account/startup-form-constants'
import type { Startup } from '@/payload-types'

type StartupCompanyDetailsProps = {
  startup: Pick<
    Startup,
    'stage' | 'foundedYear' | 'teamSize' | 'fundingStatus' | 'website'
  >
}

function formatStage(stage: Startup['stage']): string | null {
  if (!stage) return null
  return STARTUP_STAGE_OPTIONS.find((option) => option.value === stage)?.label || stage
}

export function StartupCompanyDetails({ startup }: StartupCompanyDetailsProps) {
  const details: Array<{ label: string; value: ReactNode }> = []

  const stage = formatStage(startup.stage)
  if (stage) details.push({ label: 'Stage', value: stage })

  if (startup.foundedYear) {
    details.push({ label: 'Founded', value: String(startup.foundedYear) })
  }

  if (startup.teamSize) {
    details.push({ label: 'Team size', value: String(startup.teamSize) })
  }

  if (startup.fundingStatus?.trim()) {
    details.push({ label: 'Funding status', value: startup.fundingStatus.trim() })
  }

  if (startup.website?.trim()) {
    details.push({
      label: 'Website',
      value: (
        <a
          href={startup.website.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-yellow hover:underline"
        >
          {startup.website.trim()}
        </a>
      ),
    })
  }

  if (details.length === 0) return null

  return (
    <div className="mt-10 border-t border-brand-white/10 pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
        Company details
      </h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {details.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-white/50">{label}</dt>
            <dd className="mt-1 text-sm text-brand-white">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
