export const DEFAULT_COUNTRY_CODE = 'IN'
export const DEFAULT_COUNTRY_NAME = 'India'

export type LocationValues = {
  country: string
  state: string
  city: string
  stateCode: string
}

export function buildRecentCohortYears(count = 11): number[] {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: count }, (_, index) => currentYear - index)
}
