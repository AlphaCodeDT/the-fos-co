import { resolveOrganizationLogoUrl } from '@/lib/media-image'
import { formatOrganizationChipLabel, formatOrgTypeLabel } from '@/lib/organization-types'
import type { OrganizationSearchResult } from '@/lib/data/organization-search'
import type { Organization } from '@/payload-types'

export type { OrganizationSearchResult } from '@/lib/data/organization-search'

export function mapOrganizationToSearchResult(
  org: Organization | number,
): OrganizationSearchResult | null {
  if (typeof org !== 'object' || org === null) return null

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    type: org.type ?? null,
    logoUrl: resolveOrganizationLogoUrl(org),
    chipLabel: formatOrganizationChipLabel(org.name, org.type),
    typeLabel: formatOrgTypeLabel(org.type),
  }
}

export function mapOrganizationsToSearchResults(
  organizations: Array<Organization | number> | null | undefined,
): OrganizationSearchResult[] {
  return (organizations || [])
    .map(mapOrganizationToSearchResult)
    .filter((item): item is OrganizationSearchResult => item !== null)
}
