import type { Founder, Media, Startup, Story, User } from '@/payload-types'
import type { CommunityTrustFields } from '@/lib/trust'
import { shouldNoIndexCommunityProfile } from '@/lib/trust'

import { siteConfig } from '@/lib/site'
import { resolveFounderAvatarUrl, resolveStartupLogoUrl } from '@/lib/media-image'
import { absoluteUrl, resolveMediaUrl } from '@/lib/url'

type StorySEOInput = Pick<Story, 'title' | 'excerpt' | 'slug' | 'publishedDate' | 'seo'> & {
  featuredImage?: Media | number | null
  author?: User | number | null
}

type CommunityProfileSEOInput = CommunityTrustFields & {
  name: string
  slug: string
  headline?: string | null
  tagline?: string | null
  bioPlainText?: string | null
  descriptionPlainText?: string | null
}

export function storyShouldNoIndex(story: { seo?: StorySEOInput['seo'] | null }): boolean {
  return Boolean(story.seo?.noindex)
}

export function buildCommunityProfileMetadata(
  record: CommunityProfileSEOInput,
  pathPrefix: 'founders' | 'startups',
) {
  const title = record.name
  const description =
    record.headline ||
    record.tagline ||
    record.bioPlainText ||
    record.descriptionPlainText ||
    undefined
  const canonical = absoluteUrl(`/${pathPrefix}/${record.slug}`)
  const noindex = shouldNoIndexCommunityProfile(record)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title,
      description,
      type: 'profile' as const,
      url: canonical,
    },
  }
}

export function buildStoryMetadata(story: StorySEOInput) {
  const title = story.seo?.seoTitle || story.title
  const description = story.seo?.seoDescription || story.excerpt || undefined
  const canonical = story.seo?.canonicalUrl || absoluteUrl(`/stories/${story.slug}`)
  const noindex = storyShouldNoIndex(story)

  const ogImage =
    story.featuredImage && typeof story.featuredImage === 'object'
      ? story.featuredImage.sizes?.og?.url || story.featuredImage.url
      : undefined

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title,
      description,
      type: 'article' as const,
      url: canonical,
      publishedTime: story.publishedDate,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export function buildArticleJsonLd(story: StorySEOInput) {
  const author =
    story.author && typeof story.author === 'object'
      ? {
          '@type': 'Person' as const,
          name: story.author.name,
          url: absoluteUrl(`/authors/${story.author.slug}`),
        }
      : undefined

  const image =
    story.featuredImage && typeof story.featuredImage === 'object'
      ? story.featuredImage.sizes?.og?.url || story.featuredImage.url
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.excerpt,
    datePublished: story.publishedDate,
    mainEntityOfPage: absoluteUrl(`/stories/${story.slug}`),
    author,
    image,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: absoluteUrl('/'),
    },
  }
}

export function buildFounderPersonJsonLd(founder: Founder) {
  const image = resolveFounderAvatarUrl(founder) || undefined

  const affiliations = (founder.organizations || [])
    .map((org) =>
      typeof org === 'object' && org !== null
        ? { '@type': 'Organization' as const, name: org.name }
        : null,
    )
    .filter((org): org is { '@type': 'Organization'; name: string } => org !== null)

  const sameAs = [founder.linkedIn, founder.twitter, founder.website].filter(
    (url): url is string => Boolean(url),
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: founder.name,
    jobTitle: founder.headline || undefined,
    url: absoluteUrl(`/founders/${founder.slug}`),
    image,
    affiliation: affiliations.length > 0 ? affiliations : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }
}

export function buildStartupOrganizationJsonLd(
  startup: Startup,
  descriptionPlainText?: string,
) {
  const logo = resolveStartupLogoUrl(startup) || undefined

  const memberOf = (startup.organizations || [])
    .map((org) =>
      typeof org === 'object' && org !== null
        ? { '@type': 'Organization' as const, name: org.name }
        : null,
    )
    .filter((org): org is { '@type': 'Organization'; name: string } => org !== null)

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: startup.name,
    description: descriptionPlainText || startup.tagline || undefined,
    url: startup.website || absoluteUrl(`/startups/${startup.slug}`),
    logo,
    memberOf: memberOf.length > 0 ? memberOf : undefined,
  }
}
