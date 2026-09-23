'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LanguageSelect, type Lang } from './context-fields'

interface GeneralSettingsProps {
  lang: string
  userId: string
  initialUiLanguage: Lang
}

export default function GeneralSettings({ lang, userId, initialUiLanguage }: GeneralSettingsProps) {
  const router = useRouter()
  const isKo = lang === 'ko'

  const [uiLanguage, setUiLanguage] = useState<Lang>(initialUiLanguage)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    setSaveState('saving')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ ui_language: uiLanguage })
      .eq('id', userId)

    if (error) {
      console.error('Failed to save UI language', error)
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 2000)
      return
    }

    setSaveState('saved')
    if (uiLanguage !== lang) {
      router.push(`/${uiLanguage}/settings`)
      return
    }
    setTimeout(() => setSaveState('idle'), 2000)
  }

  return (
    <section>
      <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {isKo ? '일반' : 'General'}
      </h2>
      <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--neutral)' }}>
        {isKo ? '앱 인터페이스에 사용되는 언어입니다.' : 'The language used for the app interface.'}
      </p>

      <div className="mb-6">
        <LanguageSelect
          isKo={isKo}
          label={isKo ? 'UI 언어' : 'UI Language'}
          value={uiLanguage}
          onChange={setUiLanguage}
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
