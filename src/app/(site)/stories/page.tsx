import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFooter, SiteHeader } from '@/components/layout/site-chrome'
import { StoryCard } from '@/components/stories/StoryCard'
import { getPublishedStories } from '@/lib/data/stories'
import { absoluteUrl } from '@/lib/url'

export const metadata: Metadata = {
  title: 'Stories',
  description: 'Founder stories, interviews, and startup news from the ecosystem.',
  alternates: {
    canonical: absoluteUrl('/stories'),
  },
}

export const revalidate = 60

export default async function StoriesPage() {
  const { docs: stories } = await getPublishedStories(48)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-12">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Learn</p>
          <h1 className="mt-2 text-4xl font-bold text-brand-white">Founder stories</h1>
          <p className="mt-3 max-w-2xl text-brand-white/70">
            Published interviews, journeys, and startup news from verified editorial sources.
          </p>
        </div>

        {stories.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-brand-white/20 p-8 text-brand-white/60">
            No published stories yet.{' '}
            <Link href="/" className="text-brand-yellow hover:underline">
              Return home
            </Link>
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
