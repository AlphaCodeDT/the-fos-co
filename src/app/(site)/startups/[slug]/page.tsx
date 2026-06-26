import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { TrustBadge } from '@/components/community/TrustBadge'
import { SiteFooter, SiteHeader } from '@/components/layout/site-chrome'
import { getApprovedStartupBySlug } from '@/lib/data/community'
import { buildCommunityProfileMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getApprovedStartupBySlug(slug)
  const startup = result.docs[0]

  if (!startup) {
    return {
      title: 'Startup not found',
      robots: { index: false, follow: false },
    }
  }

  return buildCommunityProfileMetadata(
    {
      name: startup.name,
      slug: startup.slug,
      tagline: startup.tagline,
      description: startup.description,
      moderationStatus: startup.moderationStatus,
      verificationStatus: startup.verificationStatus,
    },
    'startups',
  )
}

export default async function StartupProfilePage({ params }: PageProps) {
  const { slug } = await params
  const result = await getApprovedStartupBySlug(slug)
  const startup = result.docs[0]

  if (!startup) notFound()

  const logo =
    startup.logo && typeof startup.logo === 'object'
      ? startup.logo.sizes?.thumb?.url || startup.logo.url
      : null

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-brand-white/10">
            {logo ? (
              <Image src={logo} alt={startup.name} fill className="object-cover" sizes="96px" />
            ) : (
              <div className="flex h-full items-center justify-center text-xl font-bold text-brand-yellow">
                {startup.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold text-brand-white">{startup.name}</h1>
              <TrustBadge
                moderationStatus={startup.moderationStatus}
                verificationStatus={startup.verificationStatus}
              />
            </div>
            {startup.tagline ? (
              <p className="text-lg text-brand-white/70">{startup.tagline}</p>
            ) : null}
            {[startup.city, startup.state, startup.country].filter(Boolean).length > 0 ? (
              <p className="text-sm text-brand-white/50">
                {[startup.city, startup.state, startup.country].filter(Boolean).join(', ')}
              </p>
            ) : null}
          </div>
        </div>

        {startup.description ? (
          <div className="mt-10 border-t border-brand-white/10 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">About</h2>
            <p className="mt-3 whitespace-pre-wrap text-brand-white/80">{startup.description}</p>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </>
  )
}
