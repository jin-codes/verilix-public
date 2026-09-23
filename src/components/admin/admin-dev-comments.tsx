'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { AdminDevComment } from './admin-dashboard'

interface AdminDevCommentsProps {
  lang: string
  initialComments: AdminDevComment[]
}

export default function AdminDevComments({ lang, initialComments }: AdminDevCommentsProps) {
  const isKo = lang === 'ko'
  const [comments, setComments] = useState(initialComments)

  const handleMarkReviewed = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('dev_comments').update({ reviewed: true }).eq('id', id)
    if (error) return
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, reviewed: true } : c)))
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
          {comments.map((comment) => (
            <tr key={comment.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                {comment.user_email ?? (isKo ? '(탈퇴한 유저)' : '(deleted user)')}
              </td>
              <td className="px-4 py-2.5 align-top" style={{ color: 'var(--text-secondary)' }}>
                {comment.conversation_id && comment.user_id ? (
                  <Link
                    href={`/${lang}/admin/users/${comment.user_id}/conversations/${comment.conversation_id}`}
                    className="cursor-pointer hover:underline"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <div>{comment.conversation_title ?? (isKo ? '(제목 없음)' : '(untitled)')}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {comment.conversation_id}
                    </div>
                  </Link>
                ) : (
                  <span style={{ color: 'var(--muted-foreground)' }}>
                    {isKo ? '(대화 삭제됨)' : '(conversation deleted)'}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 align-top max-w-md" style={{ color: 'var(--foreground)' }}>
                {comment.content}
              </td>
              <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                {comment.created_at.replace('T', ' ').slice(0, 16)} UTC
              </td>
              <td className="px-4 py-2.5 align-top whitespace-nowrap">
                {comment.reviewed ? (
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {isKo ? '확인됨' : 'Reviewed'}
                  </span>
                ) : (
                  <button
                    onClick={() => handleMarkReviewed(comment.id)}
                    className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                    style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  >
                    {isKo ? '확인함' : 'Mark reviewed'}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {comments.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                {isKo ? '개발자 코멘트가 없습니다.' : 'No developer comments.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
