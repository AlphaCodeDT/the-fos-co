import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

import { sanitizeRichText } from '@/lib/sanitize'

export function lexicalToSafeHTML(data: SerializedEditorState | null | undefined): string {
  if (!data) return ''

  const html = convertLexicalToHTML({ data })
  return sanitizeRichText(html)
}

export function lexicalToPlainText(data: SerializedEditorState | null | undefined): string {
  if (!data?.root?.children) return ''

  const parts: string[] = []

  function walk(nodes: SerializedEditorState['root']['children']) {
    for (const node of nodes) {
      if (node && typeof node === 'object' && 'type' in node) {
        if (node.type === 'text' && 'text' in node && typeof node.text === 'string') {
          parts.push(node.text)
        }
        if ('children' in node && Array.isArray(node.children)) {
          walk(node.children as SerializedEditorState['root']['children'])
        }
      }
    }
  }

  walk(data.root.children)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}
