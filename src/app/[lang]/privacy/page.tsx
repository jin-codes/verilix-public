import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { hasLocale } from '../dictionaries'
import { LegalPage } from '@/components/legal/legal-page'
import { getPrivacy, LEGAL_UPDATED } from '@/lib/legal/content'

interface Props {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  return { title: getPrivacy(lang).title, alternates: {
      canonical: `/${lang}/privacy`,
      languages: { ko: '/ko/privacy', en: '/en/privacy', 'x-default': '/ko/privacy' },
    } }
}

export default async function Page({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return <LegalPage doc={getPrivacy(lang)} lang={lang} updated={LEGAL_UPDATED} />
}
