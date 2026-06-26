import { showVerifiedBadge, type CommunityTrustFields } from '@/lib/trust'
import { cn } from '@/lib/utils'

type TrustBadgeProps = CommunityTrustFields & {
  className?: string
}

export function TrustBadge({ className, ...record }: TrustBadgeProps) {
  if (!showVerifiedBadge(record)) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-brand-yellow/15 px-2.5 py-0.5 text-xs font-semibold text-brand-yellow',
        className,
      )}
    >
      ✓ Verified
    </span>
  )
}
