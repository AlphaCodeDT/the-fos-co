'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AccountSubmitButtonProps = {
  pending: boolean
  idleLabel: string
  pendingLabel: string
  className?: string
}

function SubmitSpinner() {
  return (
    <span
      className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  )
}

export function AccountSubmitButton({
  pending,
  idleLabel,
  pendingLabel,
  className,
}: AccountSubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending} className={cn(className)}>
      {pending ? (
        <>
          <SubmitSpinner />
          {pendingLabel}
        </>
      ) : (
        idleLabel
      )}
    </Button>
  )
}
