'use client'

import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import SettingsCategoryList, { CATEGORY_TITLES, type SettingsCategory } from './settings-category-list'
import SettingsCategoryContent from './settings-category-content'
import SidebarFooter from '@/components/layout/sidebar-footer'
import MobileTabBar from '@/components/layout/mobile-tab-bar'

type ContentProps = React.ComponentProps<typeof SettingsCategoryContent>

interface MobileSettingsShellProps {
  lang: string
  userEmail: string
  isAdmin: boolean
  onSelectCategory: (category: SettingsCategory) => void
  contentProps: ContentProps
}

export default function MobileSettingsShell({
  lang,
  userEmail,
  isAdmin,
  onSelectCategory,
  contentProps,
}: MobileSettingsShellProps) {
  const isKo = lang === 'ko'
  const [mobileScreen, setMobileScreen] = useState<'list' | 'detail'>('list')

  const handleSelect = (category: SettingsCategory) => {
    onSelectCategory(category)
    setMobileScreen('detail')
  }

  if (mobileScreen === 'detail') {
    return (
      <div className="flex flex-col overflow-hidden" style={{ height: '100vh', width: '100vw' }}>
        <header
          className="h-14 px-4 flex items-center gap-2 shrink-0"
          style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}
        >
          <button
            type="button"
            onClick={() => setMobileScreen('list')}
            title={isKo ? '목록으로' : 'Back to list'}
            className="p-1 -ml-1 rounded-sm cursor-pointer"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {isKo ? CATEGORY_TITLES[contentProps.activeCategory].ko : CATEGORY_TITLES[contentProps.activeCategory].en}
          </span>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-10" style={{ backgroundColor: 'var(--background)' }}>
          <SettingsCategoryContent {...contentProps} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="flex flex-col overflow-hidden"
        style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: 'var(--background)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'calc(56px + env(safe-area-inset-bottom))',
        }}
      >
        <SettingsCategoryList lang={lang} active={contentProps.activeCategory} onSelect={handleSelect} isAdmin={isAdmin} />
        <SidebarFooter lang={lang} userEmail={userEmail} />
      </div>
      <MobileTabBar lang={lang} />
    </>
  )
}
