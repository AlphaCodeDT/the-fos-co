import { cn } from '@/lib/utils'

type WomenFounderBadgeProps = {
  isWomenFounder?: boolean | null
  className?: string
}

export function WomenFounderBadge({ isWomenFounder, className }: WomenFounderBadgeProps) {
  if (!isWomenFounder) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-brand-white/10 px-2.5 py-0.5 text-xs font-semibold text-brand-white',
        className,
      )}
    >
      Women founder
    </span>
  )
}
