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
