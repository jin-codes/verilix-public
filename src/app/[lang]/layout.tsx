import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { InlineScript } from '@/components/inline-script'
import { SITE_COPY, SITE_URL } from '@/lib/site'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  const copy = lang === 'en' ? SITE_COPY.en : SITE_COPY.ko
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: copy.title, template: '%s | verilix' },
    description: copy.description,
    keywords: [...copy.keywords],
    applicationName: 'verilix',
    alternates: {
      // 하위 페이지는 각자 path를 덮어쓰지 않으면 이 canonical(현재 locale 루트)을 상속한다.
      canonical: `/${lang}`,
      languages: { ko: '/ko', en: '/en', 'x-default': '/ko' },
    },
    openGraph: {
      type: 'website',
      siteName: 'verilix',
      title: copy.title,
      description: copy.description,
      url: `/${lang}`,
      locale: copy.locale,
      alternateLocale: lang === 'en' ? 'ko_KR' : 'en_US',
    },
    twitter: { card: 'summary_large_image', title: copy.title, description: copy.description },
    robots: { index: true, follow: true },
    // 검색엔진 소유 확인 토큰(선택). Search Console/네이버 서치어드바이저에서 발급받아 환경변수로 주입.
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
        ? { 'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }
        : undefined,
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export async function generateStaticParams() {
  return [{ lang: 'ko' }, { lang: 'en' }]
}

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var isDark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark)document.documentElement.classList.add('dark')}catch(e){}})()`

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  return (
    <html lang={lang} className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <InlineScript html={THEME_INIT_SCRIPT} />
      </head>
      <body className="min-h-full flex flex-col bg-bg font-sans">
        {children}
      </body>
    </html>
  )
}
