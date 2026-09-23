import { notFound } from 'next/navigation'
import { hasLocale } from '../../dictionaries'
import DemoNoticeGate from './demo-notice-gate'
import DemoNotesClient from './demo-notes-client'

interface Props {
  params: Promise<{ lang: string }>
}

// 마케팅용 가상 데모 — 검색엔진에는 색인하지 않는다
export const metadata = {
  robots: { index: false, follow: false },
}

export default async function DemoNotesPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  return (
    <DemoNoticeGate lang={lang}>
      <DemoNotesClient lang={lang} />
    </DemoNoticeGate>
  )
}
