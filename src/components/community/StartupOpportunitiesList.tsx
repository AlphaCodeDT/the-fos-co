import { OPPORTUNITY_TYPE_OPTIONS } from '@/components/account/startup-form-constants'
import { Button } from '@/components/ui/button'
import type { Startup } from '@/payload-types'

type StartupOpportunitiesListProps = {
  opportunities: Startup['opportunities']
}

function formatOpportunityType(type: NonNullable<Startup['opportunities']>[number]['type']): string {
  return OPPORTUNITY_TYPE_OPTIONS.find((option) => option.value === type)?.label || type
}

function isHttpOrHttpsUrl(raw?: string | null): boolean {
  const trimmed = raw?.trim()
  if (!trimmed) return false

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function StartupOpportunitiesList({ opportunities }: StartupOpportunitiesListProps) {
  const rows = (opportunities || []).filter((row) => row.title?.trim())

  if (rows.length === 0) return null

  return (
    <div className="mt-10 border-t border-brand-white/10 pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Opportunities</h2>
      <ul className="mt-4 space-y-4">
        {rows.map((row, index) => {
          const applyUrl = isHttpOrHttpsUrl(row.link) ? row.link!.trim() : null

          return (
            <li
              key={`${row.title}-${index}`}
              className="rounded-xl border border-brand-white/10 bg-brand-black/60 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-yellow">
                      {formatOpportunityType(row.type)}
                    </span>
                    <span className="text-sm font-medium text-brand-white">{row.title}</span>
                  </div>
                  {row.description ? (
                    <p className="mt-2 text-sm text-brand-white/70">{row.description}</p>
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
            </li>
          )
        })}
      </ul>
    </div>
  )
}
