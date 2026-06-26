import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { buildSiteMetadata } from '@/lib/site'
import { absoluteUrl } from '@/lib/url'

import '../globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  ...buildSiteMetadata(),
  metadataBase: new URL(absoluteUrl('/')),
}

export const dynamic = 'force-dynamic'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-black text-brand-white">{children}</body>
    </html>
  )
}
