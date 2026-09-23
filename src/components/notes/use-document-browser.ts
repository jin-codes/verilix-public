'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DocumentSummary {
  id: string
  title: string | null
  updated_at: string
  doc_type: string | null
  tag_node_id: string | null
}

export interface TagNode {
  id: string
  name: string
}

interface UseDocumentBrowserOptions {
  activeId?: string
  onActiveDeleted?: () => void
  // 값이 바뀌면 문서/태그 목록을 다시 불러온다 (문서 편집 저장 후 제목 등 반영용).
  refreshKey?: number
}

// Fetch/search/tag-filter/delete logic shared by the desktop document list and
// the mobile list/deck/map toggle — all three views need to stay in sync on the
// same tag filter + search state, so this lives in one hook rather than being
// duplicated per view.
export function useDocumentBrowser({ activeId, onActiveDeleted, refreshKey = 0 }: UseDocumentBrowserOptions = {}) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [pendingDelete, setPendingDelete] = useState<DocumentSummary | null>(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DocumentSummary[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [tagNodes, setTagNodes] = useState<TagNode[]>([])
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('documents')
      .select('id, title, updated_at, doc_type, tag_node_id')
      .eq('is_archived', false)
      .order('updated_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setDocuments(data ?? []))
    supabase
      .from('tag_nodes')
      .select('id, name')
      .eq('depth', 1)
      .order('name', { ascending: true })
      .then(({ data }) => setTagNodes(data ?? []))
  }, [refreshKey])

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) {
      setSearchResults(null)
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(`/api/documents/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      setSearchResults(res.ok ? (json.documents ?? []) : [])
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearSearch = () => {
    setQuery('')
    setSearchResults(null)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    const target = pendingDelete
    setPendingDelete(null)
    const supabase = createClient()

    // 하드 삭제 대신 소프트 삭제(휴지통) — 데이터는 보존되고 MCP restore_document로 복구 가능.
    // 삭제 직전 상태를 document_versions에 스냅샷으로 남겨 이력에 삭제 이벤트를 기록한다.
    const { data: doc } = await supabase
      .from('documents')
      .select(
        'user_id, title, summary, key_conclusion, learnings, action_items, follow_up_questions, tags, doc_type, tag_node_id, folder_id, raw_conversation, version, is_archived'
      )
      .eq('id', target.id)
      .maybeSingle()
    if (!doc) return

    await supabase.from('document_versions').insert({
      document_id: target.id,
      user_id: doc.user_id,
      version: doc.version ?? 1,
      message: 'Deleted',
      snapshot: {
        title: doc.title,
        summary: doc.summary,
        key_conclusion: doc.key_conclusion,
        learnings: doc.learnings,
        action_items: doc.action_items,
        follow_up_questions: doc.follow_up_questions,
        tags: doc.tags,
        doc_type: doc.doc_type,
        tag_node_id: doc.tag_node_id,
        folder_id: doc.folder_id,
        raw_conversation: doc.raw_conversation,
        is_archived: doc.is_archived ?? false,
      },
    })

    const { error } = await supabase
      .from('documents')
      .update({ is_archived: true, version: (doc.version ?? 1) + 1, updated_at: new Date().toISOString() })
      .eq('id', target.id)
    if (error) return
    setDocuments((prev) => prev.filter((d) => d.id !== target.id))
    setSearchResults((prev) => (prev ? prev.filter((d) => d.id !== target.id) : prev))
    if (activeId === target.id) onActiveDeleted?.()
  }

  const baseList = searchResults ?? documents
  const listToRender = selectedTagId ? baseList.filter((d) => d.tag_node_id === selectedTagId) : baseList

  return {
    documents,
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
  }
}
