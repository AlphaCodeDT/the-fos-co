import type { Access, FieldAccess, Where } from 'payload'

import { isAdminUser, isEditorUser, isFounderUser } from './roles'

export const anyone: Access = () => true

export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => isAdminUser(user)

export const isAdminOrEditor: Access = ({ req: { user } }) => isEditorUser(user)

export const fieldAdminOrEditor: FieldAccess = ({ req: { user } }) => isEditorUser(user)

export const fieldAdminOnly: FieldAccess = ({ req: { user } }) => isAdminUser(user)

export const isFounder: Access = ({ req: { user } }) => isFounderUser(user)

const approvedCommunityWhere: Where = {
  moderationStatus: {
    equals: 'approved',
  },
}

/** Public community visibility — moderation approved only (verification does not gate visibility) */
export const publicApproved: Access = ({ req: { user } }) => {
  if (isEditorUser(user)) return true
  return approvedCommunityWhere
}

/** Founders may edit only records they own; editors/admins may edit all */
export const isOwnerOrEditor: Access = ({ req: { user } }) => {
  if (isEditorUser(user)) return true
  if (!isFounderUser(user) || !user?.id) return false

  return {
    owner: {
      equals: user.id,
    },
  }
}

const publishedStoriesWhere: Where = {
  _status: {
    equals: 'published',
  },
}

/** Published stories only for anonymous/public reads */
export const publishedStories: Access = ({ req: { user } }) => {
  if (isEditorUser(user)) return true
  return publishedStoriesWhere
}
