import { getPublishedStoriesForFeed } from '@/lib/data/stories'
import { storyShouldNoIndex } from '@/lib/seo'
import { siteConfig } from '@/lib/site'
import { absoluteUrl } from '@/lib/url'

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const { docs: stories } = await getPublishedStoriesForFeed()
  const siteUrl = absoluteUrl('/')
  const feedUrl = absoluteUrl('/feed.xml')
  const buildDate = new Date().toUTCString()

  const items = stories
    .filter((story) => !storyShouldNoIndex(story))
    .map((story) => {
      const link = absoluteUrl(`/stories/${story.slug}`)
      const authorName =
        story.author && typeof story.author === 'object' ? story.author.name : 'Editorial'

      return `
    <item>
      <title>${escapeXml(story.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${story.publishedDate ? new Date(story.publishedDate).toUTCString() : buildDate}</pubDate>
      <author>${escapeXml(authorName)}</author>
      ${story.excerpt ? `<description>${escapeXml(story.excerpt)}</description>` : ''}
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteConfig.rssDescription)}</description>
    <language>en-in</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
