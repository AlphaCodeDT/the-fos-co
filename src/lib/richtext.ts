import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

import { sanitizeRichText } from '@/lib/sanitize'

export function lexicalToSafeHTML(data: SerializedEditorState | null | undefined): string {
  if (!data) return ''

  const html = convertLexicalToHTML({ data })
  return sanitizeRichText(html)
}
