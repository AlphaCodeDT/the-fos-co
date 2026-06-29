import type { Where } from 'payload'

import type { Founder } from '@/payload-types'
import { approvedCommunityWhere } from '@/lib/queries'

export const WOMAN_FOUNDER_GENDER = 'female' as const

export function isWomenFounderFromGender(gender: Founder['gender']): boolean {
  return gender === WOMAN_FOUNDER_GENDER
}

export type FounderFilters = {
  industrySlug?: string
  organizationSlug?: string
  verifiedOnly?: boolean
  womenFounders?: boolean
  openToOpportunities?: boolean
  lookingForCoFounder?: boolean
  query?: string
  state?: string
  city?: string
  cohortYear?: number
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
  state?: string
  city?: string
  cohortYear?: number
}

export type DirectoryLocationFilters = {
  states: string[]
  citiesByState: Record<string, string[]>
  cohortYears: number[]
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

function parseCohortYearParam(value: string | undefined): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

function parseLocationFilters(params: SearchParams) {
  return {
    state: getParam(params, 'state')?.trim() || undefined,
    city: getParam(params, 'city')?.trim() || undefined,
    cohortYear: parseCohortYearParam(getParam(params, 'cohort')),
  }
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
      womenFounders: isTruthyParam(getParam(params, 'women')),
      openToOpportunities: isTruthyParam(getParam(params, 'open')),
      lookingForCoFounder: isTruthyParam(getParam(params, 'cofounder')),
      query: getParam(params, 'q')?.trim() || undefined,
      ...parseLocationFilters(params),
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
      ...parseLocationFilters(params),
    },
  }
}

function appendLocationFilters(clauses: Where[], filters: FounderFilters | StartupFilters) {
  if (filters.state) {
    clauses.push({ state: { equals: filters.state } })
  }

  if (filters.city) {
    clauses.push({ city: { equals: filters.city } })
  }

  if (filters.cohortYear) {
    clauses.push({ cohortYear: { equals: filters.cohortYear } })
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

  if (filters.womenFounders) {
    clauses.push({ gender: { equals: WOMAN_FOUNDER_GENDER } })
  }

  if (filters.openToOpportunities) {
    clauses.push({ openToOpportunities: { equals: true } })
  }

  if (filters.lookingForCoFounder) {
    clauses.push({ lookingForCoFounder: { equals: true } })
  }

  if (filters.query) {
    clauses.push({ name: { contains: filters.query } })
  }

  appendLocationFilters(clauses, filters)

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

  appendLocationFilters(clauses, filters)

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
