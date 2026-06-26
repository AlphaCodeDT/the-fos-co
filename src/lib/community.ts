import type { Startup } from '@/payload-types'

const roleLabels: Record<NonNullable<Startup['team']>[number]['role'], string> = {
  founder: 'Founder',
  'co-founder': 'Co-Founder',
  ceo: 'CEO',
  cto: 'CTO',
  cpo: 'CPO',
  advisor: 'Advisor',
}

export function formatTeamRole(role: NonNullable<Startup['team']>[number]['role']): string {
  return roleLabels[role] || role
}
