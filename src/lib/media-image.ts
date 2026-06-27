import type { Founder, Media, Startup } from '@/payload-types'
import { resolveMediaUrl } from '@/lib/url'

type FounderImageSource = Pick<Founder, 'avatarUrl' | 'name'> & {
  avatar?: Media | number | null
}

type StartupImageSource = Pick<Startup, 'logoUrl' | 'name'> & {
  logo?: Media | number | null
}

export function resolveFounderAvatarUrl(founder: FounderImageSource): string | null {
  if (founder.avatarUrl) {
    return founder.avatarUrl
  }

  if (founder.avatar && typeof founder.avatar === 'object') {
    return resolveMediaUrl(founder.avatar.sizes?.thumb?.url || founder.avatar.url)
  }

  return null
}

export function resolveStartupLogoUrl(startup: StartupImageSource): string | null {
  if (startup.logoUrl) {
    return startup.logoUrl
  }

  if (startup.logo && typeof startup.logo === 'object') {
    return resolveMediaUrl(startup.logo.sizes?.thumb?.url || startup.logo.url)
  }

  return null
}
