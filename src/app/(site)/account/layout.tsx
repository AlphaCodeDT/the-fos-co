import { SiteFooter } from '@/components/layout/site-chrome'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { requireFounder } from '@/lib/auth/founder'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('Account'),
}

/** Allow sharp + S3 upload pipeline to finish on Vercel serverless. */
export const maxDuration = 60

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireFounder()

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}
