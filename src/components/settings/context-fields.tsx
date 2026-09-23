'use client'

import React, { useState } from 'react'
import { Info, Copy, Check } from 'lucide-react'

export type Lang = 'ko' | 'en'

export const CONTEXT_PROMPT: Record<Lang, string> = {
  ko: `당신은 지금까지 저와 나눈 모든 대화와 기억을 바탕으로, 저에 대한 프로필 문서를 작성해주세요.
이 문서는 verilix라는 다른 AI 서비스에 제 배경지식으로 등록되어, 앞으로의 모든 대화에 자동으로 포함됩니다.
아래 항목을 빠짐없이, 하지만 실제로 확인된 내용에 근거해서만 작성해주세요. 확실하지 않은 내용은 추측하지 말고 생략하세요.

1. 기본 프로필: 직업/역할, 전문 분야와 숙련도, 현재 주로 하고 있는 일
2. 관심사와 현재 몰두하고 있는 주제·프로젝트 (최근 대화에서 반복적으로 등장한 주제 포함)
3. 가치관과 의사결정 스타일: 무엇을 우선시하는지, 위험을 대하는 태도(신중한 편/공격적인 편), 결정을 내리는 방식
4. 소통 스타일과 선호하는 답변 형식: 선호하는 톤(격식/편안함), 답변 길이(간결함/상세함), 구조화 방식(불릿/서술형), 예시나 코드가 필요한 정도
5. 반드시 지켜줬으면 하는 원칙: 답변할 때 항상 지켰으면 하는 규칙
6. 절대 하지 말아야 할 것(금지사항): 과거에 AI의 답변 방식을 정정했거나 불만을 표현했던 부분, 싫어하는 말투·형식·가정
7. 배경 지식 수준: 어떤 분야는 전문가 수준이고 어떤 분야는 초보자 수준인지
8. 기타 특이사항: 위 항목엔 안 들어가지만 저를 이해하는 데 도움이 될 만한 것

주의사항:
- 비밀번호, 주민등록번호, 계좌번호, 카드번호 등 민감한 개인 식별 정보는 절대 포함하지 마세요.
- 확인되지 않은 추측이나 일반론으로 채우지 말고, 실제 대화에서 드러난 내용만 반영하세요.
- 각 항목은 2~4문장 정도로 간결하게, 전체적으로 하나의 자연스러운 프로필 문서처럼 작성해주세요.
- 결과물만 출력하세요 (서두나 마무리 인사말 없이).`,
  en: `Based on everything you remember from our conversations so far, write a profile document about me.
This document will be registered as my background context in another AI service called verilix, and will automatically be included in all of my future conversations there.
Cover every item below, but base everything strictly on what you've actually observed — do not guess or generalize. Omit anything you're not sure about.

1. Basic profile: my role/occupation, areas of expertise and skill level, what I'm currently mainly working on
2. Interests and current projects/topics I'm focused on (including topics that keep recurring in our recent conversations)
3. Values and decision-making style: what I prioritize, my attitude toward risk (cautious vs. bold), how I tend to make decisions
4. Communication style and preferred response format: tone (formal/casual), preferred length (concise/detailed), structure (bullets/prose), how much I rely on examples or code
5. Principles you should always follow when answering me
6. Things you must never do: ways you've corrected my AI's behavior before, tones/formats/assumptions I dislike
7. Level of background knowledge: which domains I'm expert-level in, and which I'm a beginner in
8. Anything else notable that doesn't fit above but would help understand me

Important:
- Never include sensitive identifying information such as passwords, national ID numbers, bank account numbers, or card numbers.
- Don't fill gaps with unverified guesses or generic statements — only include what's actually evidenced in our conversations.
- Keep each section to about 2-4 sentences, written as one natural profile document overall.
- Output only the result itself, with no preamble or closing remarks.`,
}

export const LANGUAGE_LABELS: Record<Lang, { ko: string; en: string }> = {
  ko: { ko: '한국어', en: 'Korean' },
  en: { ko: '영어', en: 'English' },
}

export function ContextHelpTooltip({ isKo }: { isKo: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const promptRef = React.useRef<HTMLDivElement>(null)
  const prompt = CONTEXT_PROMPT[isKo ? 'ko' : 'en']

  const selectPromptText = () => {
    if (!promptRef.current) return
    const range = document.createRange()
    range.selectNodeContents(promptRef.current)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyState('copied')
    } catch {
      selectPromptText()
      setCopyState('failed')
    }
    setTimeout(() => setCopyState('idle'), 2500)
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Info className="w-3.5 h-3.5 cursor-help" style={{ color: 'var(--secondary-light)' }} />
      {isOpen && (
        // pt-2 (not mt-2) keeps the gap to the icon inside this element's own
        // hoverable box, so crossing it doesn't fire mouseleave on the wrapper.
        <div className="absolute z-10 left-0 top-full w-96 pt-2">
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              {isKo
                ? '아래 프롬프트를 복사해서 평소 쓰던 ChatGPT나 Claude에 붙여넣고, 나온 답변을 복사해서 이 칸에 붙여넣으세요.'
                : 'Copy the prompt below into the ChatGPT or Claude you already use, then paste its reply back into this box.'}
            </p>
            <div
              ref={promptRef}
              className="max-h-56 overflow-y-auto text-xs whitespace-pre-wrap p-2.5 mb-3 select-text rounded-sm"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              {prompt}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-sm cursor-pointer"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {copyState === 'copied' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copyState === 'copied'
                ? isKo ? '복사됨' : 'Copied'
                : copyState === 'failed'
                  ? isKo ? '선택됨 · 직접 복사하세요 (Cmd/Ctrl+C)' : 'Selected · press Cmd/Ctrl+C'
                  : isKo ? '프롬프트 복사' : 'Copy prompt'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function LanguageSelect({
  isKo,
  label,
  value,
  onChange,
}: {
  isKo: boolean
  label: string
  value: Lang
  onChange: (v: Lang) => void
}) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div
        className="flex items-center gap-0.5 p-0.5 rounded-sm text-xs w-fit"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
      >
        {(['ko', 'en'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className="px-3 py-1.5 rounded-sm cursor-pointer transition-all duration-150 font-medium"
            style={{
              backgroundColor: value === option ? 'var(--primary)' : 'transparent',
              color: value === option ? 'var(--primary-foreground)' : 'var(--secondary)',
            }}
          >
            {isKo ? LANGUAGE_LABELS[option].ko : LANGUAGE_LABELS[option].en}
          </button>
        ))}
      </div>
    </div>
  )
}
