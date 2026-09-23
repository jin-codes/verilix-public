'use client'

import dynamic from 'next/dynamic'

const NotesLayoutWrapper = dynamic(() => import('./notes-layout-wrapper'), { ssr: false })

interface NotesPageClientProps {
  lang: string
  userEmail: string
}

export default function NotesPageClient({ lang, userEmail }: NotesPageClientProps) {
  return <NotesLayoutWrapper lang={lang} userEmail={userEmail} />
}
