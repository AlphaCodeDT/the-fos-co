import { getPayloadClient } from '@/lib/payload'
import type { Organization, Program } from '@/payload-types'

export const APP_TIMEZONE = 'Asia/Calcutta'

const istDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Calendar date in IST as YYYY-MM-DD. */
export function toDateOnly(iso: string): string {
  return istDateFormatter.format(new Date(iso))
}

export function getToday(): string {
  return istDateFormatter.format(new Date())
}

export function isProgramUpcoming(
  program: Pick<Program, 'startDate' | 'endDate'>,
  today: string = getToday(),
): boolean {
  const start = program.startDate ? toDateOnly(program.startDate) : null
  const end = program.endDate ? toDateOnly(program.endDate) : null

  if (!start && !end) return true
  if (end) return end >= today
  return (start ?? '') >= today
}

function sortProgramsByStartDate(programs: Program[]): Program[] {
  return [...programs].sort((a, b) => {
    const aStart = a.startDate ? toDateOnly(a.startDate) : null
    const bStart = b.startDate ? toDateOnly(b.startDate) : null

    if (!aStart && !bStart) return 0
    if (!aStart) return 1
    if (!bStart) return -1
    return aStart.localeCompare(bStart)
  })
}

function filterUpcoming(programs: Program[]): Program[] {
  const today = getToday()
  return sortProgramsByStartDate(programs.filter((program) => isProgramUpcoming(program, today)))
}

const programCardSelect = {
  name: true,
  slug: true,
  cohort: true,
  startDate: true,
  endDate: true,
  applicationUrl: true,
  mode: true,
  location: true,
  organization: true,
} as const

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'programs',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 1,
  })

  return (result.docs[0] as Program | undefined) ?? null
}

export async function getUpcomingProgramsForOrganization(orgId: number): Promise<Program[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'programs',
    where: {
      and: [{ organization: { equals: orgId } }, { status: { equals: 'published' } }],
    },
    limit: 100,
    depth: 0,
    select: programCardSelect,
  })

  return filterUpcoming(result.docs as Program[])
}

export async function getAllUpcomingPrograms(): Promise<Program[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'programs',
    where: {
      status: { equals: 'published' },
    },
    limit: 200,
    depth: 1,
    select: programCardSelect,
  })

  return filterUpcoming(result.docs as Program[])
}

const displayDateFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export function formatProgramDate(iso?: string | null): string | null {
  if (!iso) return null
  return displayDateFormatter.format(new Date(iso))
}

export function formatProgramDateRange(
  startDate?: string | null,
  endDate?: string | null,
): string | null {
  const start = formatProgramDate(startDate)
  const end = formatProgramDate(endDate)

  if (start && end) return `${start} – ${end}`
  if (start) return `Starts ${start}`
  if (end) return `Ends ${end}`
  return null
}

const MODE_LABELS: Record<NonNullable<Program['mode']>, string> = {
  online: 'Online',
  'in-person': 'In person',
  hybrid: 'Hybrid',
}

export function formatProgramMode(mode?: Program['mode'] | null): string | null {
  if (!mode) return null
  return MODE_LABELS[mode] ?? mode
}

export function resolveProgramOrganization(
  organization: Program['organization'],
): Organization | null {
  if (organization && typeof organization === 'object') {
    return organization
  }
  return null
}
