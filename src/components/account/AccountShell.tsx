import Link from 'next/link'

import { cn } from '@/lib/utils'

const accountNav = [
  { href: '/account', label: 'Overview', exact: true },
  { href: '/account/profile', label: 'My profile' },
  { href: '/account/startups', label: 'My startups' },
  { href: '/account/claims', label: 'Claims' },
  { href: '/account/settings', label: 'Settings' },
]

function AccountNavLink({
  item,
  active,
  className,
}: {
  item: (typeof accountNav)[number]
  active: boolean
  className?: string
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        'block rounded-lg px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-brand-yellow/10 text-brand-yellow'
          : 'text-brand-white/70 hover:bg-brand-white/5 hover:text-brand-white',
        className,
      )}
    >
      {item.label}
    </Link>
  )
}

export function AccountShell({
  title,
  description,
  children,
  currentPath,
}: {
  title: string
  description?: string
  children: React.ReactNode
  currentPath: string
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-12 md:flex-row md:gap-8">
      <div className="sticky top-0 z-10 -mx-4 border-b border-brand-white/10 bg-brand-black/95 px-4 pb-3 backdrop-blur md:hidden">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">Account</p>
        <nav className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {accountNav.map((item) => {
            const active = item.exact
              ? currentPath === item.href
              : currentPath.startsWith(item.href)

            return (
              <AccountNavLink
                key={item.href}
                item={item}
                active={active}
                className="min-h-11 shrink-0 whitespace-nowrap px-4"
              />
            )
          })}
        </nav>
      </div>

      <aside className="hidden w-full max-w-52 shrink-0 md:block">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">Account</p>
        <nav className="mt-4 space-y-1">
          {accountNav.map((item) => {
            const active = item.exact
              ? currentPath === item.href
              : currentPath.startsWith(item.href)

            return <AccountNavLink key={item.href} item={item} active={active} />
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <h1 className="text-3xl font-bold text-brand-white">{title}</h1>
        {description ? <p className="mt-2 text-brand-white/60">{description}</p> : null}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}

export function StatusCard({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'warning' | 'success'
}) {
  return (
    <div className="rounded-2xl border border-brand-white/10 bg-brand-black/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">{label}</p>
      <p
        className={cn(
          'mt-2 text-sm',
          tone === 'success' && 'text-brand-yellow',
          tone === 'warning' && 'text-amber-300',
          tone === 'default' && 'text-brand-white/80',
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null

  return (
    <div
      className={cn(
        'mb-4 rounded-lg border px-3 py-2 text-sm',
        error
          ? 'border-red-500/40 bg-red-500/10 text-red-200'
          : 'border-brand-yellow/40 bg-brand-yellow/10 text-brand-yellow',
      )}
      role={error ? 'alert' : 'status'}
    >
      {error || success}
    </div>
  )
}
