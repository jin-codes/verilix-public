'use client'

import React from 'react'
import Link from 'next/link'
import { Settings, FileText, User, ShieldCheck, UserCog, KeyRound } from 'lucide-react'

export type SettingsCategory = 'general' | 'documents' | 'profile' | 'byok' | 'account'

export const CATEGORY_TITLES: Record<SettingsCategory, { ko: string; en: string }> = {
  general: { ko: '일반', en: 'General' },
  documents: { ko: '문서', en: 'Documents' },
  profile: { ko: '내 프로필', en: 'My Profile' },
  byok: { ko: 'API 키', en: 'API Keys' },
  account: { ko: '계정', en: 'Account' },
}

interface SettingsCategoryListProps {
  lang: string
  active: SettingsCategory
  onSelect: (category: SettingsCategory) => void
  isAdmin?: boolean
}

const CATEGORIES: { id: SettingsCategory; icon: typeof Settings; label: { ko: string; en: string } }[] = [
  { id: 'general', icon: Settings, label: { ko: '일반', en: 'General' } },
  { id: 'documents', icon: FileText, label: { ko: '문서', en: 'Documents' } },
  { id: 'profile', icon: User, label: { ko: '내 프로필', en: 'My Profile' } },
  { id: 'byok', icon: KeyRound, label: { ko: 'API 키', en: 'API Keys' } },
  { id: 'account', icon: UserCog, label: { ko: '계정', en: 'Account' } },
]

export default function SettingsCategoryList({ lang, active, onSelect, isAdmin = false }: SettingsCategoryListProps) {
  const isKo = lang === 'ko'

  return (
    <div className="flex-1 overflow-y-auto py-3 px-2">
      <p className="px-2.5 text-xs font-semibold uppercase tracking-wider mb-2 mt-1" style={{ color: 'var(--neutral)' }}>
        {isKo ? '설정' : 'Settings'}
      </p>
      <div className="space-y-0.5">
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          const isActive = category.id === active
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-left cursor-pointer transition-colors duration-150"
              style={{
                backgroundColor: isActive ? 'var(--background)' : 'transparent',
                color: isActive ? 'var(--foreground)' : 'var(--text-secondary)',
                fontWeight: isActive ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(200,197,188,0.35)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--secondary)' }} />
              <span className="text-sm">{isKo ? category.label.ko : category.label.en}</span>
            </button>
          )
        })}
      </div>

      {isAdmin && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <Link
            href={`/${lang}/admin`}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-left cursor-pointer transition-colors duration-150"
            style={{ color: 'var(--destructive)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(200,197,188,0.35)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{isKo ? '관리자 모드' : 'Admin Mode'}</span>
          </Link>
        </div>
      )}
    </div>
  )
}
