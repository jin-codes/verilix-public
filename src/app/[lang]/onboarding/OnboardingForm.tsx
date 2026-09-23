'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ContextHelpTooltip, LanguageSelect, type Lang } from '@/components/settings/context-fields'
import GuidedOnboarding from './GuidedOnboarding'

interface OnboardingFormProps {
  lang: string
  userId: string
  initialContext: string
  initialUiLanguage: Lang
  initialAiLanguage: Lang
  initialDocLanguage: Lang
}

export default function OnboardingForm({
  lang,
  userId,
  initialContext,
  initialUiLanguage,
  initialAiLanguage,
  initialDocLanguage,
}: OnboardingFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'manual' | 'guided'>('manual')
  const [context, setContext] = useState(initialContext)
  const [uiLanguage, setUiLanguage] = useState<Lang>(initialUiLanguage)
  const [aiLanguage, setAiLanguage] = useState<Lang>(initialAiLanguage)
  const [docLanguage, setDocLanguage] = useState<Lang>(initialDocLanguage)
  const [isSaving, setIsSaving] = useState(false)

  const isKo = lang === 'ko'

  const saveProfile = async (contextText: string) => {
    setIsSaving(true)
    const supabase = createClient()

    await supabase
      .from('profiles')
      .update({
        type_a_context: contextText.trim() || null,
        type_a_updated_at: new Date().toISOString(),
        ui_language: uiLanguage,
        ai_response_language: aiLanguage,
        doc_language: docLanguage,
      })
      .eq('id', userId)

    // 입력한 배경지식을 지식 베이스의 첫 문서로도 남긴다 — 실패해도 온보딩 자체는 막지 않는다.
    if (contextText.trim()) {
      try {
        await fetch('/api/documents/from-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context: contextText.trim(), docLanguage }),
        })
      } catch (err) {
        console.error('Failed to create onboarding document', err)
      }
    }

    router.push(`/${uiLanguage}/mcp`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveProfile(context)
  }

  const handleSkip = async () => {
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ type_a_updated_at: new Date().toISOString() })
      .eq('id', userId)
    router.push(`/${lang}/mcp`)
  }

  const handleGuidedComplete = (contextText: string) => {
    saveProfile(contextText)
  }

  const handleGuidedSkip = async (contextText: string) => {
    if (!contextText.trim()) {
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ type_a_updated_at: new Date().toISOString() })
        .eq('id', userId)
      router.push(`/${lang}/mcp`)
      return
    }
    saveProfile(contextText)
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {mode === 'guided' ? (
        <div
          className="w-full max-w-lg p-8 rounded-lg"
          style={{
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <GuidedOnboarding
            isKo={isKo}
            uiLanguage={uiLanguage}
            aiLanguage={aiLanguage}
            docLanguage={docLanguage}
            onChangeUiLanguage={setUiLanguage}
            onChangeAiLanguage={setAiLanguage}
            onChangeDocLanguage={setDocLanguage}
            isSaving={isSaving}
            onComplete={handleGuidedComplete}
            onSkip={handleGuidedSkip}
            onExit={() => setMode('manual')}
          />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg p-8 rounded-lg"
          style={{
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <div className="mb-4">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {isKo ? '나에 대해 알려주세요' : 'Tell us about yourself'}
            </h1>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
              {isKo
                ? '여기 입력한 내용은 모든 대화에 배경지식으로 자동 포함돼요. 나중에 설정에서 언제든 수정할 수 있어요.'
                : 'This becomes background context included in every conversation. You can edit it anytime in settings.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMode('guided')}
            className="text-xs cursor-pointer mb-6 underline-offset-2 hover:underline"
            style={{ color: 'var(--neutral)' }}
          >
            {isKo ? 'AI를 써본 적이 없으신가요? 질문에 답하며 시작할게요 →' : "Haven't used AI before? Answer a few quick questions instead →"}
          </button>

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
              rows={6}
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
          </div>

          <div className="mb-6 flex flex-col gap-4">
            <LanguageSelect isKo={isKo} label={isKo ? 'UI 언어' : 'UI Language'} value={uiLanguage} onChange={setUiLanguage} />
            <LanguageSelect isKo={isKo} label={isKo ? 'AI 응답 언어' : 'AI Response Language'} value={aiLanguage} onChange={setAiLanguage} />
            <LanguageSelect isKo={isKo} label={isKo ? '문서화 언어' : 'Documentation Language'} value={docLanguage} onChange={setDocLanguage} />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm cursor-pointer"
              style={{ color: 'var(--neutral)' }}
            >
              {isKo ? '나중에 하기' : 'Skip for now'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2 px-5 rounded-sm font-medium text-sm cursor-pointer transition-all duration-150"
              style={{
                backgroundColor: isSaving ? 'var(--border-strong)' : 'var(--primary)',
                color: 'var(--primary-foreground)',
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? (isKo ? '저장 중...' : 'Saving...') : isKo ? '시작하기' : 'Get Started'}
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
