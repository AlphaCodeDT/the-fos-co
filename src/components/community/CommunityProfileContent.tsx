import type { Founder, Startup } from '@/payload-types'

import { lexicalToSafeHTML } from '@/lib/richtext'

type CommunityProfileContentProps = {
  content: Founder['bio'] | Startup['description']
}

export function CommunityProfileContent({ content }: CommunityProfileContentProps) {
  const html = lexicalToSafeHTML(content)

  if (!html) return null

  return (
    <div
      className="prose prose-invert max-w-none prose-headings:text-brand-white prose-a:text-brand-yellow prose-strong:text-brand-white"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
