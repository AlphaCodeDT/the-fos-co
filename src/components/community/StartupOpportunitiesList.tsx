import { OPPORTUNITY_TYPE_OPTIONS } from '@/components/account/startup-form-constants'
import type { Startup } from '@/payload-types'

type StartupOpportunitiesListProps = {
  opportunities: Startup['opportunities']
}

function formatOpportunityType(type: NonNullable<Startup['opportunities']>[number]['type']): string {
  return OPPORTUNITY_TYPE_OPTIONS.find((option) => option.value === type)?.label || type
}

export function StartupOpportunitiesList({ opportunities }: StartupOpportunitiesListProps) {
  const rows = (opportunities || []).filter((row) => row.title?.trim())

  if (rows.length === 0) return null

  return (
    <div className="mt-10 border-t border-brand-white/10 pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Opportunities</h2>
      <ul className="mt-4 space-y-4">
        {rows.map((row, index) => (
          <li
            key={`${row.title}-${index}`}
            className="rounded-xl border border-brand-white/10 bg-brand-black/60 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-yellow">
                {formatOpportunityType(row.type)}
              </span>
              {row.link ? (
                <a
                  href={row.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand-white hover:text-brand-yellow"
                >
                  {row.title}
                </a>
              ) : (
                <span className="text-sm font-medium text-brand-white">{row.title}</span>
              )}
            </div>
            {row.description ? (
              <p className="mt-2 text-sm text-brand-white/70">{row.description}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
