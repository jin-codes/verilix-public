'use client'

import React from 'react'
import SidebarShell from '@/components/layout/sidebar-shell'
import McpKeyManagerContent from './mcp-key-manager-content'

interface McpKeyListProps {
  lang: string
  userId: string
  userEmail?: string
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export default function McpKeyList({ lang, userId, userEmail = '', isCollapsed, onToggleCollapse }: McpKeyListProps) {
  const isKo = lang === 'ko'

  return (
    <SidebarShell
      lang={lang}
      userEmail={userEmail}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      collapseLabel={{
        expand: isKo ? 'API 키 목록 펼치기' : 'Expand API key list',
        collapse: isKo ? 'API 키 목록 접기' : 'Collapse API key list',
      }}
    >
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <McpKeyManagerContent lang={lang} userId={userId} />
      </div>
    </SidebarShell>
  )
}
