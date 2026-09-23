'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { AdminUserFeedback as AdminUserFeedbackRow } from './admin-dashboard'

interface AdminUserFeedbackProps {
  lang: string
  initialFeedback: AdminUserFeedbackRow[]
}

export default function AdminUserFeedback({ lang, initialFeedback }: AdminUserFeedbackProps) {
  const isKo = lang === 'ko'
  const [feedback, setFeedback] = useState(initialFeedback)

  const handleMarkReviewed = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('user_feedback').update({ reviewed: true }).eq('id', id)
    if (error) return
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, reviewed: true } : f)))
  }

  return (
    <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: 'var(--sidebar)' }}>
            {[
              isKo ? '유저' : 'User',
              isKo ? '내용' : 'Content',
              isKo ? '보낸 시각' : 'Time',
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
          {feedback.map((f) => (
            <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                {f.user_id ? (
                  <Link href={`/${lang}/admin/users/${f.user_id}`} className="cursor-pointer hover:underline">
                    {f.user_email ?? (isKo ? '(탈퇴한 유저)' : '(deleted user)')}
                  </Link>
                ) : (
                  f.user_email ?? (isKo ? '(탈퇴한 유저)' : '(deleted user)')
                )}
              </td>
              <td className="px-4 py-2.5 align-top max-w-md whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                {f.content}
              </td>
              <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                {f.created_at.replace('T', ' ').slice(0, 16)} UTC
              </td>
              <td className="px-4 py-2.5 align-top whitespace-nowrap">
                {f.reviewed ? (
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {isKo ? '확인됨' : 'Reviewed'}
                  </span>
                ) : (
                  <button
                    onClick={() => handleMarkReviewed(f.id)}
                    className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                    style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  >
                    {isKo ? '확인함' : 'Mark reviewed'}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {feedback.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                {isKo ? '아직 도착한 피드백이 없습니다.' : 'No feedback yet.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
