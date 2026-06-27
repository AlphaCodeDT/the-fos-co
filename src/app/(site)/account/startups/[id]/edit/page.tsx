import { notFound } from 'next/navigation'

import { AccountShell } from '@/components/account/AccountShell'
import { EditStartupForm } from '@/components/account/EditStartupForm'
import { requireFounder } from '@/lib/auth/founder'
import { getStartupForOwner, getTaxonomyOptions } from '@/lib/data/account'
import { formatPageTitle } from '@/lib/site'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return { title: formatPageTitle(`Edit startup ${id}`) }
}

export default async function EditStartupPage({ params }: PageProps) {
  const founder = await requireFounder()
  const { id } = await params
  const startupId = Number(id)

  if (!startupId || Number.isNaN(startupId)) {
    notFound()
  }

  const startup = await getStartupForOwner(startupId, founder.id)

  if (!startup) {
    notFound()
  }

  const ownerId = typeof startup.owner === 'object' ? startup.owner?.id : startup.owner

  if (ownerId !== founder.id) {
    notFound()
  }

  const { industries } = await getTaxonomyOptions()

  return (
    <AccountShell
      currentPath="/account/startups"
      title={`Edit ${startup.name}`}
      description="Updates to approved startups stay live while editors re-review your changes."
    >
      <EditStartupForm startup={startup} industries={industries} />
    </AccountShell>
  )
}
