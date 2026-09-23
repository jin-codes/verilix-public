'use client'

import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LanguageSelect, type Lang } from './context-fields'

interface DocumentSettingsProps {
  lang: string
  userId: string
  initialDocLanguage: Lang
}

export default function DocumentSettings({ lang, userId, initialDocLanguage }: DocumentSettingsProps) {
  const isKo = lang === 'ko'

  const [docLanguage, setDocLanguage] = useState<Lang>(initialDocLanguage)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    setSaveState('saving')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ doc_language: docLanguage })
      .eq('id', userId)

    if (error) {
      console.error('Failed to save document settings', error)
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 2000)
      return
    }

    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  return (
    <section>
      <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {isKo ? '문서화 언어' : 'Documentation Language'}
      </h2>
      <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--neutral)' }}>
        {isKo
          ? '지식 베이스에 저장되는 문서에 사용되는 언어입니다.'
          : 'The language used for documents saved to your knowledge base.'}
      </p>

      <div className="mb-6">
        <LanguageSelect
          isKo={isKo}
          label={isKo ? '문서화 언어' : 'Documentation Language'}
          value={docLanguage}
          onChange={setDocLanguage}
        />
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
