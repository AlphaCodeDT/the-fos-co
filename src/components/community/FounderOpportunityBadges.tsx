import type { Founder } from '@/payload-types'
import { cn } from '@/lib/utils'

type FounderOpportunityBadgesProps = {
  founder: Pick<Founder, 'lookingForCoFounder' | 'openToOpportunities'>
  className?: string
}

const badges = [
  { key: 'lookingForCoFounder' as const, label: 'Looking for co-founder' },
  { key: 'openToOpportunities' as const, label: 'Open to opportunities' },
]

export function FounderOpportunityBadges({ founder, className }: FounderOpportunityBadgesProps) {
  const active = badges.filter((badge) => founder[badge.key])

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
