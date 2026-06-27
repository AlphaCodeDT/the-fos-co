import { requireFounder } from '@/lib/auth/founder'
import { AccountSettingsClient } from '@/components/account/SettingsClient'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('Account settings'),
}

export default async function AccountSettingsPage() {
  const founder = await requireFounder()

  return <AccountSettingsClient email={founder.email} />
}
