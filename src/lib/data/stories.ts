import { getPayloadClient } from '@/lib/payload'
import { publishedStoriesWhere } from '@/lib/queries'

const storyListSelect = {
  title: true,
  slug: true,
  excerpt: true,
  publishedDate: true,
  featuredImage: true,
  author: true,
  category: true,
  seo: true,
} as const

export async function getPublishedStories(limit = 12) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'stories',
    where: publishedStoriesWhere,
    sort: '-publishedDate',
    limit,
    depth: 2,
    select: storyListSelect,
  })
}

export async function getPublishedStoryBySlug(slug: string) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'stories',
    where: {
      and: [publishedStoriesWhere, { slug: { equals: slug } }],
    },
    limit: 1,
    depth: 2,
  })
}

export async function getPublishedStoriesForFeed(limit = 50) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'stories',
    where: publishedStoriesWhere,
    sort: '-publishedDate',
    limit,
    depth: 1,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedDate: true,
      author: true,
      seo: true,
    },
  })
}

export async function getPublishedStoriesForSitemap() {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'stories',
    where: publishedStoriesWhere,
    sort: '-publishedDate',
    limit: 1000,
    depth: 0,
    select: {
      slug: true,
      publishedDate: true,
      seo: true,
    },
  })
}

export async function getAuthorBySlug(slug: string) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'users',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
}

export async function getPublishedStoriesByAuthor(authorId: number, limit = 24) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'stories',
    where: {
      and: [publishedStoriesWhere, { author: { equals: authorId } }],
    },
    sort: '-publishedDate',
    limit,
    depth: 2,
    select: storyListSelect,
  })
}
