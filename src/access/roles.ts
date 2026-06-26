import type { User } from '@/payload-types'

export type EditorRole = 'admin' | 'editor'

export function isEditorUser(user: unknown): user is User {
  return (
    typeof user === 'object' &&
    user !== null &&
    'collection' in user &&
    user.collection === 'users' &&
    'role' in user &&
    (user.role === 'admin' || user.role === 'editor')
  )
}

export function isAdminUser(user: unknown): user is User {
  return isEditorUser(user) && user.role === 'admin'
}

export function isFounderUser(user: unknown): boolean {
  return (
    typeof user === 'object' &&
    user !== null &&
    'collection' in user &&
    user.collection === 'founders'
  )
}
