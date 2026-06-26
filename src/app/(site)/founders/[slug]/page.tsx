import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { TrustBadge } from '@/components/community/TrustBadge'
import { SiteFooter, SiteHeader } from '@/components/layout/site-chrome'
import { getApprovedFounderBySlug } from '@/lib/data/community'
import { buildCommunityProfileMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getApprovedFounderBySlug(slug)
  const founder = result.docs[0]

  if (!founder) {
    return {
      title: 'Founder not found',
      robots: { index: false, follow: false },
    }
  }

  return buildCommunityProfileMetadata(
    {
      name: founder.name,
      slug: founder.slug,
      headline: founder.headline,
      bio: founder.bio,
      moderationStatus: founder.moderationStatus,
      verificationStatus: founder.verificationStatus,
    },
    'founders',
  )
}

export default async function FounderProfilePage({ params }: PageProps) {
  const { slug } = await params
  const result = await getApprovedFounderBySlug(slug)
  const founder = result.docs[0]

  if (!founder) notFound()

  const avatar =
    founder.avatar && typeof founder.avatar === 'object'
      ? founder.avatar.sizes?.thumb?.url || founder.avatar.url
      : null

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-brand-white/10">
            {avatar ? (
              <Image src={avatar} alt={founder.name} fill className="object-cover" sizes="112px" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-bold text-brand-yellow">
                {founder.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold text-brand-white">{founder.name}</h1>
              <TrustBadge
                moderationStatus={founder.moderationStatus}
                verificationStatus={founder.verificationStatus}
              />
            </div>
            {founder.headline ? (
              <p className="text-lg text-brand-white/70">{founder.headline}</p>
            ) : null}
            {[founder.city, founder.state, founder.country].filter(Boolean).length > 0 ? (
              <p className="text-sm text-brand-white/50">
                {[founder.city, founder.state, founder.country].filter(Boolean).join(', ')}
              </p>
            ) : null}
          </div>
        </div>

        {founder.bio ? (
          <div className="mt-10 border-t border-brand-white/10 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">About</h2>
            <p className="mt-3 whitespace-pre-wrap text-brand-white/80">{founder.bio}</p>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </>
  )
}
