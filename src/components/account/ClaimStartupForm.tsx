'use client'

import { useActionState, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { submitClaimAction, type ClaimActionState } from '@/lib/auth/claim-actions'

const initialState: ClaimActionState = {}

type ClaimStartupFormProps = {
  startupId: number
  onSuccess?: () => void
  size?: 'default' | 'sm'
}

export function ClaimStartupForm({ startupId, onSuccess, size = 'default' }: ClaimStartupFormProps) {
  const [state, action, pending] = useActionState(submitClaimAction, initialState)
  const handledSuccess = useRef<string | null>(null)

  useEffect(() => {
    if (!state.success || !onSuccess) return
    if (handledSuccess.current === state.success) return
    handledSuccess.current = state.success
    onSuccess()
  }, [state.success, onSuccess])

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="startupId" value={startupId} />
      {state.error ? <p className="text-xs text-red-300">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-brand-yellow">{state.success}</p> : null}
      {!state.success ? (
        <Button type="submit" size={size} disabled={pending}>
          {pending ? 'Submitting…' : 'Claim'}
        </Button>
      ) : null}
    </form>
  )
}
