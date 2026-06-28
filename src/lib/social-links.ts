export type SocialLinksData = {
  linkedIn?: string | null
  twitter?: string | null
  instagram?: string | null
  facebook?: string | null
  youtube?: string | null
  github?: string | null
  website?: string | null
}

export const SOCIAL_LINK_FIELDS = [
  'linkedIn',
  'twitter',
  'instagram',
  'facebook',
  'youtube',
  'github',
  'website',
] as const satisfies ReadonlyArray<keyof SocialLinksData>

export type SocialLinkField = (typeof SOCIAL_LINK_FIELDS)[number]

export function hasSocialLinks(data: SocialLinksData): boolean {
  return SOCIAL_LINK_FIELDS.some((field) => Boolean(data[field]?.trim()))
}
