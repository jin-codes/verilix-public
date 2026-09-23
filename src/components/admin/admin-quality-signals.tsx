'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { AdminQualitySignal } from './admin-dashboard'

interface AdminQualitySignalsProps {
  lang: string
  initialSignals: AdminQualitySignal[]
}

const SIGNAL_LABEL: Record<string, { ko: string; en: string }> = {
  low_confidence: { ko: '낮은 확신', en: 'Low Confidence' },
  feedback_signal: { ko: '피드백/정정', en: 'Feedback' },
}

export default function AdminQualitySignals({ lang, initialSignals }: AdminQualitySignalsProps) {
  const isKo = lang === 'ko'
  const [signals, setSignals] = useState(initialSignals)

  const handleMarkReviewed = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('quality_signals').update({ reviewed: true }).eq('id', id)
    if (error) return
    setSignals((prev) => prev.map((s) => (s.id === id ? { ...s, reviewed: true } : s)))
  }

  return (
    <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: 'var(--sidebar)' }}>
            {[
              isKo ? '유저' : 'User',
              isKo ? '유형' : 'Type',
              isKo ? '대화' : 'Conversation',
              isKo ? '내용' : 'Content',
              isKo ? '발생 시각' : 'Time',
              isKo ? '상태' : 'Status',
            ].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--neutral)', borderBottom: '1px solid var(--border)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {signals.map((signal) => {
            const label = SIGNAL_LABEL[signal.signal_type] ?? { ko: signal.signal_type, en: signal.signal_type }
            return (
              <tr key={signal.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                  {signal.user_email ?? (isKo ? '(탈퇴한 유저)' : '(deleted user)')}
                </td>
                <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {isKo ? label.ko : label.en}
                </td>
                <td className="px-4 py-2.5 align-top" style={{ color: 'var(--text-secondary)' }}>
                  {signal.conversation_id && signal.user_id ? (
                    <Link
                      href={`/${lang}/admin/users/${signal.user_id}/conversations/${signal.conversation_id}`}
                      className="cursor-pointer hover:underline"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <div>{signal.conversation_title ?? (isKo ? '(제목 없음)' : '(untitled)')}</div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {signal.conversation_id}
                      </div>
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--muted-foreground)' }}>
                      {isKo ? '(대화 삭제됨)' : '(conversation deleted)'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 align-top max-w-md" style={{ color: 'var(--foreground)' }}>
                  {signal.content}
                </td>
                <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {signal.created_at.replace('T', ' ').slice(0, 16)} UTC
                </td>
                <td className="px-4 py-2.5 align-top whitespace-nowrap">
                  {signal.reviewed ? (
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {isKo ? '확인됨' : 'Reviewed'}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkReviewed(signal.id)}
                      className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                      style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    >
                      {isKo ? '확인함' : 'Mark reviewed'}
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
          {signals.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                {isKo ? '품질 신호가 없습니다.' : 'No quality signals.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
