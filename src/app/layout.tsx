import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { absoluteUrl } from '@/lib/url'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'NSRCEL Founder Directory',
    template: '%s | NSRCEL Founder Directory',
  },
  description:
    'Discover founders, learn from stories, and connect with opportunities across the startup ecosystem.',
  metadataBase: new URL(absoluteUrl('/')),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-black text-brand-white">{children}</body>
    </html>
  )
}
