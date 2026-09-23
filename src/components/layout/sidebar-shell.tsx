'use client'

import React from 'react'
import { PanelLeft } from 'lucide-react'
import ModeTabs from '@/components/layout/mode-tabs'
import SidebarFooter from '@/components/layout/sidebar-footer'
import LogoLockup from '@/components/layout/logo-lockup'

interface SidebarShellProps {
  lang: string
  userEmail?: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  collapseLabel: { expand: string; collapse: string }
  children: React.ReactNode
  // 기본값은 실제 ModeTabs/SidebarFooter(Chat·MCP·지식 베이스 등 실 세션용). 데모처럼 다른
  // 헤더/푸터가 필요한 화면만 이 둘을 넘겨 동일한 셸 레이아웃(로고+토글+220px 패널)을 재사용한다.
  modeTabs?: React.ReactNode
  footer?: React.ReactNode
}

const WIDTH = '220px'

export default function SidebarShell({
  lang,
  userEmail = '',
  isCollapsed,
  onToggleCollapse,
  collapseLabel,
  children,
  modeTabs,
  footer,
}: SidebarShellProps) {
  return (
    <>
      {/* Fixed to the viewport corner so it never moves, even while the panel is collapsed */}
      <button
        onClick={onToggleCollapse}
        title={isCollapsed ? collapseLabel.expand : collapseLabel.collapse}
        className="fixed top-3 left-3 flex items-center justify-center rounded-sm cursor-pointer transition-colors"
        style={{
          width: '32px',
          height: '32px',
          zIndex: 50,
          backgroundColor: 'transparent',
          color: 'var(--secondary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--foreground)'
          e.currentTarget.style.backgroundColor = 'rgba(200,197,188,0.35)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--secondary)'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <PanelLeft className="w-4 h-4" />
      </button>

      <aside
        className="relative h-screen shrink-0"
        style={{ width: isCollapsed ? '0px' : WIDTH, transition: 'width 200ms ease', overflow: 'visible' }}
      >
        <div
          className="flex flex-col h-full select-none font-sans"
          style={{
            width: WIDTH,
            height: '100%',
            overflow: 'visible',
            backgroundColor: 'var(--sidebar)',
            borderRight: '1px solid var(--border-strong)',
            opacity: isCollapsed ? 0 : 1,
            transition: 'opacity 150ms ease',
            pointerEvents: isCollapsed ? 'none' : 'auto',
          }}
        >
          {/* Top strip: left padding clears the fixed toggle button; logo sits to its right */}
          <div className="h-12 flex items-center pl-12 pr-3 shrink-0">
            <LogoLockup className="h-[22px] w-auto" />
          </div>
          {modeTabs ?? <ModeTabs lang={lang} />}
          <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
          {footer ?? <SidebarFooter lang={lang} userEmail={userEmail} />}
        </div>
      </aside>
    </>
  )
}
