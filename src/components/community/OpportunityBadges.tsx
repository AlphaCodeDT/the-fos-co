import type { Startup } from '@/payload-types'
import { cn } from '@/lib/utils'

type OpportunityBadgesProps = {
  startup: Pick<Startup, 'isHiring' | 'isRaising' | 'isLookingForCoFounder'>
  className?: string
}

const badges = [
  { key: 'isHiring' as const, label: 'Hiring' },
  { key: 'isRaising' as const, label: 'Raising' },
  { key: 'isLookingForCoFounder' as const, label: 'Looking for co-founder' },
]

export function OpportunityBadges({ startup, className }: OpportunityBadgesProps) {
  const active = badges.filter((badge) => startup[badge.key])

  if (active.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {active.map((badge) => (
        <span
          key={badge.key}
          className="inline-flex rounded-full border border-brand-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-white/70"
        >
          {badge.label}
        </span>
      ))}
    </div>
  )
}
