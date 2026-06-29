import { lexicalToSafeHTML } from '@/lib/richtext'
import type { Story } from '@/payload-types'

type StoryContentProps = {
  content: Story['content']
}

export function StoryContent({ content }: StoryContentProps) {
  const html = lexicalToSafeHTML(content)

  return (
    <div
      className="prose prose-invert max-w-none prose-headings:text-brand-white prose-a:text-brand-yellow prose-strong:text-brand-white [&_a]:break-words [&_img]:h-auto [&_img]:max-w-full [&_pre]:overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
