'use client'

import React, { useEffect, useState } from 'react'
import { Tag, Link2, TriangleAlert, MessageSquare, ArrowLeft, Pencil, X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import MarkdownMessage from '@/components/shared/markdown-message'
import KnowledgeMindmap from '@/components/notes/knowledge-mindmap'

const DOC_TYPE_OPTIONS = ['general', 'meeting', 'spec', 'report', 'idea', 'research'] as const

interface EditForm {
  title: string
  summary: string
  key_conclusion: string
  learnings: string
  action_items: string // 한 줄에 하나
  follow_up_questions: string // 한 줄에 하나
  tags: string // 쉼표로 구분
  doc_type: string
}

interface RawConversation {
  messages?: { role: string; content: string }[]
  text?: string
}

interface Document {
  id: string
  title: string | null
  summary: string | null
  key_conclusion: string | null
  learnings: string | null
  action_items: string[] | null
  follow_up_questions: string[] | null
  tags: string[] | null
  doc_type: string | null
  related_document_ids: string[] | null
  raw_conversation: RawConversation | null
  updated_at: string
}

interface RelatedDocument {
  id: string
  title: string | null
}

interface Contradiction {
  id: string
  content: string
}

interface DocumentViewProps {
  lang: string
  documentId: string | null
  onSelectDocument?: (id: string | null) => void
  isSidebarCollapsed?: boolean
  onBack?: () => void
  onDocumentSaved?: () => void
}

export default function DocumentView({
  lang,
  documentId,
  onSelectDocument,
  isSidebarCollapsed = false,
  onBack,
  onDocumentSaved,
}: DocumentViewProps) {
  const [doc, setDoc] = useState<Document | null>(null)
  const [relatedDocs, setRelatedDocs] = useState<RelatedDocument[]>([])
  const [contradictions, setContradictions] = useState<Contradiction[]>([])
  const [showRaw, setShowRaw] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<EditForm | null>(null)
  const [commitMessage, setCommitMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const isKo = lang === 'ko'
  const inputClass = 'w-full p-2.5 text-sm outline-none rounded-sm'
  const inputStyle = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
  } as const

  useEffect(() => {
    setShowRaw(false)
    setIsEditing(false)
    setForm(null)
    setCommitMessage('')
    setSaveError(null)
    if (!documentId) {
      setDoc(null)
      setContradictions([])
      return
    }
    const supabase = createClient()
    supabase
      .from('documents')
      .select(
        'id, title, summary, key_conclusion, learnings, action_items, follow_up_questions, tags, doc_type, related_document_ids, raw_conversation, updated_at'
      )
      .eq('id', documentId)
      .single()
      .then(({ data }) => setDoc(data ?? null))
    supabase
      .from('document_contradictions')
      .select('id, content')
      .eq('document_id', documentId)
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => setContradictions(data ?? []))
  }, [documentId])

  const handleResolveContradiction = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('document_contradictions').update({ resolved: true }).eq('id', id)
    if (error) return
    setContradictions((prev) => prev.filter((c) => c.id !== id))
  }

  const startEdit = () => {
    if (!doc) return
    setForm({
      title: doc.title ?? '',
      summary: doc.summary ?? '',
      key_conclusion: doc.key_conclusion ?? '',
      learnings: doc.learnings ?? '',
      action_items: (doc.action_items ?? []).join('\n'),
      follow_up_questions: (doc.follow_up_questions ?? []).join('\n'),
      tags: (doc.tags ?? []).join(', '),
      doc_type: doc.doc_type ?? 'general',
    })
    setCommitMessage('')
    setSaveError(null)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setForm(null)
    setSaveError(null)
  }

  const handleSave = async () => {
    if (!doc || !form) return

    const nextActionItems = form.action_items.split('\n').map((s) => s.trim()).filter(Boolean)
    const nextFollowUps = form.follow_up_questions.split('\n').map((s) => s.trim()).filter(Boolean)
    const nextTags = form.tags.split(',').map((s) => s.trim()).filter(Boolean)

    const eqArr = (a: string[], b: string[] | null) => JSON.stringify(a) === JSON.stringify(b ?? [])

    const payload: Record<string, unknown> = { documentId: doc.id }
    if (form.title.trim() !== (doc.title ?? '')) payload.title = form.title.trim()
    if (form.summary !== (doc.summary ?? '')) payload.summary = form.summary
    if (form.key_conclusion !== (doc.key_conclusion ?? '')) payload.keyConclusion = form.key_conclusion
    if (form.learnings !== (doc.learnings ?? '')) payload.learnings = form.learnings
    if (!eqArr(nextActionItems, doc.action_items)) payload.actionItems = nextActionItems
    if (!eqArr(nextFollowUps, doc.follow_up_questions)) payload.followUpQuestions = nextFollowUps
    if (!eqArr(nextTags, doc.tags)) payload.tags = nextTags
    if (form.doc_type !== (doc.doc_type ?? 'general')) payload.docType = form.doc_type

    if (Object.keys(payload).length === 1) {
      setSaveError(isKo ? '변경된 내용이 없습니다.' : 'Nothing has changed.')
      return
    }
    if (commitMessage.trim()) payload.message = commitMessage.trim()

    setIsSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/documents/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        setSaveError(text || (isKo ? '저장에 실패했습니다.' : 'Failed to save.'))
        return
      }
      const json = await res.json()
      setDoc(json.document as Document)
      setIsEditing(false)
      setForm(null)
      setCommitMessage('')
      onDocumentSaved?.()
    } catch {
      setSaveError(isKo ? '저장에 실패했습니다.' : 'Failed to save.')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (!doc?.related_document_ids || doc.related_document_ids.length === 0) {
      setRelatedDocs([])
      return
    }
    const supabase = createClient()
    supabase
      .from('documents')
      .select('id, title')
      .in('id', doc.related_document_ids)
      .then(({ data }) => setRelatedDocs(data ?? []))
  }, [doc?.related_document_ids])

  return (
    <div
      className="flex-1 flex flex-col h-screen overflow-hidden font-sans"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <header
        className="h-14 pr-6 flex items-center gap-2 shrink-0"
        style={{ paddingLeft: isSidebarCollapsed ? '56px' : '24px', borderBottom: '1px solid var(--border)' }}
      >
        {onBack && !isEditing && (
          <button
            type="button"
            onClick={onBack}
            title={lang === 'ko' ? '목록으로' : 'Back to list'}
            className="md:hidden p-1 -ml-1 rounded-sm cursor-pointer transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        {doc && !isEditing && (
          <button
            type="button"
            onClick={() => onSelectDocument?.(null)}
            title={lang === 'ko' ? '맵으로 돌아가기' : 'Back to map'}
            className="hidden md:flex p-1 -ml-1 rounded-sm cursor-pointer transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <span className="text-sm font-semibold min-w-0 truncate" style={{ color: 'var(--foreground)' }}>
          {doc?.title || (lang === 'ko' ? '지식 베이스' : 'Knowledge Base')}
        </span>

        {doc && !isEditing && (
          <button
            type="button"
            onClick={startEdit}
            title={isKo ? '문서 편집' : 'Edit document'}
            className="ml-auto shrink-0 p-1 rounded-sm cursor-pointer transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {isEditing && (
          <div className="ml-auto shrink-0 flex items-center gap-1.5">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSaving}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm cursor-pointer transition-colors disabled:cursor-not-allowed"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)', backgroundColor: 'transparent' }}
            >
              <X className="w-3.5 h-3.5" />
              {isKo ? '취소' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm transition-colors"
              style={{
                backgroundColor: isSaving ? 'var(--border-strong)' : 'var(--primary)',
                color: 'var(--primary-foreground)',
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              <Check className="w-3.5 h-3.5" />
              {isSaving ? (isKo ? '저장 중…' : 'Saving…') : isKo ? '저장' : 'Save'}
            </button>
          </div>
        )}
      </header>

      <div
        className={!documentId || !doc ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto px-8 py-8 select-text'}
      >
        {!documentId || !doc ? (
          <KnowledgeMindmap lang={lang} onOpenDocument={(id) => onSelectDocument?.(id)} />
        ) : isEditing && form ? (
          <div className="max-w-2xl mx-auto space-y-5">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                {isKo ? '제목' : 'Title'}
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                {isKo ? '유형' : 'Type'}
              </label>
              <select
                value={form.doc_type}
                onChange={(e) => setForm({ ...form, doc_type: e.target.value })}
                className={inputClass}
                style={inputStyle}
              >
                {DOC_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                {isKo ? '요약' : 'Summary'}
              </label>
              <textarea
                rows={6}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className={`${inputClass} resize-y leading-relaxed`}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                {isKo ? '결론' : 'Conclusion'}
              </label>
              <textarea
                rows={4}
                value={form.key_conclusion}
                onChange={(e) => setForm({ ...form, key_conclusion: e.target.value })}
                className={`${inputClass} resize-y leading-relaxed`}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                {isKo ? '배움 / 인사이트' : 'Learnings'}
              </label>
              <textarea
                rows={4}
                value={form.learnings}
                onChange={(e) => setForm({ ...form, learnings: e.target.value })}
                className={`${inputClass} resize-y leading-relaxed`}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                {isKo ? '할 일' : 'Action Items'}
              </label>
              <textarea
                rows={3}
                value={form.action_items}
                onChange={(e) => setForm({ ...form, action_items: e.target.value })}
                className={`${inputClass} resize-y leading-relaxed`}
                style={inputStyle}
              />
              <p className="mt-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                {isKo ? '한 줄에 하나씩' : 'One per line'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                {isKo ? '후속 질문' : 'Follow-up Questions'}
              </label>
              <textarea
                rows={3}
                value={form.follow_up_questions}
                onChange={(e) => setForm({ ...form, follow_up_questions: e.target.value })}
                className={`${inputClass} resize-y leading-relaxed`}
                style={inputStyle}
              />
              <p className="mt-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                {isKo ? '한 줄에 하나씩' : 'One per line'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                {isKo ? '태그' : 'Tags'}
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
              <p className="mt-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                {isKo ? '쉼표로 구분' : 'Comma-separated'}
              </p>
            </div>

            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                {isKo ? '변경 메모 (선택)' : 'Change note (optional)'}
              </label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder={isKo ? '예: 결론을 최신 내용으로 수정' : 'e.g. Updated the conclusion'}
                className={inputClass}
                style={inputStyle}
              />
              <p className="mt-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                {isKo
                  ? '이전 버전은 그대로 보관되며, 이 메모와 함께 기록에 남습니다.'
                  : 'The previous version is kept in history along with this note.'}
              </p>
            </div>

            {saveError && (
              <p className="text-xs" style={{ color: 'var(--destructive)' }}>
                {saveError}
              </p>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 py-2 px-4 rounded-sm font-medium text-xs transition-colors"
                style={{
                  backgroundColor: isSaving ? 'var(--border-strong)' : 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                }}
              >
                {isSaving ? (isKo ? '저장 중…' : 'Saving…') : isKo ? '저장' : 'Save'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
                className="py-2 px-4 rounded-sm text-xs cursor-pointer transition-colors disabled:cursor-not-allowed"
                style={{ border: '1px solid var(--border)', color: 'var(--foreground)', backgroundColor: 'transparent' }}
              >
                {isKo ? '취소' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {contradictions.length > 0 && (
              <div className="space-y-2">
                {contradictions.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 flex items-start gap-2 rounded-md"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--destructive)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                        {lang === 'ko' ? '이 문서, 최근 대화와 어긋날 수 있어요' : 'This document may be out of date'}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {c.content}
                      </p>
                    </div>
                    <button
                      onClick={() => handleResolveContradiction(c.id)}
                      className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium shrink-0 transition-colors"
                      style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    >
                      {lang === 'ko' ? '확인함' : 'Dismiss'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {doc.doc_type && (
              <span
                className="inline-block text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--sidebar)', color: 'var(--secondary)' }}
              >
                {doc.doc_type}
              </span>
            )}

            {doc.summary && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  {lang === 'ko' ? '요약' : 'Summary'}
                </h3>
                <MarkdownMessage content={doc.summary} lang={lang} />
              </section>
            )}

            {doc.key_conclusion && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  {lang === 'ko' ? '결론' : 'Conclusion'}
                </h3>
                <MarkdownMessage content={doc.key_conclusion} lang={lang} />
              </section>
            )}

            {doc.learnings && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  {lang === 'ko' ? '배움 / 인사이트' : 'Learnings'}
                </h3>
                <MarkdownMessage content={doc.learnings} lang={lang} />
              </section>
            )}

            {doc.action_items && doc.action_items.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  {lang === 'ko' ? '할 일' : 'Action Items'}
                </h3>
                <ul className="text-sm leading-relaxed pl-5 list-disc space-y-1">
                  {doc.action_items.map((item, i) => (
                    <li key={i} style={{ color: 'var(--foreground)' }}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {doc.follow_up_questions && doc.follow_up_questions.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  {lang === 'ko' ? '후속 질문' : 'Follow-up Questions'}
                </h3>
                <ul className="text-sm leading-relaxed pl-5 list-disc space-y-1">
                  {doc.follow_up_questions.map((q, i) => (
                    <li key={i} style={{ color: 'var(--foreground)' }}>{q}</li>
                  ))}
                </ul>
              </section>
            )}

            {relatedDocs.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  {lang === 'ko' ? '관련 문서' : 'Related Documents'}
                </h3>
                <ul className="space-y-1.5">
                  {relatedDocs.map((related) => (
                    <li key={related.id}>
                      <button
                        type="button"
                        onClick={() => onSelectDocument?.(related.id)}
                        className="flex items-center gap-1.5 text-sm text-left hover:underline disabled:no-underline disabled:cursor-default"
                        disabled={!onSelectDocument}
                        style={{ color: 'var(--primary)' }}
                      >
                        <Link2 className="w-3.5 h-3.5 shrink-0" />
                        {related.title || (lang === 'ko' ? '제목 없음' : 'Untitled')}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--sidebar)', color: 'var(--text-secondary)' }}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {doc.raw_conversation && (
              <section>
                <button
                  type="button"
                  onClick={() => setShowRaw((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2 cursor-pointer"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {showRaw
                    ? lang === 'ko'
                      ? '원본 대화 숨기기'
                      : 'Hide Raw Conversation'
                    : lang === 'ko'
                      ? '원본 대화 보기'
                      : 'View Raw Conversation'}
                </button>
                {showRaw && (
                  <div
                    className="rounded-md p-3 space-y-3"
                    style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)' }}
                  >
                    {doc.raw_conversation.messages && doc.raw_conversation.messages.length > 0 ? (
                      doc.raw_conversation.messages.map((m, i) => (
                        <div key={i}>
                          <p
                            className="text-[10px] uppercase font-semibold mb-1"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {m.role}
                          </p>
                          <MarkdownMessage content={m.content} lang={lang} />
                        </div>
                      ))
                    ) : doc.raw_conversation.text ? (
                      <MarkdownMessage content={doc.raw_conversation.text} lang={lang} />
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {lang === 'ko' ? '표시할 원본이 없습니다.' : 'No raw content available.'}
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
