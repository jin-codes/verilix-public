'use client'

import React, { useState } from 'react'
import { List, Layers, Network } from 'lucide-react'
import DocumentView from './document-view'
import DocumentFilterBar from './document-filter-bar'
import DocumentRowList from './document-row-list'
import DocumentCardDeck from './document-card-deck'
import KnowledgeMindmap from './knowledge-mindmap'
import { useDocumentBrowser } from './use-document-browser'
import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog'
import SidebarFooter from '@/components/layout/sidebar-footer'
import MobileTabBar from '@/components/layout/mobile-tab-bar'

interface MobileNotesShellProps {
  lang: string
  userEmail: string
  activeDocumentId: string | null
  onSelectDocument: (id: string | null) => void
}

type ViewMode = 'list' | 'deck' | 'map'

const VIEW_MODES: { id: ViewMode; icon: typeof List; label: { ko: string; en: string } }[] = [
  { id: 'list', icon: List, label: { ko: '목록', en: 'List' } },
  { id: 'deck', icon: Layers, label: { ko: '카드', en: 'Cards' } },
  { id: 'map', icon: Network, label: { ko: '맵', en: 'Map' } },
]

export default function MobileNotesShell({ lang, userEmail, activeDocumentId, onSelectDocument }: MobileNotesShellProps) {
  const [mobileScreen, setMobileScreen] = useState<'list' | 'detail'>('list')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  // 문서 편집 저장 시 bump → 목록이 다시 조회되도록.
  const [refreshKey, setRefreshKey] = useState(0)

  const {
    tagNodes,
    query,
    setQuery,
    searchResults,
    isSearching,
    handleSearchSubmit,
    handleClearSearch,
    selectedTagId,
    setSelectedTagId,
    listToRender,
    pendingDelete,
    setPendingDelete,
    handleConfirmDelete,
  } = useDocumentBrowser({
    activeId: activeDocumentId ?? undefined,
    onActiveDeleted: () => onSelectDocument(null),
    refreshKey,
  })

  const handleOpen = (id: string) => {
    onSelectDocument(id)
    setMobileScreen('detail')
  }

  const emptyMessage =
    searchResults !== null
      ? lang === 'ko'
        ? '검색 결과가 없습니다.'
        : 'No matching documents.'
      : selectedTagId !== null
        ? lang === 'ko'
          ? '이 태그에 해당하는 문서가 없습니다.'
          : 'No documents under this tag.'
        : lang === 'ko'
          ? '아직 저장된 문서가 없습니다. 대화가 자동으로 문서화되면 여기에 표시됩니다.'
          : 'No documents yet. They will appear here once conversations are documented.'

  if (mobileScreen === 'detail') {
    return (
      <div className="flex flex-col overflow-hidden" style={{ height: '100vh', width: '100vw' }}>
        <DocumentView
          lang={lang}
          documentId={activeDocumentId}
          onSelectDocument={onSelectDocument}
          onBack={() => setMobileScreen('list')}
          onDocumentSaved={() => setRefreshKey((k) => k + 1)}
        />
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
        <DocumentFilterBar
          lang={lang}
          query={query}
          setQuery={setQuery}
          onSubmit={handleSearchSubmit}
          onClear={handleClearSearch}
          tagNodes={tagNodes}
          selectedTagId={selectedTagId}
          setSelectedTagId={setSelectedTagId}
        />

        <div className="flex items-center gap-1.5 px-3 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border-strong)' }}>
          {VIEW_MODES.map((mode) => {
            const Icon = mode.icon
            const isActive = mode.id === viewMode
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-xs cursor-pointer transition-colors"
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--background)',
                  color: isActive ? 'var(--primary-foreground)' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {lang === 'ko' ? mode.label.ko : mode.label.en}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          {viewMode === 'list' && (
            <div className="px-2 py-2 space-y-0.5">
              <DocumentRowList
                lang={lang}
                documents={listToRender}
                activeId={activeDocumentId ?? undefined}
                onSelectDocument={handleOpen}
                onRequestDelete={setPendingDelete}
                isSearching={isSearching}
                emptyMessage={emptyMessage}
              />
            </div>
          )}
          {viewMode === 'deck' && (
            <DocumentCardDeck lang={lang} documents={listToRender} onOpenDocument={handleOpen} emptyMessage={emptyMessage} />
          )}
          {viewMode === 'map' && <KnowledgeMindmap lang={lang} onOpenDocument={handleOpen} />}
        </div>

        <SidebarFooter lang={lang} userEmail={userEmail} />

        <ConfirmDeleteDialog
          lang={lang}
          open={pendingDelete !== null}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null)
          }}
          onConfirm={handleConfirmDelete}
          itemLabel={pendingDelete?.title ?? undefined}
        />
      </div>
      <MobileTabBar lang={lang} />
    </>
  )
}
