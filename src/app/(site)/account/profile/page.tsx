import { AccountShell } from '@/components/account/AccountShell'
import { ProfileForm } from '@/components/account/ProfileForm'
import { requireFounder } from '@/lib/auth/founder'
import { getFounderForAccount, getTaxonomyOptions } from '@/lib/data/account'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('My profile'),
}

export default async function AccountProfilePage() {
  const sessionFounder = await requireFounder()
  const founder = (await getFounderForAccount(sessionFounder.id)) ?? sessionFounder
  const { industries } = await getTaxonomyOptions()

  return (
    <AccountShell
      currentPath="/account/profile"
      title="My profile"
      description="Update your public founder profile. Approved profiles stay live while editors re-review your changes."
    >
      <ProfileForm founder={founder} industries={industries} />
    </AccountShell>
  )
}
