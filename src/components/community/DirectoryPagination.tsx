import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type DirectoryPaginationProps = {
  basePath: string
  currentParams: Record<string, string | string[] | undefined>
  page: number
  totalPages: number
  className?: string
}

export function DirectoryPagination({
  basePath,
  currentParams,
  page,
  totalPages,
  className,
}: DirectoryPaginationProps) {
  if (totalPages <= 1) return null

  function pageHref(targetPage: number) {
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(currentParams)) {
      if (key === 'page') continue
      const normalized = Array.isArray(value) ? value[0] : value
      if (normalized) params.set(key, normalized)
    }

    if (targetPage > 1) {
      params.set('page', String(targetPage))
    }

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  const prevHref = page > 1 ? pageHref(page - 1) : null
  const nextHref = page < totalPages ? pageHref(page + 1) : null

  return (
    <nav
      className={cn('flex flex-wrap items-center justify-between gap-4 pt-8', className)}
      aria-label="Pagination"
    >
      <p className="text-sm text-brand-white/60">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {prevHref ? (
          <Button
            asChild
            variant="outline"
            className="border-brand-white/20 bg-transparent text-brand-white hover:bg-brand-white/10"
          >
            <Link href={prevHref}>Previous</Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled
            className="border-brand-white/20 bg-transparent text-brand-white/40"
          >
            Previous
          </Button>
        )}
        {nextHref ? (
          <Button
            asChild
            variant="outline"
            className="border-brand-white/20 bg-transparent text-brand-white hover:bg-brand-white/10"
          >
            <Link href={nextHref}>Next</Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled
            className="border-brand-white/20 bg-transparent text-brand-white/40"
          >
            Next
          </Button>
        )}
      </div>
    </nav>
  )
}
