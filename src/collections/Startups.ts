import type { CollectionConfig } from 'payload'

import {
  fieldAdminOrEditor,
  isAdminOrEditor,
  isFounder,
  isStartupOwnerOrEditor,
  startupRead,
} from '@/access'
import { isEditorUser, isFounderUser } from '@/access/roles'
import { slugField } from '@/collections/fields/slugField'
import {
  notifyClaimApproved,
  notifyClaimRejected,
  notifySubmissionPending,
} from '@/lib/email/notify'
import { ensureUniqueSlug, slugifyName } from '@/lib/slug'
import type { Founder, Startup } from '@/payload-types'

function getRelationshipId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'number') {
    return value.id
  }
  return null
}

export const Startups: CollectionConfig = {
  slug: 'startups',
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'stage',
      'city',
      'owner',
      'moderationStatus',
      'verificationStatus',
      'needsReview',
      'claim.claimStatus',
    ],
    description:
      'Filter by moderationStatus = pending, needsReview = true, or claim.claimStatus = pending.',
  },
  access: {
    read: startupRead,
    create: isFounder,
    update: isStartupOwnerOrEditor,
    delete: isAdminOrEditor,
  },
  indexes: [
    { fields: ['stage'] },
    { fields: ['city'] },
    { fields: ['industry'] },
    { fields: ['isHiring'] },
    { fields: ['isRaising'] },
    { fields: ['isLookingForCoFounder'] },
    { fields: ['womenLed'] },
    { fields: ['moderationStatus'] },
    { fields: ['verificationStatus'] },
    { fields: ['needsReview'] },
    { fields: ['owner'] },
    { fields: ['claim.claimStatus'] },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const next = { ...data }

        if (operation === 'create' && isFounderUser(req.user) && !isEditorUser(req.user) && req.user?.id) {
          next.owner = req.user.id
          next.moderationStatus = 'pending'
          next.claim = {
            ...(typeof next.claim === 'object' ? next.claim : {}),
            claimStatus: 'claimed',
          }

          const name = typeof next.name === 'string' ? next.name : ''
          const baseSlug =
            typeof next.slug === 'string' && next.slug.trim().length > 0
              ? next.slug
              : slugifyName(name)

          next.slug = await ensureUniqueSlug({
            payload: req.payload,
            collection: 'startups',
            baseSlug,
          })
        }

        if (operation === 'update' && isFounderUser(req.user) && !isEditorUser(req.user)) {
          if (originalDoc?.moderationStatus === 'approved') {
            next.needsReview = true
          }
        }

        if (operation === 'update' && isEditorUser(req.user)) {
          const previousStatus = originalDoc?.claim?.claimStatus
          const nextStatus =
            typeof next.claim === 'object' && next.claim?.claimStatus
              ? next.claim.claimStatus
              : previousStatus

          if (previousStatus === 'pending' && nextStatus === 'claimed') {
            const claimedBy =
              getRelationshipId(next.claim?.claimedBy) ??
              getRelationshipId(originalDoc?.claim?.claimedBy)

            if (claimedBy) {
              next.owner = claimedBy
            }
          }

          if (previousStatus === 'pending' && nextStatus === 'unclaimed') {
            next.claim = {
              ...(typeof next.claim === 'object' ? next.claim : {}),
              claimStatus: 'unclaimed',
              claimedBy: null,
              claimedAt: null,
            }
          }
        }

        if (Array.isArray(next.team)) {
          for (const row of next.team) {
            const hasFounder = getRelationshipId(row?.founder) != null
            const hasName = typeof row?.name === 'string' && row.name.trim().length > 0

            if (!hasFounder && !hasName) {
              throw new Error('Each team member must have a linked founder or a display name.')
            }
          }
        }

        return next
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === 'create' && doc.moderationStatus === 'pending') {
          try {
            await notifySubmissionPending({ type: 'startup', name: doc.name })
          } catch (error) {
            req.payload.logger.error({ err: error, msg: 'Failed to notify editors of new startup' })
          }
        }

        if (operation !== 'update') return

        const prevStatus = previousDoc?.claim?.claimStatus
        const nextStatus = doc.claim?.claimStatus

        if (prevStatus === nextStatus) return

        const claimedById = getRelationshipId(doc.claim?.claimedBy)
        if (!claimedById) return

        let founder: Founder | null = null

        try {
          founder = (await req.payload.findByID({
            collection: 'founders',
            id: claimedById,
            overrideAccess: true,
          })) as Founder
        } catch {
          return
        }

        if (prevStatus === 'pending' && nextStatus === 'claimed') {
          try {
            await notifyClaimApproved(doc as Startup, founder)
          } catch (error) {
            req.payload.logger.error({ err: error, msg: 'Failed to notify founder of claim approval' })
          }
        }

        if (prevStatus === 'pending' && nextStatus === 'unclaimed') {
          try {
            await notifyClaimRejected(doc as Startup, founder)
          } catch (error) {
            req.payload.logger.error({ err: error, msg: 'Failed to notify founder of claim rejection' })
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
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'logoUrl',
      type: 'text',
      admin: {
        description: 'Public URL from Supabase Storage (set by founder account uploads).',
      },
    },
    {
      name: 'tagline',
      type: 'text',
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'website',
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
      name: 'instagram',
      type: 'text',
    },
    {
      name: 'facebook',
      type: 'text',
    },
    {
      name: 'youtube',
      type: 'text',
    },
    {
      name: 'github',
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
      index: true,
    },
    {
      name: 'team',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            description: 'Display name for team members not linked to a FoS founder profile.',
          },
        },
        {
          name: 'founder',
          type: 'relationship',
          relationTo: 'founders',
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
      name: 'owner',
      type: 'relationship',
      relationTo: 'founders',
      index: true,
      admin: {
        position: 'sidebar',
      },
      access: {
        update: fieldAdminOrEditor,
      },
    },
    {
      name: 'claim',
      type: 'group',
      access: {
        read: () => true,
        update: fieldAdminOrEditor,
      },
      fields: [
        {
          name: 'claimedBy',
          type: 'relationship',
          relationTo: 'founders',
          access: {
            read: () => true,
            update: fieldAdminOrEditor,
          },
        },
        {
          name: 'claimedAt',
          type: 'date',
          access: {
            read: () => true,
            update: fieldAdminOrEditor,
          },
        },
        {
          name: 'claimStatus',
          type: 'select',
          access: {
            read: () => true,
            update: fieldAdminOrEditor,
          },
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
