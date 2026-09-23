'use client'

import React from 'react'
import McpGuideContent from './mcp-guide-content'
import McpKeyManagerContent from './mcp-key-manager-content'
import SidebarFooter from '@/components/layout/sidebar-footer'
import MobileTabBar from '@/components/layout/mobile-tab-bar'

interface MobileMcpShellProps {
  lang: string
  userId: string
  userEmail: string
}

export default function MobileMcpShell({ lang, userId, userEmail }: MobileMcpShellProps) {
  const isKo = lang === 'ko'

  return (
    <>
      <div
        className="flex flex-col overflow-hidden"
        style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: 'var(--background)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'calc(56px + env(safe-area-inset-bottom))',
        }}
      >
        <header
          className="h-14 px-4 flex items-center shrink-0"
          style={{ borderBottom: '1px solid var(--border-strong)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {isKo ? 'MCP 연결' : 'MCP Connection'}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-8">
          <McpGuideContent lang={lang} />
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <McpKeyManagerContent lang={lang} userId={userId} />
          </div>
        </div>

        <SidebarFooter lang={lang} userEmail={userEmail} />
      </div>
      <MobileTabBar lang={lang} />
    </>
  )
}
