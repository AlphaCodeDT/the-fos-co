export const ORG_TYPE_OPTIONS = [
  { label: 'Incubator', value: 'incubator' },
  { label: 'Accelerator', value: 'accelerator' },
  { label: 'Investor', value: 'investor' },
  { label: 'Venture Capital', value: 'venture-capital' },
  { label: 'Angel Network', value: 'angel-network' },
  { label: 'University', value: 'university' },
  { label: 'Startup Community', value: 'startup-community' },
  { label: 'Government Program', value: 'government-program' },
  { label: 'Coworking Space', value: 'coworking-space' },
  { label: 'Innovation Hub', value: 'innovation-hub' },
  { label: 'Corporate Innovation', value: 'corporate-innovation' },
  { label: 'Other', value: 'other' },
] as const

export type OrgType = (typeof ORG_TYPE_OPTIONS)[number]['value']

const ORG_TYPE_LABEL_BY_VALUE: Record<OrgType, string> = {
  incubator: 'Incubator',
  accelerator: 'Accelerator',
  investor: 'Investor',
  'venture-capital': 'Venture Capital',
  'angel-network': 'Angel Network',
  university: 'University',
  'startup-community': 'Startup Community',
  'government-program': 'Government Program',
  'coworking-space': 'Coworking Space',
  'innovation-hub': 'Innovation Hub',
  'corporate-innovation': 'Corporate Innovation',
  other: 'Other',
}

/** Profile subsection heading derived from org type. */
const ORG_TYPE_GROUP_LABEL: Record<OrgType, OrgGroupLabel> = {
  incubator: 'Incubated at',
  accelerator: 'Accelerated by',
  investor: 'Backed by',
  'venture-capital': 'Backed by',
  'angel-network': 'Backed by',
  university: 'Affiliated with',
  'government-program': 'Supported by',
  'startup-community': 'Supported by',
  'coworking-space': 'Supported by',
  'innovation-hub': 'Supported by',
  'corporate-innovation': 'Supported by',
  other: 'Backed by',
}

export const ORG_TYPE_GROUP_ORDER = [
  'Incubated at',
  'Accelerated by',
  'Backed by',
  'Affiliated with',
  'Supported by',
] as const

export type OrgGroupLabel = (typeof ORG_TYPE_GROUP_ORDER)[number]

export function isOrgType(value: string | null | undefined): value is OrgType {
  return Boolean(value && value in ORG_TYPE_LABEL_BY_VALUE)
}

export function formatOrgTypeLabel(value: string | null | undefined): string {
  if (!value || !isOrgType(value)) return 'Organization'
  return ORG_TYPE_LABEL_BY_VALUE[value]
}

export function getOrgGroupLabel(type: string | null | undefined): OrgGroupLabel {
  if (!type || !isOrgType(type)) return 'Backed by'
  return ORG_TYPE_GROUP_LABEL[type]
}

export function formatOrganizationChipLabel(name: string, type: string | null | undefined): string {
  const typeLabel = formatOrgTypeLabel(type)
  return typeLabel === 'Organization' ? name : `${name} · ${typeLabel}`
}
