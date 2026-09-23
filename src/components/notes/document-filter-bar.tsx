'use client'

import React from 'react'
import { Search, X } from 'lucide-react'
import type { TagNode } from './use-document-browser'

interface DocumentFilterBarProps {
  lang: string
  query: string
  setQuery: (q: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClear: () => void
  tagNodes: TagNode[]
  selectedTagId: string | null
  setSelectedTagId: (id: string | null) => void
}

export default function DocumentFilterBar({
  lang,
  query,
  setQuery,
  onSubmit,
  onClear,
  tagNodes,
  selectedTagId,
  setSelectedTagId,
}: DocumentFilterBarProps) {
  return (
    <>
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border-strong)' }}>
        <form onSubmit={onSubmit} className="relative flex items-center">
          <button
            type="submit"
            title={lang === 'ko' ? '검색' : 'Search'}
            className="absolute left-2 p-0.5 rounded-sm cursor-pointer"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'ko' ? '문서 검색' : 'Search documents'}
            className="w-full text-sm outline-none transition-colors rounded-sm"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              padding: '8px 28px',
              color: 'var(--foreground)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          {query && (
            <button
              type="button"
              onClick={onClear}
              title={lang === 'ko' ? '지우기' : 'Clear'}
              className="absolute right-2 p-0.5 rounded-sm cursor-pointer"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {tagNodes.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-1.5 px-3 py-2"
          style={{ borderBottom: '1px solid var(--border-strong)' }}
        >
          <button
            onClick={() => setSelectedTagId(null)}
            className="text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors"
            style={{
              backgroundColor: selectedTagId === null ? 'var(--primary)' : 'var(--background)',
              color: selectedTagId === null ? 'var(--primary-foreground)' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {lang === 'ko' ? '전체' : 'All'}
          </button>
          {tagNodes.map((tag) => {
            const isSelected = tag.id === selectedTagId
            return (
              <button
                key={tag.id}
                onClick={() => setSelectedTagId(isSelected ? null : tag.id)}
                className="shrink-0 text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                style={{
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--background)',
                  color: isSelected ? 'var(--primary-foreground)' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
