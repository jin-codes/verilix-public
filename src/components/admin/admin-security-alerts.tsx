'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { AdminSecurityAlert } from './admin-dashboard'

interface AdminSecurityAlertsProps {
  lang: string
  initialAlerts: AdminSecurityAlert[]
}

export default function AdminSecurityAlerts({ lang, initialAlerts }: AdminSecurityAlertsProps) {
  const isKo = lang === 'ko'
  const [alerts, setAlerts] = useState(initialAlerts)

  const handleMarkReviewed = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('security_alerts').update({ reviewed: true }).eq('id', id)
    if (error) return
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, reviewed: true } : a)))
  }

  return (
    <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: 'var(--sidebar)' }}>
            {[
              isKo ? '유저' : 'User',
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
          {alerts.map((alert) => (
            <tr key={alert.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                {alert.user_email ?? (isKo ? '(탈퇴한 유저)' : '(deleted user)')}
              </td>
              <td className="px-4 py-2.5 align-top" style={{ color: 'var(--text-secondary)' }}>
                {alert.conversation_id && alert.user_id ? (
                  <Link
                    href={`/${lang}/admin/users/${alert.user_id}/conversations/${alert.conversation_id}`}
                    className="cursor-pointer hover:underline"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <div>{alert.conversation_title ?? (isKo ? '(제목 없음)' : '(untitled)')}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {alert.conversation_id}
                    </div>
                  </Link>
                ) : (
                  <span style={{ color: 'var(--muted-foreground)' }}>
                    {isKo ? '(대화 삭제됨)' : '(conversation deleted)'}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 align-top max-w-md" style={{ color: 'var(--foreground)' }}>
                {alert.content}
              </td>
              <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                {alert.created_at.replace('T', ' ').slice(0, 16)} UTC
              </td>
              <td className="px-4 py-2.5 align-top whitespace-nowrap">
                {alert.reviewed ? (
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {isKo ? '확인됨' : 'Reviewed'}
                  </span>
                ) : (
                  <button
                    onClick={() => handleMarkReviewed(alert.id)}
                    className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                    style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  >
                    {isKo ? '확인함' : 'Mark reviewed'}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {alerts.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                {isKo ? '알림이 없습니다.' : 'No alerts.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
