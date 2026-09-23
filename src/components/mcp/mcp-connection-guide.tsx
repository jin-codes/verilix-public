'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import McpGuideContent from './mcp-guide-content'

interface McpConnectionGuideProps {
  lang: string
  isSidebarCollapsed?: boolean
  onBack?: () => void
}

export default function McpConnectionGuide({ lang, isSidebarCollapsed = false, onBack }: McpConnectionGuideProps) {
  const isKo = lang === 'ko'

  return (
    <div
      className="flex-1 flex flex-col h-screen overflow-hidden font-sans"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <header
        className="h-14 pr-6 flex items-center gap-2 shrink-0"
        style={{ paddingLeft: isSidebarCollapsed ? '56px' : '24px', borderBottom: '1px solid var(--border)' }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            title={isKo ? '목록으로' : 'Back to list'}
            className="md:hidden p-1 -ml-1 rounded-sm cursor-pointer transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          {isKo ? '연결 방법' : 'How to connect'}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-8 select-text">
        <div className="max-w-2xl mx-auto">
          <McpGuideContent lang={lang} />
        </div>
      </div>
    </div>
  )
}
