'use client'

import React, { useState } from 'react'
import { Dialog } from 'radix-ui'
import { X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const MAX_FEEDBACK_LENGTH = 4000

interface FeedbackModalProps {
  lang: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function FeedbackModal({ lang, open, onOpenChange }: FeedbackModalProps) {
  const isKo = lang === 'ko'
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle')

  const reset = () => {
    setContent('')
    setStatus('idle')
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || status === 'submitting') return

    setStatus('submitting')
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setStatus('error')
      return
    }

    const { error } = await supabase
      .from('user_feedback')
      .insert({ user_id: user.id, content: trimmed })

    if (error) {
      setStatus('error')
      return
    }

    setStatus('sent')
    setTimeout(() => handleOpenChange(false), 1200)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(26,26,24,0.35)' }} />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 font-sans rounded-lg"
          style={{
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            padding: '20px',
          }}
        >
          <div className="flex items-start justify-between mb-1">
            <Dialog.Title className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              {isKo ? '개발자에게 피드백 보내기' : 'Send feedback to the developer'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1 rounded-sm cursor-pointer"
                style={{ color: 'var(--secondary)' }}
                aria-label={isKo ? '닫기' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-xs leading-relaxed mb-3" style={{ color: 'var(--neutral)' }}>
            {isKo
              ? '버그, 불편한 점, 원하는 기능 등 무엇이든 편하게 남겨주세요.'
              : 'Bugs, rough edges, feature requests — anything is welcome.'}
          </Dialog.Description>

          {status === 'sent' ? (
            <div className="flex items-center gap-2 py-6 justify-center" style={{ color: 'var(--primary)' }}>
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">{isKo ? '전달되었습니다. 감사합니다!' : 'Sent. Thank you!'}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_FEEDBACK_LENGTH))}
                placeholder={isKo ? '피드백을 입력해주세요...' : 'Write your feedback...'}
                rows={6}
                autoFocus
                className="w-full text-sm px-3 py-2 outline-none resize-none rounded-md"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                  {content.length} / {MAX_FEEDBACK_LENGTH}
                </span>
                {status === 'error' && (
                  <span className="text-[11px]" style={{ color: 'var(--destructive)' }}>
                    {isKo ? '전송에 실패했습니다. 다시 시도해주세요.' : 'Failed to send. Please try again.'}
                  </span>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  >
                    {isKo ? '취소' : 'Cancel'}
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={!content.trim() || status === 'submitting'}
                  className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: !content.trim() || status === 'submitting' ? 'var(--border-strong)' : 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    cursor: !content.trim() || status === 'submitting' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {status === 'submitting' ? (isKo ? '보내는 중...' : 'Sending...') : isKo ? '보내기' : 'Send'}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
