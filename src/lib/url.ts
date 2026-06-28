export function isHttpOrHttpsUrl(raw?: string | null): boolean {
  const trimmed = raw?.trim()
  if (!trimmed) return false

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function getServerURL(): string {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

export function absoluteUrl(path: string): string {
  const base = getServerURL().replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

/** Resolve Payload media URLs (relative API paths or absolute S3 URLs) for Next/Image. */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return absoluteUrl(url)
}
