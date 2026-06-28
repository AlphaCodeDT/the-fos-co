import { AccountShell } from '@/components/account/AccountShell'
import { NewStartupForm } from '@/components/account/StartupForm'
import { requireFounder } from '@/lib/auth/founder'
import { getTaxonomyOptions } from '@/lib/data/account'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('Create startup'),
}

export default async function NewStartupPage() {
  const founder = await requireFounder()
  const { industries, organizations } = await getTaxonomyOptions()

  return (
    <AccountShell
      currentPath="/account/startups"
      title="Create startup"
      description="New startups are pending until an editor approves them."
    >
      <NewStartupForm
        industries={industries}
        organizations={organizations}
        currentFounder={founder}
      />
    </AccountShell>
  )
}
