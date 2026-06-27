import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Vercel default 1MB cap blocks logo/avatar uploads via Server Actions.
      bodySizeLimit: '4mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'cfptjzzjljqfnslfcbcq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default withPayload(nextConfig)
