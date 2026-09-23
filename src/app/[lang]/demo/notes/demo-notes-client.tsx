'use client'

import dynamic from 'next/dynamic'

const DemoNotesLayout = dynamic(() => import('./demo-notes-layout'), { ssr: false })

interface DemoNotesClientProps {
  lang: string
}

export default function DemoNotesClient({ lang }: DemoNotesClientProps) {
  return <DemoNotesLayout lang={lang} />
}
