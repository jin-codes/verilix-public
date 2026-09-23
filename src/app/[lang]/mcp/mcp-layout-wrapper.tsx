'use client'

import React from 'react'
import McpKeyList from '@/components/mcp/mcp-key-list'
import McpConnectionGuide from '@/components/mcp/mcp-connection-guide'
import MobileMcpShell from '@/components/mcp/mobile-mcp-shell'
import { usePersistedCollapse } from '@/lib/use-persisted-collapse'
import { useIsMobile } from '@/lib/use-is-mobile'

interface McpLayoutWrapperProps {
  lang: string
  userId: string
  userEmail: string
}

export default function McpLayoutWrapper({ lang, userId, userEmail }: McpLayoutWrapperProps) {
  const { isCollapsed: isListCollapsed, toggle: toggleListCollapsed } = usePersistedCollapse()
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileMcpShell lang={lang} userId={userId} userEmail={userEmail} />
  }

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: '100vh', width: '100vw', backgroundColor: 'var(--background)' }}
    >
      {/* 1. API Key List (mode tabs + list, merged) */}
      <McpKeyList
        lang={lang}
        userId={userId}
        userEmail={userEmail}
        isCollapsed={isListCollapsed}
        onToggleCollapse={toggleListCollapsed}
      />

      {/* 2. Connection Guide */}
      <McpConnectionGuide lang={lang} isSidebarCollapsed={isListCollapsed} />
    </div>
  )
}
