import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from './dictionaries'
import { LandingNav } from '@/components/landing/landing-nav'
import { ScrollProgressBar } from '@/components/landing/scroll-progress-bar'
import { SectionRail } from '@/components/landing/section-rail'
import { HeroSection } from '@/components/landing/hero-section'
import { LoopSection } from '@/components/landing/loop-section'
import { DistillSection } from '@/components/landing/distill-section'
import { ConnectSection } from '@/components/landing/connect-section'
import { LibrarySection } from '@/components/landing/library-section'
import { CtaSection } from '@/components/landing/cta-section'
import { SITE_COPY, SITE_URL } from '@/lib/site'
import { LandingFooter } from '@/components/landing/landing-footer'

const RAIL_IDS = ['hero', 'loop', 'distill', 'connect', 'library'] as const

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const { landing } = dict

  const copy = SITE_COPY[lang]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'verilix',
        alternateName: ['Verilix', '베리릭스'],
        // 구글 사이트 이름은 홈(/)의 WebSite url을 기준으로 읽는다.
        url: `${SITE_URL}/`,
        inLanguage: lang,
      },
      {
        '@type': 'WebApplication',
        name: 'verilix',
        url: `${SITE_URL}/${lang}`,
        description: copy.description,
        inLanguage: lang,
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    ],
  }

  return (
    <main className="flex-1 overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ScrollProgressBar />
      <LandingNav lang={lang} loginLabel={landing.nav.login} signupLabel={landing.nav.signup} />
      <SectionRail
        items={RAIL_IDS.map((id, i) => ({ id, label: landing.rail[i] }))}
      />
      <HeroSection lang={lang} dict={landing.hero} />
      <LoopSection
        heading={landing.loop.heading}
        subheading={landing.loop.subheading}
        steps={landing.loop.steps}
      />
      <DistillSection dict={landing.distill} />
      <ConnectSection dict={landing.connect} />
      <LibrarySection
        heading={landing.library.heading}
        subheading={landing.library.subheading}
        items={landing.library.items}
      />
      <CtaSection lang={lang} dict={landing.cta} />
      <LandingFooter tagline={landing.footer.tagline} lang={lang} />
    </main>
  )
}
