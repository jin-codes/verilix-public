'use client'

import React, { useState } from 'react'
import DocumentList from '@/components/notes/document-list'
import DocumentView from '@/components/notes/document-view'
import MobileNotesShell from '@/components/notes/mobile-notes-shell'
import { usePersistedCollapse } from '@/lib/use-persisted-collapse'
import { useIsMobile } from '@/lib/use-is-mobile'

interface NotesLayoutWrapperProps {
  lang: string
  userEmail: string
}

export default function NotesLayoutWrapper({ lang, userEmail }: NotesLayoutWrapperProps) {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  // 문서 편집 저장 시 bump → 목록(제목 등)이 다시 조회되도록.
  const [refreshKey, setRefreshKey] = useState(0)
  const { isCollapsed: isListCollapsed, toggle: toggleListCollapsed } = usePersistedCollapse()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <MobileNotesShell
        lang={lang}
        userEmail={userEmail}
        activeDocumentId={activeDocumentId}
        onSelectDocument={setActiveDocumentId}
      />
    )
  }

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: '100vh', width: '100vw', backgroundColor: 'var(--background)' }}
    >
      {/* 1. Document List (mode tabs + list, merged) */}
      <DocumentList
        lang={lang}
        userEmail={userEmail}
        activeId={activeDocumentId ?? undefined}
        onSelectDocument={setActiveDocumentId}
        isCollapsed={isListCollapsed}
        onToggleCollapse={toggleListCollapsed}
        refreshKey={refreshKey}
      />

      {/* 2. Document Detail */}
      <DocumentView
        lang={lang}
        documentId={activeDocumentId}
        onSelectDocument={setActiveDocumentId}
        isSidebarCollapsed={isListCollapsed}
        onDocumentSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
