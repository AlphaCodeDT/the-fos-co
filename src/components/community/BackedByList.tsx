import type { Organization } from '@/payload-types'
import { cn } from '@/lib/utils'

type BackedByListProps = {
  organizations: Array<Organization | number>
  className?: string
}

export function BackedByList({ organizations, className }: BackedByListProps) {
  const labels = organizations
    .map((item) => (typeof item === 'object' && item !== null ? item.name : null))
    .filter((name): name is string => Boolean(name))

  if (labels.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex rounded-lg border border-brand-yellow/35 bg-brand-yellow/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-brand-yellow shadow-[0_0_12px_rgba(255,214,0,0.08)]"
        >
          {label}
        </span>
      ))}
    </div>
  )
}

export function BackedBySection({
  organizations,
  className,
}: {
  organizations: Array<Organization | number>
  className?: string
}) {
  if (!organizations.length) return null

  return (
    <div className={className}>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">Backed by</h2>
      <p className="mt-1 text-xs text-brand-white/50">Accelerators &amp; incubators</p>
      <BackedByList organizations={organizations} className="mt-3" />
    </div>
  )
}
