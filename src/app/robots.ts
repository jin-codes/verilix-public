import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// 로그인 뒤 화면·API는 색인 가치가 없으므로 크롤 대상에서 제외한다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/',
        '/*/admin',
        '/*/settings',
        '/*/mcp',
        '/*/notes',
        '/*/onboarding',
        '/*/set-password',
        '/*/demo',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
