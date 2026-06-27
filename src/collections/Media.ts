import type { CollectionConfig } from 'payload'

import { isEditorOrFounder, isMediaUploader } from '@/access'
import { isFounderUser } from '@/access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: isEditorOrFounder,
    update: isMediaUploader,
    delete: isMediaUploader,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === 'create' && isFounderUser(req.user) && req.user?.id) {
          return {
            ...data,
            uploadedBy: req.user.id,
          }
        }
        return data
      },
    ],
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumb',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumb',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'founders',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
