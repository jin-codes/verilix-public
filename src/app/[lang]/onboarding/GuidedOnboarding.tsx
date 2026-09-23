'use client'

import React, { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { LanguageSelect, type Lang } from '@/components/settings/context-fields'
import { GUIDED_QUESTIONS, composeGuidedContext, type GuidedAnswers } from './onboarding-questions'

interface GuidedOnboardingProps {
  isKo: boolean
  uiLanguage: Lang
  aiLanguage: Lang
  docLanguage: Lang
  onChangeUiLanguage: (v: Lang) => void
  onChangeAiLanguage: (v: Lang) => void
  onChangeDocLanguage: (v: Lang) => void
  isSaving: boolean
  onComplete: (contextText: string) => void
  onSkip: (contextText: string) => void
  onExit: () => void
}

export default function GuidedOnboarding({
  isKo,
  uiLanguage,
  aiLanguage,
  docLanguage,
  onChangeUiLanguage,
  onChangeAiLanguage,
  onChangeDocLanguage,
  isSaving,
  onComplete,
  onSkip,
  onExit,
}: GuidedOnboardingProps) {
  const lang: Lang = isKo ? 'ko' : 'en'
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<GuidedAnswers>({})

  const totalQuestions = GUIDED_QUESTIONS.length
  const isFinalStep = step === totalQuestions
  const question = isFinalStep ? null : GUIDED_QUESTIONS[step]

  const toggleChip = (questionId: string, chip: string) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.chips ?? []
      const nextChips = current.includes(chip)
        ? current.filter((c) => c !== chip)
        : [...current, chip]
      return { ...prev, [questionId]: { chips: nextChips, freeText: prev[questionId]?.freeText ?? '' } }
    })
  }

  const setFreeText = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { chips: prev[questionId]?.chips ?? [], freeText: value } }))
  }

  const handleSkip = () => {
    onSkip(composeGuidedContext(answers, lang))
  }

  const handleNext = () => {
    if (isFinalStep) {
      onComplete(composeGuidedContext(answers, lang))
      return
    }
    setStep((s) => s + 1)
  }

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={onExit}
          className="text-xs cursor-pointer mb-3 flex items-center gap-1"
          style={{ color: 'var(--neutral)' }}
        >
          <ArrowLeft className="w-3 h-3" />
          {isKo ? '직접 입력할게요' : "I'll type it myself instead"}
        </button>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
          {isKo ? '몇 가지만 답해주세요' : 'Just a few quick questions'}
        </h1>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
          {isFinalStep
            ? (isKo ? '마지막으로 언어를 설정해주세요.' : 'Last step — set your language preferences.')
            : (isKo ? `${step + 1} / ${totalQuestions}` : `${step + 1} of ${totalQuestions}`)}
        </p>
      </div>

      {!isFinalStep && question && (
        <div className="mb-8">
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            {question.question[lang]}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {question.chips[lang].map((chip) => {
              const selected = answers[question.id]?.chips.includes(chip) ?? false
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleChip(question.id, chip)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-150"
                  style={{
                    backgroundColor: selected ? 'var(--primary)' : 'var(--card)',
                    color: selected ? 'var(--primary-foreground)' : 'var(--secondary)',
                    border: `1px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                  }}
                >
                  {chip}
                </button>
              )
            })}
          </div>
          <input
            type="text"
            value={answers[question.id]?.freeText ?? ''}
            onChange={(e) => setFreeText(question.id, e.target.value)}
            placeholder={question.freeTextPlaceholder[lang]}
            className="w-full p-2.5 text-sm outline-none rounded-sm"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>
      )}

      {isFinalStep && (
        <div className="mb-8 flex flex-col gap-4">
          <LanguageSelect isKo={isKo} label={isKo ? 'UI 언어' : 'UI Language'} value={uiLanguage} onChange={onChangeUiLanguage} />
          <LanguageSelect isKo={isKo} label={isKo ? 'AI 응답 언어' : 'AI Response Language'} value={aiLanguage} onChange={onChangeAiLanguage} />
          <LanguageSelect isKo={isKo} label={isKo ? '문서화 언어' : 'Documentation Language'} value={docLanguage} onChange={onChangeDocLanguage} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm cursor-pointer"
          style={{ color: 'var(--neutral)' }}
        >
          {isKo ? '나중에 하기' : 'Skip for now'}
        </button>
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="py-2 px-4 rounded-sm font-medium text-sm cursor-pointer"
              style={{ border: '1px solid var(--border)', color: 'var(--secondary)' }}
            >
              {isKo ? '이전' : 'Back'}
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={isSaving}
            className="py-2 px-5 rounded-sm font-medium text-sm cursor-pointer transition-all duration-150 flex items-center gap-1.5"
            style={{
              backgroundColor: isSaving ? 'var(--border-strong)' : 'var(--primary)',
              color: 'var(--primary-foreground)',
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isFinalStep
              ? (isSaving ? (isKo ? '저장 중...' : 'Saving...') : (isKo ? '시작하기' : 'Get Started'))
              : (isKo ? '다음' : 'Next')}
            {!isFinalStep && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
