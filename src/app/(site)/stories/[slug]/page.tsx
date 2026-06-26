import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SiteFooter, SiteHeader } from '@/components/layout/site-chrome'
import { StoryContent } from '@/components/stories/StoryContent'
import { getPublishedStoryBySlug } from '@/lib/data/stories'
import { buildArticleJsonLd, buildStoryMetadata } from '@/lib/seo'

export const revalidate = 60

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getPublishedStoryBySlug(slug)
  const story = result.docs[0]

  if (!story) {
    return {
      title: 'Story not found',
      robots: { index: false, follow: false },
    }
  }

  return buildStoryMetadata(story)
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params
  const result = await getPublishedStoryBySlug(slug)
  const story = result.docs[0]

  if (!story) notFound()

  const image =
    story.featuredImage && typeof story.featuredImage === 'object'
      ? story.featuredImage.sizes?.og?.url || story.featuredImage.url
      : null

  const author =
    story.author && typeof story.author === 'object'
      ? story.author
      : null

  const category =
    story.category && typeof story.category === 'object'
      ? story.category
      : null

  const jsonLd = buildArticleJsonLd(story)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-brand-yellow">
            {category ? <span>{category.name}</span> : null}
            {story.publishedDate ? (
              <time dateTime={story.publishedDate}>
                {new Intl.DateTimeFormat('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }).format(new Date(story.publishedDate))}
              </time>
            ) : null}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-brand-white md:text-5xl">
            {story.title}
          </h1>
          {story.excerpt ? <p className="text-lg text-brand-white/70">{story.excerpt}</p> : null}
          {author ? (
            <p className="text-sm text-brand-white/60">
              By{' '}
              <Link href={`/authors/${author.slug}`} className="text-brand-yellow hover:underline">
                {author.name}
              </Link>
            </p>
          ) : null}
        </div>

        {image ? (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-brand-white/5">
            <Image
              src={image}
              alt={
                story.featuredImage && typeof story.featuredImage === 'object'
                  ? story.featuredImage.alt
                  : story.title
              }
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        ) : null}

        <StoryContent content={story.content} />
      </main>
      <SiteFooter />
    </>
  )
}
