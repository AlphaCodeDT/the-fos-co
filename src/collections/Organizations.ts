import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '@/access'
import { slugField } from '@/collections/fields/slugField'
import { ORG_TYPE_OPTIONS } from '@/lib/organization-types'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'slug'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [...ORG_TYPE_OPTIONS],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'parentOrganization',
      type: 'relationship',
      relationTo: 'organizations',
    },
  ],
}
