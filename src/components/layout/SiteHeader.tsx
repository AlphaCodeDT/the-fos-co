import Link from 'next/link'

import { getCurrentFounder } from '@/lib/auth/founder'
import { logoutAction } from '@/lib/auth/actions'
import { siteConfig } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { MobileNav } from '@/components/layout/MobileNav'

const navItems = [
  { href: '/founders', label: 'Founders' },
  { href: '/startups', label: 'Startups' },
  { href: '/programs', label: 'Programs' },
  { href: '/stories', label: 'Stories' },
  { href: '/feed.xml', label: 'RSS' },
]

export async function SiteHeader() {
  const founder = await getCurrentFounder()

  return (
    <header className="border-b border-brand-white/10 bg-brand-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:py-5">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-brand-black">
            {siteConfig.logoInitials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-brand-white group-hover:text-brand-yellow">
              {siteConfig.name}
            </p>
            <p className="hidden text-xs text-brand-white/60 lg:block">{siteConfig.tagline}</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-white/80 transition-colors hover:text-brand-yellow"
            >
              {item.label}
            </Link>
          ))}
          {founder ? (
            <>
              <Link
                href="/account"
                className="text-sm font-medium text-brand-white/80 transition-colors hover:text-brand-yellow"
              >
                Account
              </Link>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm" className="text-brand-white/80">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-brand-white/80 transition-colors hover:text-brand-yellow"
              >
                Sign in
              </Link>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
        <MobileNav navItems={navItems} isLoggedIn={Boolean(founder)} />
      </div>
    </header>
  )
}
