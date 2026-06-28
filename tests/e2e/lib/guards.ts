import type { Founder, Organization, Startup } from '../../../src/payload-types'

import { E2E_STABLE_PREFIX } from './constants'

export function requireE2eProdGuard(): void {
  if (process.env.E2E_ALLOW_PROD !== 'true') {
    throw new Error('Refusing to run E2E without E2E_ALLOW_PROD=true')
  }
}

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

export function assertE2eOrganization(
  doc: Pick<Organization, 'name' | 'slug'>,
  token: string,
): void {
  if (!doc.name?.startsWith(E2E_STABLE_PREFIX)) {
    throw new Error(`Refusing delete: organization name lacks E2E__ marker (${doc.name}).`)
  }

  if (!doc.slug?.startsWith('e2e-org')) {
    throw new Error(`Refusing delete: organization slug lacks e2e-org prefix (${doc.slug}).`)
  }

  if (!doc.name.includes(token) && !doc.slug.includes(token)) {
    throw new Error(`Refusing delete: organization lacks run token (${doc.name} / ${doc.slug}).`)
  }
}
