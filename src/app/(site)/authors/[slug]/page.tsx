import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { SiteFooter, SiteHeader } from '@/components/layout/site-chrome'
import { StoryCard } from '@/components/stories/StoryCard'
import { getAuthorBySlug, getPublishedStoriesByAuthor } from '@/lib/data/stories'
import { absoluteUrl } from '@/lib/url'

export const revalidate = 60

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getAuthorBySlug(slug)
  const author = result.docs[0]

  if (!author) {
    return {
      title: 'Author not found',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: `${author.name} | NSRCEL Founder Directory`,
    description: author.bio || `Stories by ${author.name}`,
    alternates: {
      canonical: absoluteUrl(`/authors/${author.slug}`),
    },
    openGraph: {
      title: author.name,
      description: author.bio || undefined,
      type: 'profile',
      url: absoluteUrl(`/authors/${author.slug}`),
    },
  }
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params
  const authorResult = await getAuthorBySlug(slug)
  const author = authorResult.docs[0]

  if (!author) notFound()

  const storiesResult = await getPublishedStoriesByAuthor(author.id)
  const avatar =
    author.avatar && typeof author.avatar === 'object'
      ? author.avatar.sizes?.thumb?.url || author.avatar.url
      : null

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-12">
        <div className="mb-12 flex flex-col gap-6 border-b border-brand-white/10 pb-10 md:flex-row md:items-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full bg-brand-white/10">
            {avatar ? (
              <Image
                src={avatar}
                alt={author.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-bold text-brand-yellow">
                {author.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Author</p>
            <h1 className="mt-1 text-4xl font-bold text-brand-white">{author.name}</h1>
            {author.bio ? <p className="mt-3 max-w-2xl text-brand-white/70">{author.bio}</p> : null}
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-semibold text-brand-white">Stories</h2>
        {storiesResult.docs.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {storiesResult.docs.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <p className="text-brand-white/60">No published stories by this author yet.</p>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
