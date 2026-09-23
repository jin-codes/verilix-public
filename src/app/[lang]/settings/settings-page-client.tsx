'use client'

import dynamic from 'next/dynamic'
import type { SettingsCategory } from '@/components/settings/settings-nav'
import type { Lang } from '@/components/settings/context-fields'

const SettingsLayoutWrapper = dynamic(() => import('./settings-layout-wrapper'), { ssr: false })

interface SettingsPageClientProps {
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

export default function SettingsPageClient(props: SettingsPageClientProps) {
  return <SettingsLayoutWrapper {...props} />
}
