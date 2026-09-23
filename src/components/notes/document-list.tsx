'use client'

import React from 'react'
import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog'
import SidebarShell from '@/components/layout/sidebar-shell'
import DocumentFilterBar from './document-filter-bar'
import DocumentRowList from './document-row-list'
import { useDocumentBrowser } from './use-document-browser'

interface DocumentListProps {
  lang: string
  userEmail?: string
  activeId?: string
  onSelectDocument: (id: string | null) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  refreshKey?: number
}

export default function DocumentList({
  lang,
  userEmail = '',
  activeId,
  onSelectDocument,
  isCollapsed,
  onToggleCollapse,
  refreshKey,
}: DocumentListProps) {
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
  } = useDocumentBrowser({ activeId, onActiveDeleted: () => onSelectDocument(null), refreshKey })

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

  return (
    <SidebarShell
      lang={lang}
      userEmail={userEmail}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      collapseLabel={{
        expand: lang === 'ko' ? '문서 목록 펼치기' : 'Expand document list',
        collapse: lang === 'ko' ? '문서 목록 접기' : 'Collapse document list',
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

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <DocumentRowList
          lang={lang}
          documents={listToRender}
          activeId={activeId}
          onSelectDocument={onSelectDocument}
          onRequestDelete={setPendingDelete}
          isSearching={isSearching}
          emptyMessage={emptyMessage}
        />
      </div>

      <ConfirmDeleteDialog
        lang={lang}
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        itemLabel={pendingDelete?.title ?? undefined}
      />
    </SidebarShell>
  )
}
