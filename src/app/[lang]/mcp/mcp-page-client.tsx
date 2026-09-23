'use client'

import dynamic from 'next/dynamic'

const McpLayoutWrapper = dynamic(() => import('./mcp-layout-wrapper'), { ssr: false })

interface McpPageClientProps {
  lang: string
  userId: string
  userEmail: string
}

export default function McpPageClient({ lang, userId, userEmail }: McpPageClientProps) {
  return <McpLayoutWrapper lang={lang} userId={userId} userEmail={userEmail} />
}
