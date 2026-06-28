import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '@/access'
import { slugField } from '@/collections/fields/slugField'
import { normalizeSocialUrl } from '@/lib/social-url'

const MODE_OPTIONS = [
  { label: 'Online', value: 'online' },
  { label: 'In person', value: 'in-person' },
  { label: 'Hybrid', value: 'hybrid' },
] as const

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'organization', 'cohort', 'startDate', 'status', 'slug'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        const next = { ...data }

        if (typeof next.applicationUrl === 'string') {
          const raw = next.applicationUrl.trim()
          next.applicationUrl = raw ? normalizeSocialUrl(raw) : undefined
        }

        return next
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'cohort',
      type: 'text',
    },
    {
      name: 'startDate',
      type: 'date',
    },
    {
      name: 'endDate',
      type: 'date',
    },
    {
      name: 'applicationDeadline',
      type: 'date',
    },
    {
      name: 'applicationUrl',
      type: 'text',
    },
    {
      name: 'mode',
      type: 'select',
      options: [...MODE_OPTIONS],
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
}
