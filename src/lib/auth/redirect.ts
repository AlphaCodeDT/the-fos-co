const DEFAULT_REDIRECT = '/account'

/** Accept only same-origin relative paths (no open redirects). */
export function sanitizeRedirectPath(path: string | null | undefined): string {
  if (!path || typeof path !== 'string') {
    return DEFAULT_REDIRECT
  }

  const trimmed = path.trim()

  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return DEFAULT_REDIRECT
  }

  if (/^https?:/i.test(trimmed)) {
    return DEFAULT_REDIRECT
  }

  return trimmed
}
