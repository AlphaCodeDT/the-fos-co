import Image from 'next/image'
import Link from 'next/link'

import type { Category, Media, Story, User } from '@/payload-types'

type StoryCardProps = {
  story: Pick<Story, 'title' | 'slug' | 'excerpt' | 'publishedDate'> & {
    featuredImage?: Media | number | null
    author?: User | number | null
    category?: Category | number | null
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

export function StoryCard({ story }: StoryCardProps) {
  const image =
    story.featuredImage && typeof story.featuredImage === 'object'
      ? story.featuredImage.sizes?.card?.url || story.featuredImage.url
      : null

  const authorName =
    story.author && typeof story.author === 'object' ? story.author.name : 'Editorial'

  const authorSlug =
    story.author && typeof story.author === 'object' ? story.author.slug : undefined

  const categoryName =
    story.category && typeof story.category === 'object' ? story.category.name : null

  return (
    <article className="group overflow-hidden rounded-2xl border border-brand-white/10 bg-brand-black/60">
      <Link href={`/stories/${story.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-brand-white/5">
          {image ? (
            <Image
              src={image}
              alt={
                story.featuredImage && typeof story.featuredImage === 'object'
                  ? story.featuredImage.alt
                  : story.title
              }
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-brand-white/40">
              No image
            </div>
          )}
        </div>
        <div className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-brand-yellow">
            {categoryName ? <span>{categoryName}</span> : null}
            {story.publishedDate ? <span>{formatDate(story.publishedDate)}</span> : null}
          </div>
          <h3 className="text-xl font-semibold text-brand-white group-hover:text-brand-yellow">
            {story.title}
          </h3>
          {story.excerpt ? (
            <p className="line-clamp-3 text-sm text-brand-white/70">{story.excerpt}</p>
          ) : null}
        </div>
      </Link>
      {authorSlug ? (
        <div className="px-5 pb-5 text-sm text-brand-white/60">
          By{' '}
          <Link href={`/authors/${authorSlug}`} className="text-brand-yellow hover:underline">
            {authorName}
          </Link>
        </div>
      ) : null}
    </article>
  )
}
