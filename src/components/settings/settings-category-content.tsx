'use client'

import React from 'react'
import GeneralSettings from './general-settings'
import DarkModeSettings from './dark-mode-settings'
import DigestSettings from './digest-settings'
import DocumentSettings from './document-settings'
import BackgroundContext from './background-context'
import ByokSettings from './byok-settings'
import AccountSettings from './account-settings'
import type { SettingsCategory } from './settings-nav'
import type { Lang } from './context-fields'

interface SettingsCategoryContentProps {
  lang: string
  userId: string
  userEmail: string
  activeCategory: SettingsCategory
  initialContext: string
  initialUpdatedAt: string | null
  initialUiLanguage: Lang
  initialDocLanguage: Lang
  initialDigestEnabled: boolean
}

export default function SettingsCategoryContent({
  lang,
  userId,
  userEmail,
  activeCategory,
  initialContext,
  initialUpdatedAt,
  initialUiLanguage,
  initialDocLanguage,
  initialDigestEnabled,
}: SettingsCategoryContentProps) {
  return (
    <>
      {activeCategory === 'general' && (
        <>
          <GeneralSettings lang={lang} userId={userId} initialUiLanguage={initialUiLanguage} />
          <DarkModeSettings lang={lang} />
          <DigestSettings lang={lang} userId={userId} initialEnabled={initialDigestEnabled} />
        </>
      )}

      {activeCategory === 'documents' && (
        <DocumentSettings lang={lang} userId={userId} initialDocLanguage={initialDocLanguage} />
      )}

      {activeCategory === 'profile' && (
        <BackgroundContext lang={lang} userId={userId} initialContext={initialContext} initialUpdatedAt={initialUpdatedAt} />
      )}

      {activeCategory === 'byok' && <ByokSettings lang={lang} />}

      {activeCategory === 'account' && <AccountSettings lang={lang} userEmail={userEmail} />}
    </>
  )
}
