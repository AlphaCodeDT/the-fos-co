import { cn } from '@/lib/utils'

type WomenLedBadgeProps = {
  womenLed?: boolean | null
  className?: string
}

export function WomenLedBadge({ womenLed, className }: WomenLedBadgeProps) {
  if (!womenLed) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-brand-white/10 px-2.5 py-0.5 text-xs font-semibold text-brand-white',
        className,
      )}
    >
      Women-led
    </span>
  )
}
