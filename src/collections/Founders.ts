import type { CollectionConfig } from 'payload'

import {
  fieldAdminOrEditor,
  founderRead,
  isAdminOrEditor,
  isFounderSelfOrEditor,
} from '@/access'
import { isEditorUser, isFounderUser } from '@/access/roles'
import { slugField } from '@/collections/fields/slugField'
import {
  generateForgotPasswordEmailHTML,
  generateForgotPasswordEmailSubject,
  generateVerifyEmailHTML,
  generateVerifyEmailSubject,
} from '@/lib/email/auth'
import { notifySubmissionPending } from '@/lib/email/notify'
import { ensureUniqueSlug, slugifyName } from '@/lib/slug'

export const Founders: CollectionConfig = {
  slug: 'founders',
  auth: {
    maxLoginAttempts: 5,
    lockTime: 600_000,
    verify: {
      generateEmailHTML: ({ token }) => generateVerifyEmailHTML({ token }),
      generateEmailSubject: () => generateVerifyEmailSubject(),
    },
    forgotPassword: {
      generateEmailHTML: (args) => generateForgotPasswordEmailHTML({ token: args?.token }),
      generateEmailSubject: () => generateForgotPasswordEmailSubject(),
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'city',
      'moderationStatus',
      'verificationStatus',
      'needsReview',
      'createdAt',
    ],
    description:
      'Filter by moderationStatus = pending or needsReview = true to work the moderation queue.',
  },
  access: {
    admin: () => false,
    read: founderRead,
    create: () => true,
    update: isFounderSelfOrEditor,
    delete: isAdminOrEditor,
  },
  indexes: [
    { fields: ['city'] },
    { fields: ['moderationStatus'] },
    { fields: ['verificationStatus'] },
    { fields: ['needsReview'] },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const next = { ...data }

        if (operation === 'create') {
          next.moderationStatus = 'pending'
          next.verificationStatus = 'pending'

          const name = typeof next.name === 'string' ? next.name : ''
          const baseSlug =
            typeof next.slug === 'string' && next.slug.trim().length > 0
              ? next.slug
              : slugifyName(name)

          next.slug = await ensureUniqueSlug({
            payload: req.payload,
            collection: 'founders',
            baseSlug,
          })
        }

        if (operation === 'update' && isFounderUser(req.user) && !isEditorUser(req.user)) {
          delete next.moderationStatus
          delete next.verificationStatus
          delete next.verificationSource

          if (originalDoc?.moderationStatus === 'approved') {
            next.needsReview = true
          }
        }

        return next
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create' && doc.moderationStatus === 'pending') {
          try {
            await notifySubmissionPending({ type: 'founder', name: doc.name })
          } catch (error) {
            req.payload.logger.error({ err: error, msg: 'Failed to notify editors of new founder' })
          }
        }
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
      name: 'headline',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'richText',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Female', value: 'female' },
        { label: 'Male', value: 'male' },
        { label: 'Non-binary', value: 'non-binary' },
        { label: 'Prefer not to say', value: 'prefer-not-to-say' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'city',
      type: 'text',
      index: true,
    },
    {
      name: 'state',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'linkedIn',
      type: 'text',
    },
    {
      name: 'twitter',
      type: 'text',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'industries',
      type: 'relationship',
      relationTo: 'industries',
      hasMany: true,
    },
    {
      name: 'organizations',
      type: 'relationship',
      relationTo: 'organizations',
      hasMany: true,
    },
    {
      name: 'lookingForCoFounder',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'openToOpportunities',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'linkedStartups',
      type: 'relationship',
      relationTo: 'startups',
      hasMany: true,
      admin: {
        description: 'Denormalized for profile rendering. Startups.team is authoritative.',
      },
    },
    {
      name: 'needsReview',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
      },
      access: {
        update: fieldAdminOrEditor,
      },
    },
    {
      name: 'moderationStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
      ],
      access: {
        update: fieldAdminOrEditor,
      },
    },
    {
      name: 'verificationStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Verified', value: 'verified' },
        { label: 'Rejected', value: 'rejected' },
      ],
      access: {
        update: fieldAdminOrEditor,
      },
    },
    {
      name: 'verificationSource',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Organization', value: 'organization' },
            { label: 'Manual', value: 'manual' },
          ],
        },
        {
          name: 'organization',
          type: 'relationship',
          relationTo: 'organizations',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'organization',
          },
        },
      ],
      access: {
        update: fieldAdminOrEditor,
      },
    },
  ],
}
