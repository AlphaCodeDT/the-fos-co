import type { Media, Story, User } from '@/payload-types'
import type { CommunityTrustFields } from '@/lib/trust'
import { shouldNoIndexCommunityProfile } from '@/lib/trust'

import { siteConfig } from '@/lib/site'
import { absoluteUrl } from '@/lib/url'

type StorySEOInput = Pick<Story, 'title' | 'excerpt' | 'slug' | 'publishedDate' | 'seo'> & {
  featuredImage?: Media | number | null
  author?: User | number | null
}

type CommunityProfileSEOInput = CommunityTrustFields & {
  name: string
  slug: string
  headline?: string | null
  tagline?: string | null
  bio?: string | null
  description?: string | null
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
    record.headline || record.tagline || record.bio || record.description || undefined
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
