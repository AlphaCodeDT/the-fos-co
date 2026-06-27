import { AccountShell } from '@/components/account/AccountShell'
import { requireFounder } from '@/lib/auth/founder'
import { describeClaimStatus, getFounderClaims } from '@/lib/data/account'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('Claims'),
}

export default async function AccountClaimsPage() {
  const founder = await requireFounder()
  const claims = await getFounderClaims(founder.id)

  return (
    <AccountShell
      currentPath="/account/claims"
      title="Claims"
      description="Track startup claim requests you have submitted."
    >
      {claims.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-white/20 p-8 text-center text-brand-white/60">
          You haven&apos;t submitted any startup claims yet. Browse startups and claim an unclaimed profile.
        </div>
      ) : (
        <ul className="space-y-3">
          {claims.map((startup) => (
            <li
              key={startup.id}
              className="rounded-2xl border border-brand-white/10 bg-brand-black/60 p-5"
            >
              <p className="font-semibold text-brand-white">{startup.name}</p>
              <p className="mt-1 text-sm text-brand-white/60">
                {describeClaimStatus(startup.claim?.claimStatus)}
              </p>
              {startup.claim?.claimedAt ? (
                <p className="mt-1 text-xs text-brand-white/40">
                  Submitted {new Date(startup.claim.claimedAt).toLocaleDateString()}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  )
}
