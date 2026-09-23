'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { MessageSquareText } from 'lucide-react'
import AdminAlertBell from '@/components/layout/admin-alert-bell'
import FeedbackModal from '@/components/feedback/feedback-modal'

interface SidebarFooterProps {
  lang: string
  userEmail?: string
}

export default function SidebarFooter({ lang, userEmail = '' }: SidebarFooterProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const initial = userEmail ? userEmail[0]?.toUpperCase() : '?'
  const isSettings = pathname?.includes('/settings') ?? false
  const isAccount = isSettings && searchParams.get('category') === 'account'

  return (
    <>
      <div
        className="flex items-center justify-between px-3 py-2.5 shrink-0"
        style={{ borderTop: '1px solid var(--border-strong)' }}
      >
        <Link
          href={`/${lang}/settings?category=account`}
          title={lang === 'ko' ? '계정 및 설정' : 'Account & settings'}
          className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 cursor-pointer"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            outline: isAccount ? '2px solid var(--border-strong)' : 'none',
            outlineOffset: '1px',
          }}
        >
          {initial}
        </Link>
        <div className="flex items-center gap-1">
          <AdminAlertBell lang={lang} />
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            title={lang === 'ko' ? '개발자에게 피드백 보내기' : 'Send feedback to the developer'}
            className="flex items-center justify-center w-8 h-8 rounded-sm cursor-pointer transition-colors duration-150"
            style={{ backgroundColor: 'transparent' }}
          >
            <MessageSquareText className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
          </button>
        </div>
      </div>
      <FeedbackModal lang={lang} open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  )
}
