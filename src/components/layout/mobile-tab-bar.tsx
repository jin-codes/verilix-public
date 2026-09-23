'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plug, Library } from 'lucide-react'

interface MobileTabBarProps {
  lang: string
}

const TABS = [
  { id: 'mcp', match: '/mcp', icon: Plug, label: { ko: 'MCP', en: 'MCP' } },
  { id: 'notes', match: '/notes', icon: Library, label: { ko: '지식 베이스', en: 'Knowledge' } },
] as const

export default function MobileTabBar({ lang }: MobileTabBarProps) {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex items-stretch"
      style={{
        zIndex: 40,
        backgroundColor: 'var(--sidebar)',
        borderTop: '1px solid var(--border-strong)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = pathname?.includes(tab.match) ?? false
        return (
          <Link
            key={tab.id}
            href={`/${lang}${tab.match}`}
            className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2"
            style={{ color: isActive ? 'var(--primary)' : 'var(--text-secondary)' }}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-[11px] truncate" style={{ fontWeight: isActive ? 500 : 400 }}>
              {lang === 'ko' ? tab.label.ko : tab.label.en}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
