import type { Organization } from '@/payload-types'
import { BackedByList } from '@/components/community/BackedByList'
import { ORG_TYPE_GROUP_ORDER, getOrgGroupLabel, type OrgGroupLabel } from '@/lib/organization-types'
import { cn } from '@/lib/utils'

export function GroupedBackedBySection({
  organizations,
  className,
}: {
  organizations: Array<Organization | number>
  className?: string
}) {
  const populated = organizations.filter(
    (item): item is Organization => typeof item === 'object' && item !== null,
  )

  if (populated.length === 0) return null

  const groups = new Map<OrgGroupLabel, Organization[]>()

  for (const org of populated) {
    const label = getOrgGroupLabel(org.type)
    const existing = groups.get(label) ?? []
    existing.push(org)
    groups.set(label, existing)
  }

  const orderedGroups = ORG_TYPE_GROUP_ORDER.filter((label) => groups.has(label))

  return (
    <div className={cn('space-y-4', className)}>
      {orderedGroups.map((label) => (
        <div key={label}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">{label}</h2>
          <BackedByList organizations={groups.get(label) ?? []} className="mt-3" />
        </div>
      ))}
    </div>
  )
}
