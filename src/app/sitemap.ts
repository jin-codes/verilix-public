import type { MetadataRoute } from 'next'
import { LOCALES, SITE_URL } from '@/lib/site'

// 색인 대상 공개 페이지(랜딩)만 나열. 각 항목에 ko/en hreflang 대응을 붙인다.
// 콘텐츠를 실제로 바꿀 때만 갱신 (요청마다 바뀌는 날짜는 크롤러 신뢰를 깎는다)
const LAST_MODIFIED = '2026-10-13'
const PATHS = ['', '/terms', '/privacy']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date(LAST_MODIFIED)
  return PATHS.flatMap((path) =>
    LOCALES.map((lang) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? ('weekly' as const) : ('yearly' as const),
      priority: path === '' ? 1 : 0.3,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`]),
        ),
      },
    })),
  )
}
