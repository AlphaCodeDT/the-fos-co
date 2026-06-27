export const STARTUP_STAGE_OPTIONS = [
  { label: 'Idea', value: 'idea' },
  { label: 'MVP', value: 'mvp' },
  { label: 'Early Revenue', value: 'early-revenue' },
  { label: 'Growth', value: 'growth' },
  { label: 'Scaling', value: 'scaling' },
] as const

export const TEAM_ROLE_OPTIONS = [
  { label: 'Founder', value: 'founder' },
  { label: 'Co-Founder', value: 'co-founder' },
  { label: 'CEO', value: 'ceo' },
  { label: 'CTO', value: 'cto' },
  { label: 'CPO', value: 'cpo' },
  { label: 'Advisor', value: 'advisor' },
] as const

export const OPPORTUNITY_TYPE_OPTIONS = [
  { label: 'Job', value: 'job' },
  { label: 'Internship', value: 'internship' },
  { label: 'Co-founder', value: 'co-founder' },
  { label: 'Partnership', value: 'partnership' },
] as const

export const selectClassName =
  'flex h-10 w-full rounded-md border border-brand-white/20 bg-brand-black px-3 text-sm text-brand-white'

export const textareaClassName =
  'flex w-full rounded-md border border-brand-white/20 bg-brand-black px-3 py-2 text-sm text-brand-white placeholder:text-brand-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow'
