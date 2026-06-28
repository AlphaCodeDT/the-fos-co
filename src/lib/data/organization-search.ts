import { resolveOrganizationLogoUrl } from '@/lib/media-image'
import { getPayloadClient } from '@/lib/payload'
import { formatOrganizationChipLabel, formatOrgTypeLabel } from '@/lib/organization-types'
import type { OrgType } from '@/lib/organization-types'
import type { Organization } from '@/payload-types'

export type OrganizationSearchResult = {
  id: number
  name: string
  slug: string
  type: OrgType | null
  logoUrl: string | null
  chipLabel: string
  typeLabel: string
}

function mapDocToSearchResult(org: Organization): OrganizationSearchResult {
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

export async function searchOrganizations(query: string): Promise<OrganizationSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'organizations',
    where: {
      and: [
        { status: { equals: 'published' } },
        { name: { contains: trimmed } },
      ],
    },
    limit: 8,
    depth: 1,
    sort: 'name',
    overrideAccess: true,
  })

  return (result.docs as Organization[]).map(mapDocToSearchResult)
}

export async function validateOrganizationIds(ids: number[]): Promise<number[]> {
  if (ids.length === 0) return []

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'organizations',
    where: { id: { in: ids } },
    limit: ids.length,
    depth: 0,
    overrideAccess: true,
  })

  const validIds = new Set(result.docs.map((doc) => doc.id))
  const invalidIds = ids.filter((id) => !validIds.has(id))

  if (invalidIds.length > 0) {
    throw new Error('One or more selected organizations are invalid.')
  }

  return ids
}
