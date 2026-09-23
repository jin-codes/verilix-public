'use client'

import React, { useState } from 'react'
import SettingsNav, { type SettingsCategory, CATEGORY_TITLES } from '@/components/settings/settings-nav'
import SettingsCategoryContent from '@/components/settings/settings-category-content'
import MobileSettingsShell from '@/components/settings/mobile-settings-shell'
import { usePersistedCollapse } from '@/lib/use-persisted-collapse'
import { useIsMobile } from '@/lib/use-is-mobile'
import type { Lang } from '@/components/settings/context-fields'

interface SettingsLayoutWrapperProps {
  lang: string
  userId: string
  userEmail: string
  initialContext: string
  initialUpdatedAt: string | null
  initialUiLanguage: Lang
  initialDocLanguage: Lang
  isAdmin: boolean
  initialDigestEnabled: boolean
  initialCategory?: SettingsCategory
}

export default function SettingsLayoutWrapper({
  lang,
  userId,
  userEmail,
  initialContext,
  initialUpdatedAt,
  initialUiLanguage,
  initialDocLanguage,
  isAdmin,
  initialDigestEnabled,
  initialCategory = 'general',
}: SettingsLayoutWrapperProps) {
  const isKo = lang === 'ko'
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(initialCategory)
  const { isCollapsed, toggle: toggleCollapsed } = usePersistedCollapse()
  const isMobile = useIsMobile()

  const contentProps = {
    lang,
    userId,
    userEmail,
    activeCategory,
    initialContext,
    initialUpdatedAt,
    initialUiLanguage,
    initialDocLanguage,
    initialDigestEnabled,
  }

  if (isMobile) {
    return (
      <MobileSettingsShell
        lang={lang}
        userEmail={userEmail}
        isAdmin={isAdmin}
        onSelectCategory={setActiveCategory}
        contentProps={contentProps}
      />
    )
  }

  return (
    <div className="flex overflow-hidden" style={{ height: '100vh', width: '100vw', backgroundColor: 'var(--background)' }}>
      <SettingsNav
        lang={lang}
        userEmail={userEmail}
        active={activeCategory}
        onSelect={setActiveCategory}
        isAdmin={isAdmin}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapsed}
      />

      <div className="flex-1 h-screen overflow-y-auto">
        <header
          className="h-14 pr-8 flex items-center shrink-0"
          style={{ paddingLeft: isCollapsed ? '56px' : '32px', borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {isKo ? CATEGORY_TITLES[activeCategory].ko : CATEGORY_TITLES[activeCategory].en}
          </span>
        </header>

        <div className="max-w-xl mx-auto px-8 py-8 space-y-10">
          <SettingsCategoryContent {...contentProps} />
        </div>
      </div>
    </div>
  )
}
