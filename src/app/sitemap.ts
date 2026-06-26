import type { MetadataRoute } from 'next'

import {
  getIndexableFoundersForSitemap,
  getIndexableStartupsForSitemap,
} from '@/lib/data/community'
import { getPublishedStoriesForSitemap } from '@/lib/data/stories'
import { storyShouldNoIndex } from '@/lib/seo'
import { absoluteUrl } from '@/lib/url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/stories'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  try {
    const [storiesResult, foundersResult, startupsResult] = await Promise.all([
      getPublishedStoriesForSitemap(),
      getIndexableFoundersForSitemap(),
      getIndexableStartupsForSitemap(),
    ])

    const storyRoutes: MetadataRoute.Sitemap = storiesResult.docs
      .filter((story) => !storyShouldNoIndex(story))
      .map((story) => ({
        url: absoluteUrl(`/stories/${story.slug}`),
        lastModified: story.publishedDate ? new Date(story.publishedDate) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

    const founderRoutes: MetadataRoute.Sitemap = foundersResult.docs.map((founder) => ({
      url: absoluteUrl(`/founders/${founder.slug}`),
      lastModified: founder.updatedAt ? new Date(founder.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const startupRoutes: MetadataRoute.Sitemap = startupsResult.docs.map((startup) => ({
      url: absoluteUrl(`/startups/${startup.slug}`),
      lastModified: startup.updatedAt ? new Date(startup.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticRoutes, ...storyRoutes, ...founderRoutes, ...startupRoutes]
  } catch {
    return staticRoutes
  }
}
