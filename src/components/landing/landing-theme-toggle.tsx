'use client'

import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const STORAGE_KEY = 'theme'

type ThemeMode = 'light' | 'dark'

const LABELS = {
  ko: { toLight: '라이트 모드로 전환', toDark: '다크 모드로 전환' },
  en: { toLight: 'Switch to light mode', toDark: 'Switch to dark mode' },
}

export function LandingThemeToggle({ lang }: { lang: string }) {
  const [mode, setMode] = useState<ThemeMode>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light'
  )

  const handleClick = () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }

  const dict = lang === 'ko' ? LABELS.ko : LABELS.en
  const label = mode === 'dark' ? dict.toLight : dict.toDark
  const Icon = mode === 'dark' ? Moon : Sun

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className="w-8 h-8 flex items-center justify-center rounded-sm transition-opacity hover:opacity-70 cursor-pointer"
      style={{ color: 'var(--text-secondary)' }}
    >
      <Icon size={16} />
    </button>
  )
}
