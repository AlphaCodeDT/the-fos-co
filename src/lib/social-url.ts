/** Normalize optional social/website URLs to https?:// form for storage. */
export function normalizeSocialUrl(raw: string): string | undefined {
  const trimmed = raw.trim()
  if (!trimmed) return undefined

  let url = trimmed
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return undefined
    }
    return parsed.href
  } catch {
    return undefined
  }
}
