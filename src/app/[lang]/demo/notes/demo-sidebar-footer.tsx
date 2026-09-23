'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { DEMO_PERSONA } from '@/lib/demo/notes-data'

interface DemoSidebarFooterProps {
  lang: string
}

// 실제 SidebarFooter(계정 아바타 + 관리자 알림벨 + 피드백)와 같은 자리를 차지하지만, 데모에는
// 로그인 세션이 없어 그 기능들을 그대로 넣을 수 없다. 대신 가상 페르소나 정보 + 실제 서비스로
// 넘어가는 CTA로 채운다.
export default function DemoSidebarFooter({ lang }: DemoSidebarFooterProps) {
  const isKo = lang === 'ko'
  const initial = DEMO_PERSONA.name[0]

  return (
    <div className="shrink-0" style={{ borderTop: '1px solid var(--border-strong)' }}>
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-2">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>
            {DEMO_PERSONA.name}
          </p>
          <p className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>
            {DEMO_PERSONA.role}
          </p>
        </div>
      </div>
      <div className="px-3 pb-3">
        <Link
          href={`/${lang}`}
          className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium rounded-sm cursor-pointer transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {isKo ? 'verilix 시작하기' : 'Get started with verilix'}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
