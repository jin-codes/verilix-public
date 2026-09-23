'use client'

import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ContextHelpTooltip } from './context-fields'

interface BackgroundContextProps {
  lang: string
  userId: string
  initialContext: string
  initialUpdatedAt: string | null
}

export default function BackgroundContext({
  lang,
  userId,
  initialContext,
  initialUpdatedAt,
}: BackgroundContextProps) {
  const isKo = lang === 'ko'

  const [context, setContext] = useState(initialContext)
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    setSaveState('saving')
    const supabase = createClient()
    const nowIso = new Date().toISOString()
    const { error } = await supabase
      .from('profiles')
      .update({
        type_a_context: context.trim() || null,
        type_a_updated_at: nowIso,
      })
      .eq('id', userId)

    if (error) {
      console.error('Failed to save background context', error)
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 2000)
      return
    }

    setUpdatedAt(nowIso)
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  return (
    <section>
      <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {isKo ? '배경 지식' : 'Background Context'}
      </h2>
      <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--neutral)' }}>
        {isKo
          ? '모든 대화에 항상 포함되는 고정 배경지식입니다.'
          : 'Fixed background context included in every conversation.'}
      </p>

      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {isKo ? '배경 지식' : 'Background context'}
          </label>
          <ContextHelpTooltip isKo={isKo} />
        </div>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={10}
          placeholder={
            isKo
              ? '예: 저는 스타트업을 준비 중인 개발자입니다. AI 관련 서비스를 만들고 있고, 제품 방향성에 대한 고민이 많아요...'
              : 'e.g. I\'m a developer building an AI-powered startup, and I think a lot about product direction...'
          }
          className="w-full p-3 resize-none text-sm outline-none rounded-sm"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        />
        {updatedAt && (
          <p className="mt-1.5 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
            {isKo ? '마지막 수정' : 'Last updated'}{' '}
            {new Date(updatedAt).toLocaleString(isKo ? 'ko-KR' : 'en-US')}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className="flex items-center gap-1.5 py-2 px-4 rounded-sm font-medium text-xs cursor-pointer transition-all duration-150"
        style={{
          backgroundColor: saveState === 'saving' ? 'var(--border-strong)' : 'var(--primary)',
          color: 'var(--primary-foreground)',
          cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
        }}
      >
        {saveState === 'saved' && <Check className="w-3.5 h-3.5" />}
        <span>
          {saveState === 'saving'
            ? (isKo ? '저장 중...' : 'Saving...')
            : saveState === 'saved'
              ? (isKo ? '저장됨' : 'Saved')
              : saveState === 'error'
                ? (isKo ? '저장 실패, 다시 시도하세요' : 'Failed, try again')
                : (isKo ? '저장' : 'Save')}
        </span>
      </button>
    </section>
  )
}
