import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'
import { FiGlobe } from 'react-icons/fi'

import type { SocialLinksData } from '@/lib/social-links'
import { cn } from '@/lib/utils'

type SocialLinksProps = {
  links: SocialLinksData
  className?: string
  /** Show at most this many icons (for compact card layouts). */
  limit?: number
  iconClassName?: string
  /** When false, render non-link icons (e.g. inside a card that is already a link). */
  asLink?: boolean
}

type LinkConfig = {
  field: keyof SocialLinksData
  label: string
  Icon: typeof FaLinkedinIn
}

const LINK_CONFIG: LinkConfig[] = [
  { field: 'linkedIn', label: 'LinkedIn', Icon: FaLinkedinIn },
  { field: 'twitter', label: 'X (Twitter)', Icon: FaXTwitter },
  { field: 'instagram', label: 'Instagram', Icon: FaInstagram },
  { field: 'facebook', label: 'Facebook', Icon: FaFacebookF },
  { field: 'youtube', label: 'YouTube', Icon: FaYoutube },
  { field: 'github', label: 'GitHub', Icon: FaGithub },
  { field: 'website', label: 'Website', Icon: FiGlobe },
]

const iconButtonClassName =
  'inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-white/15 text-brand-white/70 transition-colors hover:border-brand-yellow/50 hover:bg-brand-yellow/10 hover:text-brand-yellow'

export function SocialLinks({
  links,
  className,
  limit,
  iconClassName,
  asLink = true,
}: SocialLinksProps) {
  const active = LINK_CONFIG.filter((config) => Boolean(links[config.field]?.trim()))
  const visible = typeof limit === 'number' ? active.slice(0, limit) : active

  if (visible.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {visible.map(({ field, label, Icon }) => {
        const href = links[field]?.trim()
        if (!href) return null

        if (!asLink) {
          return (
            <span
              key={field}
              aria-hidden
              className={cn(iconButtonClassName, iconClassName)}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          )
        }

        return (
          <a
            key={field}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={cn(iconButtonClassName, iconClassName)}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </a>
        )
      })}
    </div>
  )
}
