import type { Founder, Startup } from '../../../src/payload-types'

import { E2E_STABLE_PREFIX } from './constants'

export function assertDeleteBatch(ids: number[], label: string): void {
  if (ids.length === 0) {
    throw new Error(`Refusing empty ${label} delete batch.`)
  }

  if (ids.length > 50) {
    throw new Error(`Refusing ${label} bulk delete of ${ids.length} rows (>50).`)
  }
}

export function assertE2eFounder(doc: Pick<Founder, 'name' | 'email'>, token: string): void {
  if (!doc.name?.startsWith(E2E_STABLE_PREFIX)) {
    throw new Error(`Refusing delete: founder name lacks E2E__ marker (${doc.name}).`)
  }

  if (!doc.name.includes(token)) {
    throw new Error(`Refusing delete: founder name lacks run token (${doc.name}).`)
  }

  if (!doc.email?.includes('e2e+') || !doc.email.includes(token)) {
    throw new Error(`Refusing delete: founder email lacks e2e+ marker/token (${doc.email}).`)
  }
}

export function assertE2eStartup(doc: Pick<Startup, 'name'>, token: string): void {
  if (!doc.name?.startsWith(E2E_STABLE_PREFIX)) {
    throw new Error(`Refusing delete: startup name lacks E2E__ marker (${doc.name}).`)
  }

  if (!doc.name.includes(token)) {
    throw new Error(`Refusing delete: startup name lacks run token (${doc.name}).`)
  }
}
