'use client'

import { useActionState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { submitClaimAction, type ClaimActionState } from '@/lib/auth/claim-actions'

const initialState: ClaimActionState = {}

export function ClaimStartupButton({
  startupId,
  startupName,
  isAuthenticated,
  startupSlug,
  claimStatus,
  claimantId,
  currentFounderId,
}: {
  startupId: number
  startupName: string
  isAuthenticated: boolean
  startupSlug: string
  claimStatus?: 'unclaimed' | 'pending' | 'claimed' | null
  claimantId?: number | null
  currentFounderId?: number | null
}) {
  const [state, action, pending] = useActionState(submitClaimAction, initialState)

  if (claimStatus === 'claimed') {
    return null
  }

  if (claimStatus === 'pending') {
    if (currentFounderId && claimantId === currentFounderId) {
      return (
        <div className="mt-10 rounded-2xl border border-brand-yellow/30 bg-brand-yellow/5 p-5">
          <p className="text-sm font-medium text-brand-yellow">Claim under review</p>
          <p className="mt-1 text-sm text-brand-white/70">
            Your claim for {startupName} is pending editor approval.
          </p>
        </div>
      )
    }

    return (
      <div className="mt-10 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-5">
        <p className="text-sm text-brand-white/70">A claim for this startup is already under review.</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-10 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-5">
        <p className="text-sm text-brand-white/70">Are you a founder of {startupName}?</p>
        <Button asChild className="mt-4">
          <Link href={`/login?redirect=${encodeURIComponent(`/startups/${startupSlug}`)}`}>
            Sign in to claim this startup
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-10 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-5">
      <p className="text-sm text-brand-white/70">Are you a founder of {startupName}?</p>
      {state.error ? <p className="mt-2 text-sm text-red-300">{state.error}</p> : null}
      {state.success ? <p className="mt-2 text-sm text-brand-yellow">{state.success}</p> : null}
      <form action={action} className="mt-4">
        <input type="hidden" name="startupId" value={startupId} />
        <Button type="submit" disabled={pending}>
          {pending ? 'Submitting…' : 'Claim this startup'}
        </Button>
      </form>
    </div>
  )
}
