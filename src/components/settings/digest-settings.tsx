'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DigestSettingsProps {
  lang: string
  userId: string
  initialEnabled: boolean
}

export default function DigestSettings({ lang, userId, initialEnabled }: DigestSettingsProps) {
  const isKo = lang === 'ko'
  const [enabled, setEnabled] = useState(initialEnabled)
  const [saving, setSaving] = useState(false)

  const handleToggle = async () => {
    const next = !enabled
    setEnabled(next)
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ digest_enabled: next }).eq('id', userId)
    setSaving(false)
    if (error) {
      console.error('Failed to save digest preference', error)
      setEnabled(!next)
    }
  }

  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {isKo ? '주간 다이제스트' : 'Weekly Digest'}
      </h2>
      <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--neutral)' }}>
        {isKo
          ? '매주 지식 베이스에 새로 쌓인 문서를 요약해 이메일로 보내드립니다.'
          : 'A weekly email summarizing new documents added to your knowledge base.'}
      </p>

      <button
        type="button"
        onClick={handleToggle}
        disabled={saving}
        className="flex items-center gap-1.5 py-2 px-4 rounded-sm font-medium text-xs cursor-pointer transition-all duration-150 w-fit"
        style={{
          backgroundColor: enabled ? 'var(--primary)' : 'var(--card)',
          color: enabled ? 'var(--primary-foreground)' : 'var(--secondary)',
          border: enabled ? 'none' : '1px solid var(--border)',
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {enabled ? (isKo ? '받는 중 (끄기)' : 'Enabled (turn off)') : (isKo ? '꺼짐 (켜기)' : 'Disabled (turn on)')}
      </button>
    </section>
  )
}
