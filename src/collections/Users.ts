import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isAdminOrEditor, fieldAdminOnly } from '@/access'
import { isEditorUser } from '@/access/roles'
import { slugField } from '@/collections/fields/slugField'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    afterRead: [
      ({ doc, req }) => {
        if (!isEditorUser(req.user)) {
          const safe = { ...doc }
          delete safe.email
          return safe
        }
        return doc
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
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        update: fieldAdminOnly,
      },
    },
  ],
}
