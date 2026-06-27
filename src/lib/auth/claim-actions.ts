'use server'

import { getCurrentFounder } from '@/lib/auth/founder'
import { notifyClaimSubmitted } from '@/lib/email/notify'
import { getPayloadClient } from '@/lib/payload'
import type { Founder, Startup } from '@/payload-types'

export type ClaimActionState = {
  error?: string
  success?: string
}

export async function submitClaimAction(
  _prev: ClaimActionState,
  formData: FormData,
): Promise<ClaimActionState> {
  const startupId = Number(formData.get('startupId'))

  if (!startupId || Number.isNaN(startupId)) {
    return { error: 'Invalid startup.' }
  }

  const founder = await getCurrentFounder()

  if (!founder) {
    return { error: 'You must be signed in to claim a startup.' }
  }

  try {
    const payload = await getPayloadClient()

    const startup = (await payload.findByID({
      collection: 'startups',
      id: startupId,
      depth: 0,
      overrideAccess: true,
    })) as Startup

    if (startup.moderationStatus !== 'approved') {
      return { error: 'This startup is not available to claim.' }
    }

    const claimStatus = startup.claim?.claimStatus || 'unclaimed'

    if (claimStatus === 'claimed') {
      return { error: 'This startup has already been claimed.' }
    }

    if (claimStatus === 'pending') {
      const claimedBy =
        typeof startup.claim?.claimedBy === 'object'
          ? startup.claim.claimedBy?.id
          : startup.claim?.claimedBy

      if (claimedBy === founder.id) {
        return { success: 'Your claim is already under review.' }
      }

      return { error: 'Another founder has already submitted a claim for this startup.' }
    }

    const updated = (await payload.update({
      collection: 'startups',
      id: startupId,
      overrideAccess: true,
      data: {
        claim: {
          claimStatus: 'pending',
          claimedBy: founder.id,
          claimedAt: new Date().toISOString(),
        },
      },
    })) as Startup

    try {
      await notifyClaimSubmitted(updated, founder as Founder)
    } catch (error) {
      console.error('Failed to notify editors of claim:', error)
    }

    return { success: 'Claim submitted. An editor will review your request.' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not submit claim.'
    return { error: message }
  }
}
