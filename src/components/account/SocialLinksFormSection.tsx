import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SocialLinksData } from '@/lib/social-links'

const SOCIAL_FIELDS = [
  { name: 'linkedIn' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
  { name: 'twitter' as const, label: 'X (Twitter)', placeholder: 'https://x.com/...' },
  { name: 'instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { name: 'facebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { name: 'youtube' as const, label: 'YouTube', placeholder: 'https://youtube.com/...' },
  { name: 'github' as const, label: 'GitHub', placeholder: 'https://github.com/...' },
  { name: 'website' as const, label: 'Website', placeholder: 'https://example.com' },
]

export function SocialLinksFormSection({ values }: { values: SocialLinksData }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium text-brand-white">Social links</legend>
      <p className="text-xs text-brand-white/50">Optional. URLs must start with http:// or https://.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {SOCIAL_FIELDS.map(({ name, label, placeholder }) => (
          <div key={name} className={`space-y-2 ${name === 'website' ? 'sm:col-span-2' : ''}`}>
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              name={name}
              type="url"
              inputMode="url"
              placeholder={placeholder}
              defaultValue={values[name] || ''}
            />
          </div>
        ))}
      </div>
    </fieldset>
  )
}
