export const siteConfig = {
  name: 'Founders of Startups',
  logoInitials: 'FoS',
  tagline: 'Discover · Learn · Connect',
  description:
    'Founder stories, startup news, and ecosystem insights — starting with the NSRCEL community and built for multi-organization scale.',
  heroHeadline: 'Discover founders. Learn from stories. Connect with opportunity.',
  heroDescription:
    'Founders of Startups is the editorial home for founder journeys, startup news, and ecosystem intelligence — starting with the NSRCEL community and built for multi-organization scale from day one.',
  footerDescription:
    'A startup ecosystem platform for founders, stories, and opportunities.',
  copyrightHolder: 'Founders of Startups',
  rssDescription: 'Founder stories, interviews, and startup news.',
  homeTitle: 'Discover, Learn, Connect',
} as const

export function formatPageTitle(pageTitle: string): string {
  return `${pageTitle} · ${siteConfig.name}`
}

export function buildSiteMetadata() {
  return {
    title: {
      default: siteConfig.name,
      template: `%s · ${siteConfig.name}`,
    },
    description: siteConfig.description,
    openGraph: {
      siteName: siteConfig.name,
      type: 'website' as const,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: siteConfig.name,
      description: siteConfig.description,
    },
  }
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    description: siteConfig.description,
  }
}
