'use client'

import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const STORAGE_KEY = 'theme'

type ThemeMode = 'light' | 'dark'

const OPTIONS: { id: ThemeMode; icon: typeof Sun; label: { ko: string; en: string } }[] = [
  { id: 'light', icon: Sun, label: { ko: '라이트', en: 'Light' } },
  { id: 'dark', icon: Moon, label: { ko: '다크', en: 'Dark' } },
]

interface DarkModeSettingsProps {
  lang: string
}

export default function DarkModeSettings({ lang }: DarkModeSettingsProps) {
  const isKo = lang === 'ko'
  const [mode, setMode] = useState<ThemeMode>('light')

  useEffect(() => {
    setMode(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  }, [])

  const handleSelect = (next: ThemeMode) => {
    setMode(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }

  return (
    <section>
      <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {isKo ? '테마' : 'Theme'}
      </h2>
      <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--neutral)' }}>
        {isKo ? '앱의 밝기 모드를 설정합니다.' : "Sets the app's color mode."}
      </p>

      <div
        className="flex items-center gap-0.5 p-0.5 rounded-sm text-xs w-fit"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
      >
        {OPTIONS.map((option) => {
          const Icon = option.icon
          const isActive = option.id === mode
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm cursor-pointer transition-all duration-150 font-medium"
              style={{
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--primary-foreground)' : 'var(--secondary)',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {isKo ? option.label.ko : option.label.en}
            </button>
          )
        })}
      </div>
    </section>
  )
}
