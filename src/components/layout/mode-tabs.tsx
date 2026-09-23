'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plug, Library } from 'lucide-react'

interface ModeTabsProps {
  lang: string
}

const TABS = [
  { id: 'mcp', match: '/mcp', icon: Plug, label: { ko: 'MCP', en: 'MCP' } },
  { id: 'notes', match: '/notes', icon: Library, label: { ko: '지식 베이스', en: 'Knowledge' } },
] as const

export default function ModeTabs({ lang }: ModeTabsProps) {
  const pathname = usePathname()

  return (
    <div
      className="h-14 flex items-center gap-1.5 px-2 shrink-0"
      style={{ borderBottom: '1px solid var(--border-strong)' }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = pathname?.includes(tab.match) ?? false
        return (
          <Link
            key={tab.id}
            href={`/${lang}${tab.match}`}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm cursor-pointer transition-colors duration-150"
            style={{
              backgroundColor: isActive ? 'var(--surface-raised)' : 'transparent',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              color: isActive ? 'var(--foreground)' : 'var(--text-secondary)',
              fontWeight: isActive ? 500 : 400,
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(200,197,188,0.35)'
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{lang === 'ko' ? tab.label.ko : tab.label.en}</span>
          </Link>
        )
      })}
    </div>
  )
}
