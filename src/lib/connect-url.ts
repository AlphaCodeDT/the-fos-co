import { normalizeSocialUrl } from '@/lib/social-url'
import { isHttpOrHttpsUrl } from '@/lib/url'

/** LinkedIn first, then website; null when neither is a valid http(s) URL. */
export function resolveConnectHref(
  linkedIn?: string | null,
  website?: string | null,
): string | null {
  if (isHttpOrHttpsUrl(linkedIn)) {
    return normalizeSocialUrl(linkedIn!) ?? linkedIn!.trim()
  }

  if (isHttpOrHttpsUrl(website)) {
    return normalizeSocialUrl(website!) ?? website!.trim()
  }

  return null
}
