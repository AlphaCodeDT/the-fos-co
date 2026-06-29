'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'

import { logoutAction } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export type MobileNavItem = {
  href: string
  label: string
}

type MobileNavProps = {
  navItems: MobileNavItem[]
  isLoggedIn: boolean
}

const navLinkClassName =
  'flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-brand-white/80 transition-colors hover:bg-brand-white/5 hover:text-brand-yellow'

export function MobileNav({ navItems, isLoggedIn }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  function closeSheet() {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-brand-white/80 hover:text-brand-yellow lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-2 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClassName} onClick={closeSheet}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-brand-white/10 pt-4">
          {isLoggedIn ? (
            <div className="flex flex-col gap-1">
              <Link href="/account" className={navLinkClassName} onClick={closeSheet}>
                Account
              </Link>
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="outline"
                  className="mt-2 w-full min-h-11 border-brand-white/20 bg-transparent text-brand-white hover:bg-brand-white/10"
                >
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" className={navLinkClassName} onClick={closeSheet}>
                Sign in
              </Link>
              <Button asChild className="min-h-11 w-full">
                <Link href="/signup" onClick={closeSheet}>
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
