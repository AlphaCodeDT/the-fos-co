import Link from 'next/link'

import { siteConfig } from '@/lib/site'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/stories', label: 'Stories' },
  { href: '/feed.xml', label: 'RSS' },
]

export function SiteHeader() {
  return (
    <header className="border-b border-brand-white/10 bg-brand-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="group flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-brand-black">
            {siteConfig.logoInitials}
          </span>
          <div>
            <p className="text-lg font-semibold text-brand-white group-hover:text-brand-yellow">
              {siteConfig.name}
            </p>
            <p className="text-xs text-brand-white/60">{siteConfig.tagline}</p>
          </div>
        </Link>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-white/80 transition-colors hover:text-brand-yellow"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn('border-t border-brand-white/10 bg-brand-black', className)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-brand-white">{siteConfig.name}</p>
          <p className="mt-1 text-sm text-brand-white/60">{siteConfig.footerDescription}</p>
        </div>
        <p className="text-sm text-brand-white/50">
          © {new Date().getFullYear()} {siteConfig.copyrightHolder}
        </p>
      </div>
    </footer>
  )
}
