import type { Industry, Organization } from '@/payload-types'
import { cn } from '@/lib/utils'

type ChipListProps = {
  items: Array<Industry | Organization | number>
  className?: string
}

export function ChipList({ items, className }: ChipListProps) {
  const labels = items
    .map((item) => (typeof item === 'object' && item !== null ? item.name : null))
    .filter((name): name is string => Boolean(name))

  if (labels.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex rounded-full border border-brand-white/15 bg-brand-white/5 px-3 py-1 text-xs font-medium text-brand-white/80"
        >
          {label}
        </span>
      ))}
    </div>
  )
}
