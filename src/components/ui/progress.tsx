import * as React from 'react'

import { cn } from '@/lib/utils'

type ProgressProps = {
  value?: number
  indeterminate?: boolean
  className?: string
}

export function Progress({ value = 0, indeterminate = false, className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : clamped}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-brand-white/10', className)}
    >
      {indeterminate ? (
        <div className="h-full w-full animate-pulse rounded-full bg-brand-yellow/80" />
      ) : (
        <div
          className="h-full rounded-full bg-brand-yellow transition-[width] duration-150 ease-out"
          style={{ width: `${clamped}%` }}
        />
      )}
    </div>
  )
}
