import { cn } from '@/lib/utils'

type CohortBadgeProps = {
  cohortName?: string | null
  cohortYear?: number | null
  className?: string
}

export function formatCohortLabel(
  cohortName?: string | null,
  cohortYear?: number | null,
): string | null {
  const name = cohortName?.trim()
  const year = cohortYear ?? null

  if (name && year) return `${name} · ${year}`
  if (year) return String(year)
  if (name) return name
  return null
}

export function CohortBadge({ cohortName, cohortYear, className }: CohortBadgeProps) {
  const label = formatCohortLabel(cohortName, cohortYear)

  if (!label) return null

  return (
    <span
      className={cn(
        'inline-flex rounded-full border border-brand-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-white/70',
        className,
      )}
    >
      {label}
    </span>
  )
}
