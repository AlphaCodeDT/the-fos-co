import Link from 'next/link'

import { getCurrentFounder } from '@/lib/auth/founder'
import { logoutAction } from '@/lib/auth/actions'
import { siteConfig } from '@/lib/site'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/founders', label: 'Founders' },
  { href: '/startups', label: 'Startups' },
  { href: '/stories', label: 'Stories' },
  { href: '/feed.xml', label: 'RSS' },
]

export async function SiteHeader() {
  const founder = await getCurrentFounder()

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
      </div>
    </header>
  )
}
