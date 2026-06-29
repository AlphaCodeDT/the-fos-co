import { showVerifiedBadge, type CommunityTrustFields } from '@/lib/trust'
import { cn } from '@/lib/utils'

type TrustBadgeProps = CommunityTrustFields & {
  className?: string
  /** Founder profile only — e.g. "NSRCEL" or "Manual". Cards use plain ✓ Verified. */
  sourceLabel?: string | null
}

export function TrustBadge({ className, sourceLabel, ...record }: TrustBadgeProps) {
  if (!showVerifiedBadge(record)) return null

  const label = sourceLabel ? `✓ Verified · ${sourceLabel}` : '✓ Verified'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-brand-yellow/15 px-2.5 py-0.5 text-xs font-semibold text-brand-yellow',
        className,
      )}
    >
      {label}
    </span>
  )
}
