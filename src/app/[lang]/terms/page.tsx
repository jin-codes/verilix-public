import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { hasLocale } from '../dictionaries'
import { LegalPage } from '@/components/legal/legal-page'
import { getTerms, LEGAL_UPDATED } from '@/lib/legal/content'

interface Props {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  return { title: getTerms(lang).title, alternates: {
      canonical: `/${lang}/terms`,
      languages: { ko: '/ko/terms', en: '/en/terms', 'x-default': '/ko/terms' },
    } }
}

export default async function Page({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return <LegalPage doc={getTerms(lang)} lang={lang} updated={LEGAL_UPDATED} />
}
