import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

export type RunState = {
  token: string
  founderPassword: string
  founders: {
    primary: number
    secondary: number
  }
  startups: {
    claimable: number
    orgLinked: number
  }
  organizations: {
    published: number
    draft: number
  }
  programs: {
    upcoming: number
    past: number
  }
  createdIds: {
    founders: number[]
    startups: number[]
    organizations: number[]
    programs: number[]
    media: number[]
  }
  storagePrefix: string
}

const STATE_DIR = path.join(process.cwd(), 'tests', 'e2e')
export const RUN_STATE_PATH = path.join(STATE_DIR, '.run-state.json')

export function readRunState(): RunState | null {
  try {
    const raw = readFileSync(RUN_STATE_PATH, 'utf8')
    return JSON.parse(raw) as RunState
  } catch {
    return null
  }
}

export function writeRunState(state: RunState): void {
  mkdirSync(STATE_DIR, { recursive: true })
  writeFileSync(RUN_STATE_PATH, JSON.stringify(state, null, 2), 'utf8')
}

export function appendCreatedId(
  collection: keyof RunState['createdIds'],
  id: number,
): void {
  const state = readRunState()
  if (!state) {
    throw new Error('E2E run state not found; cannot append created ID.')
  }

  if (!state.createdIds[collection].includes(id)) {
    state.createdIds[collection].push(id)
  }

  writeRunState(state)
}

export function collectAllIds(state: RunState): {
  founders: number[]
  startups: number[]
  organizations: number[]
  programs: number[]
  media: number[]
} {
  const founders = [
    state.founders.primary,
    state.founders.secondary,
    ...state.createdIds.founders,
  ]
  const startups = [
    state.startups.claimable,
    state.startups.orgLinked,
    ...state.createdIds.startups,
  ]
  const organizations = [
    state.organizations.published,
    state.organizations.draft,
    ...state.createdIds.organizations,
  ]
  const programs = [
    state.programs.upcoming,
    state.programs.past,
    ...state.createdIds.programs,
  ]
  const media = [...state.createdIds.media]

  return {
    founders: [...new Set(founders)],
    startups: [...new Set(startups)],
    organizations: [...new Set(organizations)],
    programs: [...new Set(programs)],
    media: [...new Set(media)],
  }
}
