import { siteConfig } from '@/lib/site'
import { cn } from '@/lib/utils'

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
