import { AccountShell } from '@/components/account/AccountShell'
import { NewStartupForm } from '@/components/account/StartupForm'
import { getTaxonomyOptions } from '@/lib/data/account'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('Create startup'),
}

export default async function NewStartupPage() {
  const { industries } = await getTaxonomyOptions()

  return (
    <AccountShell
      currentPath="/account/startups"
      title="Create startup"
      description="New startups are pending until an editor approves them."
    >
      <NewStartupForm industries={industries} />
    </AccountShell>
  )
}
