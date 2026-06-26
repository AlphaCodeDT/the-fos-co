import type { Field } from 'payload'
import slugify from 'slugify'

type SlugFieldOptions = {
  fieldToUse?: string
}

export function slugField({ fieldToUse = 'name' }: SlugFieldOptions = {}): Field {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
    },
    hooks: {
      beforeValidate: [
        ({ data, operation, value }) => {
          if (typeof value === 'string' && value.trim().length > 0) {
            return slugify(value, { lower: true, strict: true })
          }

          if (operation === 'create' && data?.[fieldToUse]) {
            return slugify(String(data[fieldToUse]), { lower: true, strict: true })
          }

          return value
        },
      ],
    },
  }
}
