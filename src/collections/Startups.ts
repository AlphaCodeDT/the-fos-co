import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicApproved } from '@/access'
import { slugField } from '@/collections/fields/slugField'

export const Startups: CollectionConfig = {
  slug: 'startups',
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'stage',
      'city',
      'moderationStatus',
      'verificationStatus',
      'claim.claimStatus',
    ],
  },
  access: {
    read: publicApproved,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  indexes: [
    { fields: ['stage'] },
    { fields: ['city'] },
    { fields: ['industry'] },
    { fields: ['isHiring'] },
    { fields: ['isRaising'] },
    { fields: ['womenLed'] },
    { fields: ['moderationStatus'] },
    { fields: ['verificationStatus'] },
    { fields: ['claim.claimStatus'] },
  ],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tagline',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'industry',
      type: 'relationship',
      relationTo: 'industries',
      index: true,
    },
    {
      name: 'stage',
      type: 'select',
      index: true,
      options: [
        { label: 'Idea', value: 'idea' },
        { label: 'MVP', value: 'mvp' },
        { label: 'Early Revenue', value: 'early-revenue' },
        { label: 'Growth', value: 'growth' },
        { label: 'Scaling', value: 'scaling' },
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
      name: 'teamSize',
      type: 'number',
      min: 1,
    },
    {
      name: 'organizations',
      type: 'relationship',
      relationTo: 'organizations',
      hasMany: true,
    },
    {
      name: 'fundingStatus',
      type: 'text',
    },
    {
      name: 'foundedYear',
      type: 'number',
    },
    {
      name: 'womenLed',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'isHiring',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'isRaising',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'isLookingForCoFounder',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'team',
      type: 'array',
      fields: [
        {
          name: 'founder',
          type: 'relationship',
          relationTo: 'founders',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'Founder', value: 'founder' },
            { label: 'Co-Founder', value: 'co-founder' },
            { label: 'CEO', value: 'ceo' },
            { label: 'CTO', value: 'cto' },
            { label: 'CPO', value: 'cpo' },
            { label: 'Advisor', value: 'advisor' },
          ],
        },
        {
          name: 'isPrimary',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'claim',
      type: 'group',
      fields: [
        {
          name: 'claimedBy',
          type: 'relationship',
          relationTo: 'founders',
        },
        {
          name: 'claimedAt',
          type: 'date',
        },
        {
          name: 'claimStatus',
          type: 'select',
          defaultValue: 'unclaimed',
          index: true,
          options: [
            { label: 'Unclaimed', value: 'unclaimed' },
            { label: 'Pending', value: 'pending' },
            { label: 'Claimed', value: 'claimed' },
          ],
        },
      ],
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
    },
    {
      name: 'opportunities',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Job', value: 'job' },
            { label: 'Internship', value: 'internship' },
            { label: 'Co-founder', value: 'co-founder' },
            { label: 'Partnership', value: 'partnership' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'link',
          type: 'text',
        },
      ],
    },
  ],
}
