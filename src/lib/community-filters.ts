import type { Where } from 'payload'

import { approvedCommunityWhere } from '@/lib/queries'

export type FounderFilters = {
  industrySlug?: string
  organizationSlug?: string
  verifiedOnly?: boolean
  query?: string
}

export type StartupFilters = {
  industrySlug?: string
  organizationSlug?: string
  verifiedOnly?: boolean
  womenLed?: boolean
  isHiring?: boolean
  isRaising?: boolean
  isLookingForCoFounder?: boolean
  query?: string
}

type SearchParams = Record<string, string | string[] | undefined>

function getParam(params: SearchParams, key: string): string | undefined {
  const value = params[key]
  if (Array.isArray(value)) return value[0]
  return value || undefined
}

function isTruthyParam(value: string | undefined): boolean {
  return value === '1' || value === 'true'
}

export function parseFounderSearchParams(params: SearchParams): {
  filters: FounderFilters
  page: number
} {
  const page = Math.max(1, Number.parseInt(getParam(params, 'page') || '1', 10) || 1)

  return {
    page,
    filters: {
      industrySlug: getParam(params, 'industry'),
      organizationSlug: getParam(params, 'organization'),
      verifiedOnly: isTruthyParam(getParam(params, 'verified')),
      query: getParam(params, 'q')?.trim() || undefined,
    },
  }
}

export function parseStartupSearchParams(params: SearchParams): {
  filters: StartupFilters
  page: number
} {
  const page = Math.max(1, Number.parseInt(getParam(params, 'page') || '1', 10) || 1)

  return {
    page,
    filters: {
      industrySlug: getParam(params, 'industry'),
      organizationSlug: getParam(params, 'organization'),
      verifiedOnly: isTruthyParam(getParam(params, 'verified')),
      womenLed: isTruthyParam(getParam(params, 'womenLed')),
      isHiring: isTruthyParam(getParam(params, 'hiring')),
      isRaising: isTruthyParam(getParam(params, 'raising')),
      isLookingForCoFounder: isTruthyParam(getParam(params, 'cofounder')),
      query: getParam(params, 'q')?.trim() || undefined,
    },
  }
}

export function buildFounderWhere(
  filters: FounderFilters,
  resolved: { industryId?: number; organizationId?: number },
): Where {
  const clauses: Where[] = [approvedCommunityWhere]

  if (resolved.industryId) {
    clauses.push({ industries: { contains: resolved.industryId } })
  }

  if (resolved.organizationId) {
    clauses.push({ organizations: { contains: resolved.organizationId } })
  }

  if (filters.verifiedOnly) {
    clauses.push({ verificationStatus: { equals: 'verified' } })
  }

  if (filters.query) {
    clauses.push({ name: { contains: filters.query } })
  }

  return clauses.length === 1 ? clauses[0] : { and: clauses }
}

export function buildStartupWhere(
  filters: StartupFilters,
  resolved: { industryId?: number; organizationId?: number },
): Where {
  const clauses: Where[] = [approvedCommunityWhere]

  if (resolved.industryId) {
    clauses.push({ industry: { equals: resolved.industryId } })
  }

  if (resolved.organizationId) {
    clauses.push({ organizations: { contains: resolved.organizationId } })
  }

  if (filters.verifiedOnly) {
    clauses.push({ verificationStatus: { equals: 'verified' } })
  }

  if (filters.womenLed) {
    clauses.push({ womenLed: { equals: true } })
  }

  if (filters.isHiring) {
    clauses.push({ isHiring: { equals: true } })
  }

  if (filters.isRaising) {
    clauses.push({ isRaising: { equals: true } })
  }

  if (filters.isLookingForCoFounder) {
    clauses.push({ isLookingForCoFounder: { equals: true } })
  }

  if (filters.query) {
    clauses.push({ name: { contains: filters.query } })
  }

  return clauses.length === 1 ? clauses[0] : { and: clauses }
}

export function buildDirectorySearchParams(
  basePath: string,
  current: SearchParams,
  updates: Record<string, string | null>,
): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(current)) {
    if (key === 'page') continue
    const normalized = Array.isArray(value) ? value[0] : value
    if (normalized) params.set(key, normalized)
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
  }

  params.delete('page')

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}
