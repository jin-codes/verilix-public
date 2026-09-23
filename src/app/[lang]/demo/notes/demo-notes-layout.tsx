'use client'

import React, { useMemo, useState } from 'react'
import SidebarShell from '@/components/layout/sidebar-shell'
import DocumentFilterBar from '@/components/notes/document-filter-bar'
import DocumentRowList from '@/components/notes/document-row-list'
import type { DocumentSummary, TagNode } from '@/components/notes/use-document-browser'
import LogoLockup from '@/components/layout/logo-lockup'
import { DEMO_CATEGORIES, DEMO_DOCUMENTS } from '@/lib/demo/notes-data'
import { useIsMobile } from '@/lib/use-is-mobile'
import DemoModeTabs from './demo-mode-tabs'
import DemoSidebarFooter from './demo-sidebar-footer'
import DemoDocumentView from './demo-document-view'

interface DemoNotesLayoutProps {
  lang: string
}

const SORTED_DOCUMENTS = [...DEMO_DOCUMENTS].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

const TAG_NODES: TagNode[] = DEMO_CATEGORIES.map((c) => ({ id: c.id, name: c.name }))

function toSummary(d: (typeof DEMO_DOCUMENTS)[number]): DocumentSummary {
  return { id: d.id, title: d.title, updated_at: d.updatedAt, doc_type: d.docType, tag_node_id: d.categoryId }
}

function matchesQuery(doc: (typeof DEMO_DOCUMENTS)[number], q: string) {
  const needle = q.toLowerCase()
  return (
    doc.title.toLowerCase().includes(needle) ||
    doc.summary.toLowerCase().includes(needle) ||
    doc.keyConclusion.toLowerCase().includes(needle) ||
    doc.tags.some((t) => t.toLowerCase().includes(needle))
  )
}

// 실제 NotesLayoutWrapper(src/app/[lang]/notes/notes-layout-wrapper.tsx)와 같은 2단 구성을
// 정적 데이터로 재구현한 데모용 레이아웃. Supabase 조회 대신 lib/demo/notes-data.ts의 고정
// 데이터를 클라이언트에서 직접 검색/필터링한다.
export default function DemoNotesLayout({ lang }: DemoNotesLayoutProps) {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [isListCollapsed, setIsListCollapsed] = useState(false)
  const [query, setQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const listToRender = useMemo(() => {
    const base = searchQuery ? SORTED_DOCUMENTS.filter((d) => matchesQuery(d, searchQuery)) : SORTED_DOCUMENTS
    const filtered = selectedTagId ? base.filter((d) => d.categoryId === selectedTagId) : base
    return filtered.map(toSummary)
  }, [searchQuery, selectedTagId])

  const emptyMessage =
    searchQuery !== null
      ? lang === 'ko'
        ? '검색 결과가 없습니다.'
        : 'No matching documents.'
      : lang === 'ko'
        ? '이 태그에 해당하는 문서가 없습니다.'
        : 'No documents under this tag.'

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    setSearchQuery(q || null)
  }

  const handleClearSearch = () => {
    setQuery('')
    setSearchQuery(null)
  }

  const filterBar = (
    <DocumentFilterBar
      lang={lang}
      query={query}
      setQuery={setQuery}
      onSubmit={handleSearchSubmit}
      onClear={handleClearSearch}
      tagNodes={TAG_NODES}
      selectedTagId={selectedTagId}
      setSelectedTagId={setSelectedTagId}
    />
  )

  const rowList = (
    <DocumentRowList
      lang={lang}
      documents={listToRender}
      activeId={activeDocumentId ?? undefined}
      onSelectDocument={setActiveDocumentId}
      onRequestDelete={() => {}}
      emptyMessage={emptyMessage}
    />
  )

  if (isMobile) {
    if (activeDocumentId) {
      return (
        <div style={{ height: '100vh', width: '100vw', backgroundColor: 'var(--background)' }}>
          <DemoDocumentView
            lang={lang}
            documentId={activeDocumentId}
            onSelectDocument={setActiveDocumentId}
            onBack={() => setActiveDocumentId(null)}
          />
        </div>
      )
    }
    return (
      <div
        className="flex flex-col h-screen overflow-hidden font-sans"
        style={{ backgroundColor: 'var(--sidebar)' }}
      >
        <div className="h-12 flex items-center px-4 shrink-0" style={{ borderBottom: '1px solid var(--border-strong)' }}>
          <LogoLockup className="h-[20px] w-auto" />
        </div>
        {filterBar}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">{rowList}</div>
        <DemoSidebarFooter lang={lang} />
      </div>
    )
  }

  return (
    <div className="flex overflow-hidden" style={{ height: '100vh', width: '100vw', backgroundColor: 'var(--background)' }}>
      <SidebarShell
        lang={lang}
        isCollapsed={isListCollapsed}
        onToggleCollapse={() => setIsListCollapsed((v) => !v)}
        collapseLabel={{
          expand: lang === 'ko' ? '문서 목록 펼치기' : 'Expand document list',
          collapse: lang === 'ko' ? '문서 목록 접기' : 'Collapse document list',
        }}
        modeTabs={<DemoModeTabs lang={lang} />}
        footer={<DemoSidebarFooter lang={lang} />}
      >
        {filterBar}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">{rowList}</div>
      </SidebarShell>

      <DemoDocumentView
        lang={lang}
        documentId={activeDocumentId}
        onSelectDocument={setActiveDocumentId}
        isSidebarCollapsed={isListCollapsed}
      />
    </div>
  )
}
