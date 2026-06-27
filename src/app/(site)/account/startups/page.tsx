import Link from 'next/link'

import { AccountShell } from '@/components/account/AccountShell'
import { requireFounder } from '@/lib/auth/founder'
import { describeModerationStatus, getFounderStartups } from '@/lib/data/account'
import { formatPageTitle } from '@/lib/site'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: formatPageTitle('My startups'),
}

export default async function AccountStartupsPage() {
  const founder = await requireFounder()
  const startups = await getFounderStartups(founder.id)

  return (
    <AccountShell
      currentPath="/account/startups"
      title="My startups"
      description="Startups you own or have claimed. New and edited startups stay private until approved."
    >
      <div className="mb-6">
        <Button asChild>
          <Link href="/account/startups/new">Create startup</Link>
        </Button>
      </div>

      {startups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-white/20 p-8 text-center text-brand-white/60">
          You don&apos;t have any startups yet. Create one or claim an existing profile from the directory.
        </div>
      ) : (
        <ul className="space-y-3">
          {startups.map((startup) => {
            const isOwner =
              typeof startup.owner === 'object'
                ? startup.owner?.id === founder.id
                : startup.owner === founder.id

            return (
              <li
                key={startup.id}
                className="flex flex-col gap-3 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-brand-white">{startup.name}</p>
                  <p className="mt-1 text-sm text-brand-white/60">
                    {describeModerationStatus(startup.moderationStatus)}
                    {startup.needsReview ? ' · Needs re-review' : ''}
                    {!isOwner ? ' · Claimed' : ''}
                  </p>
                </div>
                <div className="flex gap-3">
                  {isOwner ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/account/startups/${startup.id}/edit`}>Edit</Link>
                    </Button>
                  ) : null}
                  {startup.moderationStatus === 'approved' ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/startups/${startup.slug}`}>View public</Link>
                    </Button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </AccountShell>
  )
}
