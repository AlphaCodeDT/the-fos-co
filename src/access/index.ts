import type { Access, FieldAccess, Where } from 'payload'

import { isAdminUser, isEditorUser, isFounderUser } from './roles'

export const anyone: Access = () => true

export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => isAdminUser(user)

export const isAdminOrEditor: Access = ({ req: { user } }) => isEditorUser(user)

export const fieldAdminOrEditor: FieldAccess = ({ req: { user } }) => isEditorUser(user)

export const fieldAdminOnly: FieldAccess = ({ req: { user } }) => isAdminUser(user)

export const isFounder: Access = ({ req: { user } }) => isFounderUser(user)

export const isEditorOrFounder: Access = ({ req: { user } }) =>
  isEditorUser(user) || isFounderUser(user)

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

/** Founders may read approved profiles publicly, plus their own record at any moderation state */
export const founderRead: Access = ({ req: { user } }) => {
  if (isEditorUser(user)) return true

  if (isFounderUser(user) && user?.id) {
    return {
      or: [approvedCommunityWhere, { id: { equals: user.id } }],
    }
  }

  return approvedCommunityWhere
}

/** Startups: public approved, or readable by owner / claimant */
export const startupRead: Access = ({ req: { user } }) => {
  if (isEditorUser(user)) return true

  if (isFounderUser(user) && user?.id) {
    return {
      or: [
        approvedCommunityWhere,
        { owner: { equals: user.id } },
        { 'claim.claimedBy': { equals: user.id } },
      ],
    }
  }

  return approvedCommunityWhere
}

/** Founders may edit only their own auth/profile document */
export const isFounderSelfOrEditor: Access = ({ req: { user } }) => {
  if (isEditorUser(user)) return true
  if (!isFounderUser(user) || !user?.id) return false

  return {
    id: {
      equals: user.id,
    },
  }
}

/** Founders may edit only startups they own */
export const isStartupOwnerOrEditor: Access = ({ req: { user } }) => {
  if (isEditorUser(user)) return true
  if (!isFounderUser(user) || !user?.id) return false

  return {
    owner: {
      equals: user.id,
    },
  }
}

/** Media: founders may modify only files they uploaded */
export const isMediaUploader: Access = ({ req: { user } }) => {
  if (isEditorUser(user)) return true
  if (!isFounderUser(user) || !user?.id) return false

  return {
    uploadedBy: {
      equals: user.id,
    },
  }
}

/** @deprecated Use isFounderSelfOrEditor — kept for reference during migration */
export const isOwnerOrEditor: Access = isFounderSelfOrEditor

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
