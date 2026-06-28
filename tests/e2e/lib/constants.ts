import slugify from 'slugify'

export const E2E_STABLE_PREFIX = 'E2E__'

export function e2eFounderEmail(token: string, role: string): string {
  return `e2e+${role}_${token}@thefos.test`
}

export function e2eFounderName(token: string, label: string): string {
  return `${E2E_STABLE_PREFIX}${label} ${token}`
}

export function e2eStartupName(token: string, label: string): string {
  return `${E2E_STABLE_PREFIX}${label} ${token}`
}

export function e2eOrgName(token: string, label = 'Org'): string {
  return `${E2E_STABLE_PREFIX}${label} ${token}`
}

export function e2eOrgSlug(token: string, suffix = ''): string {
  const raw = suffix ? `e2e-org-${suffix}-${token}` : `e2e-org-${token}`
  return slugify(raw, { lower: true, strict: true })
}

export function e2eProgramName(token: string, label: string): string {
  return `${E2E_STABLE_PREFIX}Program ${label} ${token}`
}

export function e2eProgramSlug(token: string, suffix: string): string {
  return slugify(`e2e-prog-${suffix}-${token}`, { lower: true, strict: true })
}
