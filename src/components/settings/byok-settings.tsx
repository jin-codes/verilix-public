'use client'

import React, { useEffect, useState } from 'react'
import { Check, Trash2, KeyRound } from 'lucide-react'
import type { ByokProvider } from '@/lib/ai/byok'

interface KeyRow {
  provider: ByokProvider
  key_preview: string
  updated_at: string
}

interface ByokSettingsProps {
  lang: string
}

const PROVIDER_LABELS: Record<ByokProvider, { name: string; placeholder: string }> = {
  anthropic: { name: 'Anthropic', placeholder: 'sk-ant-...' },
  openai: { name: 'OpenAI', placeholder: 'sk-...' },
  google: { name: 'Google', placeholder: 'AIza...' },
}

const PROVIDER_ORDER: ByokProvider[] = ['anthropic', 'openai', 'google']

type SaveState = 'idle' | 'saving' | 'error'

export default function ByokSettings({ lang }: ByokSettingsProps) {
  const isKo = lang === 'ko'
  const [keys, setKeys] = useState<Record<ByokProvider, KeyRow | null>>({
    anthropic: null,
    openai: null,
    google: null,
  })
  const [activeProvider, setActiveProvider] = useState<ByokProvider | null>(null)
  const [inputs, setInputs] = useState<Record<ByokProvider, string>>({ anthropic: '', openai: '', google: '' })
  const [saveState, setSaveState] = useState<Record<ByokProvider, SaveState>>({
    anthropic: 'idle',
    openai: 'idle',
    google: 'idle',
  })
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    fetch('/api/settings/byok')
      .then((res) => (res.ok ? res.json() : { keys: [], activeProvider: null }))
      .then((data: { keys: KeyRow[]; activeProvider: ByokProvider | null }) => {
        const next: Record<ByokProvider, KeyRow | null> = { anthropic: null, openai: null, google: null }
        for (const row of data.keys ?? []) next[row.provider] = row
        setKeys(next)
        setActiveProvider(data.activeProvider ?? null)
      })
      .catch(() => {})
  }, [])

  const handleSave = async (provider: ByokProvider) => {
    const apiKey = inputs[provider].trim()
    if (!apiKey) return
    setSaveState((s) => ({ ...s, [provider]: 'saving' }))

    const res = await fetch('/api/settings/byok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    })

    if (!res.ok) {
      setSaveState((s) => ({ ...s, [provider]: 'error' }))
      setTimeout(() => setSaveState((s) => ({ ...s, [provider]: 'idle' })), 2000)
      return
    }

    const data: { keyPreview: string; activeProvider: ByokProvider | null } = await res.json()
    setKeys((k) => ({ ...k, [provider]: { provider, key_preview: data.keyPreview, updated_at: new Date().toISOString() } }))
    setActiveProvider(data.activeProvider)
    setInputs((i) => ({ ...i, [provider]: '' }))
    setSaveState((s) => ({ ...s, [provider]: 'idle' }))
  }

  const handleDelete = async (provider: ByokProvider) => {
    const res = await fetch('/api/settings/byok', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    })
    if (res.ok) {
      setKeys((k) => ({ ...k, [provider]: null }))
      setActiveProvider((p) => (p === provider ? null : p))
    }
  }

  const handleActivate = async (provider: ByokProvider | null) => {
    setSwitching(true)
    const res = await fetch('/api/settings/byok', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    })
    if (res.ok) {
      const data: { activeProvider: ByokProvider | null } = await res.json()
      setActiveProvider(data.activeProvider)
    }
    setSwitching(false)
  }

  return (
    <section>
      <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {isKo ? 'API 키 (BYOK)' : 'API Keys (BYOK)'}
      </h2>
      <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--neutral)' }}>
        {isKo
          ? '본인 소유의 API 키를 등록하고 "채팅에 사용"으로 활성화하면, 그 프로바이더의 키로 채팅 전체가 직접 호출되어 하루 크레딧 한도 없이 대화할 수 있습니다. 여러 프로바이더 키를 동시에 등록해둘 수 있지만, 채팅에는 그중 활성화한 하나만 쓰입니다.'
          : 'Register your own key and activate "Use for chat" to route all chat calls through that provider directly, with no daily credit limit. You can register keys for multiple providers, but only the one you activate is used for chat.'}
      </p>

      <div className="space-y-3">
        {PROVIDER_ORDER.map((provider) => {
          const existing = keys[provider]
          const { name, placeholder } = PROVIDER_LABELS[provider]
          const state = saveState[provider]
          const isActive = activeProvider === provider

          return (
            <div key={provider} className="p-3 rounded-md" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5" style={{ color: 'var(--secondary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {name}
                  </span>
                </div>
                {isActive && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-sm"
                    style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--secondary)', border: '1px solid var(--border)' }}
                  >
                    {isKo ? '채팅에 연동됨' : 'Wired into chat'}
                  </span>
                )}
              </div>

              {existing ? (
                <div className="flex items-center justify-between gap-2">
                  <code className="flex-1 text-xs px-2 py-1.5 rounded-sm overflow-x-auto" style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    {existing.key_preview}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleActivate(isActive ? null : provider)}
                    disabled={switching}
                    className="py-1.5 px-3 rounded-sm font-medium text-xs cursor-pointer shrink-0"
                    style={{
                      backgroundColor: isActive ? 'var(--surface-raised)' : 'var(--primary)',
                      color: isActive ? 'var(--foreground)' : 'var(--primary-foreground)',
                      border: isActive ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    {isActive ? (isKo ? '끄기' : 'Deactivate') : (isKo ? '채팅에 사용' : 'Use for chat')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(provider)}
                    className="p-1.5 rounded-sm cursor-pointer shrink-0"
                    style={{ color: 'var(--destructive)' }}
                    title={isKo ? '삭제' : 'Remove'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={inputs[provider]}
                    onChange={(e) => setInputs((i) => ({ ...i, [provider]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 text-sm px-3 py-2 outline-none rounded-sm"
                    style={{ border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSave(provider)}
                    disabled={state === 'saving' || !inputs[provider].trim()}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-sm font-medium text-xs cursor-pointer shrink-0"
                    style={{
                      backgroundColor: state === 'saving' ? 'var(--border-strong)' : 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      cursor: state === 'saving' || !inputs[provider].trim() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {state === 'saving' ? <span>{isKo ? '저장 중...' : 'Saving...'}</span> : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{isKo ? '저장' : 'Save'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              {state === 'error' && (
                <p className="mt-1.5 text-[11px]" style={{ color: 'var(--destructive)' }}>
                  {isKo ? '저장에 실패했습니다. 다시 시도해주세요.' : 'Failed to save. Please try again.'}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
