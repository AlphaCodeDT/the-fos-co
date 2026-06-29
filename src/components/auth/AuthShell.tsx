import Link from 'next/link'

import { cn } from '@/lib/utils'

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-brand-white/10 bg-brand-black/60 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">Founder account</p>
      <h1 className="mt-2 text-2xl font-bold text-brand-white">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-brand-white/60">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  )
}

export function AuthMessage({ error, success }: { error?: string; success?: string }) {
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

export function AuthFooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <p className="mt-6 text-center text-sm text-brand-white/60">
      <Link href={href} className="text-brand-yellow hover:underline">
        {children}
      </Link>
    </p>
  )
}
