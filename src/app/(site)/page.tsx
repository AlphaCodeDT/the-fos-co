import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFooter, SiteHeader } from '@/components/layout/site-chrome'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { StoryCard } from '@/components/stories/StoryCard'
import { getPublishedStories } from '@/lib/data/stories'
import { absoluteUrl } from '@/lib/url'

export const metadata: Metadata = {
  title: 'NSRCEL Founder Directory | Discover, Learn, Connect',
  description:
    'Founder stories, startup news, and ecosystem insights from NSRCEL and beyond.',
  alternates: {
    canonical: absoluteUrl('/'),
  },
}

export const revalidate = 60

export default async function HomePage() {
  const { docs: stories } = await getPublishedStories(6)

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-brand-white/10 bg-gradient-to-b from-brand-black to-brand-black/90">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-yellow">
              Startup Ecosystem Platform
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-brand-white md:text-6xl">
              Discover founders. Learn from stories. Connect with opportunity.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-brand-white/70">
              NSRCEL Founder Directory is the editorial home for founder journeys, startup news,
              and ecosystem intelligence — built for multi-organization scale from day one.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/stories"
                className="inline-flex h-11 items-center rounded-md bg-brand-yellow px-6 text-sm font-semibold text-brand-black hover:bg-brand-yellow/90"
              >
                Read founder stories
              </Link>
              <span className="inline-flex h-11 items-center rounded-md border border-brand-white/20 px-6 text-sm text-brand-white/60">
                Directory & profiles — coming in Phase 2
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-brand-white">Latest stories</h2>
              <p className="mt-2 text-brand-white/60">Interviews, founder journeys, and startup news.</p>
            </div>
            <Link href="/stories" className="text-sm font-medium text-brand-yellow hover:underline">
              View all
            </Link>
          </div>

          {stories.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-brand-white/20 p-8 text-brand-white/60">
              No published stories yet. Seed the database or publish content in the admin panel.
            </p>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <NewsletterSignup />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
