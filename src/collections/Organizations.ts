import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '@/access'
import { slugField } from '@/collections/fields/slugField'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'slug'],
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
      options: [
        { label: 'Incubator', value: 'incubator' },
        { label: 'Accelerator', value: 'accelerator' },
        { label: 'Community', value: 'community' },
        { label: 'University', value: 'university' },
        { label: 'Government Program', value: 'government-program' },
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
