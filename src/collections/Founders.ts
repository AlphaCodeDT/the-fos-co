import type { CollectionConfig } from 'payload'

import {
  isAdminOrEditor,
  isOwnerOrEditor,
  publicApproved,
  fieldAdminOrEditor,
} from '@/access'
import { slugField } from '@/collections/fields/slugField'

export const Founders: CollectionConfig = {
  slug: 'founders',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'moderationStatus', 'verificationStatus'],
  },
  access: {
    read: publicApproved,
    create: isAdminOrEditor,
    update: isOwnerOrEditor,
    delete: isAdminOrEditor,
  },
  indexes: [
    { fields: ['city'] },
    { fields: ['moderationStatus'] },
    { fields: ['verificationStatus'] },
  ],
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
      name: 'owner',
      type: 'relationship',
      relationTo: 'founders',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'moderationStatus',
      type: 'select',
      required: true,
      defaultValue: 'draft',
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
