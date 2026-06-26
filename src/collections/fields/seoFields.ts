import type { Field } from 'payload'

export const seoFields: Field[] = [
  {
    name: 'seo',
    type: 'group',
    fields: [
      {
        name: 'seoTitle',
        type: 'text',
      },
      {
        name: 'seoDescription',
        type: 'textarea',
      },
      {
        name: 'canonicalUrl',
        type: 'text',
      },
      {
        name: 'noindex',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },
]
