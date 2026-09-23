'use client'

import React from 'react'
import SidebarShell from '@/components/layout/sidebar-shell'
import SettingsCategoryList, { CATEGORY_TITLES } from './settings-category-list'
import type { SettingsCategory } from './settings-category-list'

export type { SettingsCategory }
export { CATEGORY_TITLES }

interface SettingsNavProps {
  lang: string
  userEmail?: string
  active: SettingsCategory
  onSelect: (category: SettingsCategory) => void
  isAdmin?: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export default function SettingsNav({
  lang,
  userEmail = '',
  active,
  onSelect,
  isAdmin = false,
  isCollapsed,
  onToggleCollapse,
}: SettingsNavProps) {
  const isKo = lang === 'ko'

  return (
    <SidebarShell
      lang={lang}
      userEmail={userEmail}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      collapseLabel={{
        expand: isKo ? '설정 메뉴 펼치기' : 'Expand settings menu',
        collapse: isKo ? '설정 메뉴 접기' : 'Collapse settings menu',
      }}
    >
      <SettingsCategoryList lang={lang} active={active} onSelect={onSelect} isAdmin={isAdmin} />
    </SidebarShell>
  )
}
