import Image from 'next/image'
import Link from 'next/link'

import type { Organization } from '@/payload-types'
import { resolveOrganizationLogoUrl } from '@/lib/media-image'
import { cn } from '@/lib/utils'

type BackedByListProps = {
  organizations: Array<Organization | number>
  className?: string
  /** When false, render non-link chips (e.g. inside a card that is already a link). */
  asLink?: boolean
}

function OrganizationChip({ org, asLink = true }: { org: Organization; asLink?: boolean }) {
  const logoUrl = resolveOrganizationLogoUrl(org)
  const content = (
    <>
      {logoUrl ? (
        <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded">
          <Image src={logoUrl} alt="" fill className="object-cover" sizes="16px" />
        </span>
      ) : (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-brand-white/10 text-[10px] font-semibold text-brand-yellow">
          {org.name.charAt(0)}
        </span>
      )}
      <span>{org.name}</span>
    </>
  )

  const className =
    'inline-flex items-center gap-2 rounded-lg border border-brand-yellow/35 bg-brand-yellow/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-brand-yellow shadow-[0_0_12px_rgba(255,214,0,0.08)] transition-colors hover:border-brand-yellow/50'

  if (org.slug && asLink) {
    return (
      <Link href={`/organizations/${org.slug}`} className={className}>
        {content}
      </Link>
    )
  }

  return <span className={className}>{content}</span>
}

export function BackedByList({ organizations, className, asLink = true }: BackedByListProps) {
  const populated = organizations.filter(
    (item): item is Organization => typeof item === 'object' && item !== null,
  )

  if (populated.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {populated.map((org) => (
        <OrganizationChip key={org.id} org={org} asLink={asLink} />
      ))}
    </div>
  )
}

export function BackedBySection({
  organizations,
  className,
}: {
  organizations: Array<Organization | number>
  className?: string
}) {
  if (!organizations.length) return null

  return (
    <div className={className}>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">Backed by</h2>
      <p className="mt-1 text-xs text-brand-white/50">Accelerators &amp; incubators</p>
      <BackedByList organizations={organizations} className="mt-3" />
    </div>
  )
}
