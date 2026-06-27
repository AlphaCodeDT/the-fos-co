import { Suspense } from 'react'

import ResetPasswordClient from './ResetPasswordClient'
import { AuthPageLayout } from '@/components/layout/AuthPageLayout'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('Reset password'),
}

export default function ResetPasswordPageWrapper() {
  return (
    <AuthPageLayout>
      <Suspense fallback={<p className="text-center text-brand-white/60">Loading…</p>}>
        <ResetPasswordClient />
      </Suspense>
    </AuthPageLayout>
  )
}
