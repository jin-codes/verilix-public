'use client'

import React from 'react'
import { FileText, Trash2, Loader2 } from 'lucide-react'
import type { DocumentSummary } from './use-document-browser'

interface DocumentRowListProps {
  lang: string
  documents: DocumentSummary[]
  activeId?: string
  onSelectDocument: (id: string) => void
  onRequestDelete: (doc: DocumentSummary) => void
  isSearching?: boolean
  emptyMessage: string
}

export default function DocumentRowList({
  lang,
  documents,
  activeId,
  onSelectDocument,
  onRequestDelete,
  isSearching = false,
  emptyMessage,
}: DocumentRowListProps) {
  if (isSearching) {
    return (
      <div className="px-3 py-6 flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {lang === 'ko' ? '검색 중...' : 'Searching...'}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <p className="px-3 py-6 text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {emptyMessage}
      </p>
    )
  }

  return (
    <>
      {documents.map((doc) => {
        const isActive = doc.id === activeId
        return (
          <div
            key={doc.id}
            className="group relative w-full rounded-sm"
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(200,197,188,0.35)'
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
            }}
            style={{
              backgroundColor: isActive ? 'var(--background)' : 'transparent',
            }}
          >
            <button
              onClick={() => onSelectDocument(doc.id)}
              className="w-full flex items-start gap-2.5 px-2.5 py-2 pr-8 text-left cursor-pointer"
              style={{
                color: isActive ? 'var(--foreground)' : 'var(--text-secondary)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <FileText className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--secondary)' }} />
              <div className="overflow-hidden">
                <p className="text-sm truncate leading-tight">{doc.title || 'Untitled'}</p>
                <span className="text-[10px] block mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  {new Date(doc.updated_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                </span>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRequestDelete(doc)
              }}
              title={lang === 'ko' ? '문서 삭제' : 'Delete document'}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--destructive)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </>
  )
}
