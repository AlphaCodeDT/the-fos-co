import Link from 'next/link'

import { AccountShell, StatusCard } from '@/components/account/AccountShell'
import { requireFounder } from '@/lib/auth/founder'
import {
  describeModerationStatus,
  describeVerificationStatus,
  getFounderClaims,
  getFounderStartups,
} from '@/lib/data/account'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('Account overview'),
}

export default async function AccountOverviewPage() {
  const founder = await requireFounder()
  const startups = await getFounderStartups(founder.id)
  const claims = await getFounderClaims(founder.id)

  return (
    <AccountShell
      currentPath="/account"
      title={`Welcome, ${founder.name}`}
      description="Manage your founder profile, startups, and claim requests."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          label="Profile visibility"
          value={describeModerationStatus(founder.moderationStatus)}
          tone={founder.moderationStatus === 'approved' ? 'success' : 'warning'}
        />
        <StatusCard
          label="Verification"
          value={describeVerificationStatus(founder.verificationStatus)}
          tone={founder.verificationStatus === 'verified' ? 'success' : 'default'}
        />
        <StatusCard
          label="Editor re-review"
          value={
            founder.needsReview
              ? 'Your recent edits are queued for editor re-review'
              : 'No pending re-review'
          }
          tone={founder.needsReview ? 'warning' : 'default'}
        />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-brand-white/10 bg-brand-black/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">Startups</p>
          <p className="mt-2 text-3xl font-bold text-brand-white">{startups.length}</p>
          <Link href="/account/startups" className="mt-3 inline-block text-sm text-brand-yellow hover:underline">
            Manage startups
          </Link>
        </div>
        <div className="rounded-2xl border border-brand-white/10 bg-brand-black/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">Claims</p>
          <p className="mt-2 text-3xl font-bold text-brand-white">{claims.length}</p>
          <Link href="/account/claims" className="mt-3 inline-block text-sm text-brand-yellow hover:underline">
            View claims
          </Link>
        </div>
      </div>

      {founder.moderationStatus === 'approved' ? (
        <p className="mt-8 text-sm text-brand-white/60">
          Your public profile:{' '}
          <Link href={`/founders/${founder.slug}`} className="text-brand-yellow hover:underline">
            /founders/{founder.slug}
          </Link>
        </p>
      ) : null}
    </AccountShell>
  )
}
