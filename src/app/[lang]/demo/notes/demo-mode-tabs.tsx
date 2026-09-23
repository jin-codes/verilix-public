'use client'

import React from 'react'
import Link from 'next/link'
import { Plug, Library } from 'lucide-react'

interface DemoModeTabsProps {
  lang: string
}

// 실제 ModeTabs(src/components/layout/mode-tabs.tsx)와 같은 스타일이지만, 데모에는 실 세션이
// 없어 탭 목적지가 다르다 — 지식 베이스는 이 데모 화면 자체(항상 활성), MCP는 실제 기능이
// 없으므로 랜딩 페이지의 MCP 연결 섹션으로 안내한다.
export default function DemoModeTabs({ lang }: DemoModeTabsProps) {
  return (
    <div
      className="h-14 flex items-center gap-1.5 px-2 shrink-0"
      style={{ borderBottom: '1px solid var(--border-strong)' }}
    >
      <Link
        href={`/${lang}#connect`}
        className="flex-1 min-w-0 flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm cursor-pointer transition-colors duration-150"
        style={{ backgroundColor: 'transparent', border: '1px solid transparent', color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(200,197,188,0.35)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <Plug className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">MCP</span>
      </Link>
      <span
        className="flex-1 min-w-0 flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm"
        style={{
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          color: 'var(--foreground)',
          fontWeight: 500,
        }}
      >
        <Library className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{lang === 'ko' ? '지식 베이스' : 'Knowledge'}</span>
      </span>
    </div>
  )
}
