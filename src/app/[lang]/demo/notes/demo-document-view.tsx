'use client'

import React, { useMemo, useState } from 'react'
import { Tag, Link2, TriangleAlert, MessageSquare, ArrowLeft } from 'lucide-react'
import MarkdownMessage from '@/components/shared/markdown-message'
import KnowledgeMindmap from '@/components/notes/knowledge-mindmap'
import { DEMO_CATEGORIES, DEMO_DOCUMENTS, type DemoDocument } from '@/lib/demo/notes-data'

interface DemoDocumentViewProps {
  lang: string
  documentId: string | null
  onSelectDocument: (id: string | null) => void
  isSidebarCollapsed?: boolean
  onBack?: () => void
}

const mindmapStaticData = {
  categories: DEMO_CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
  documents: DEMO_DOCUMENTS.map((d) => ({
    id: d.id,
    title: d.title,
    summary: d.summary,
    updated_at: d.updatedAt,
    tag_node_id: d.categoryId,
    related_document_ids: d.relatedDocumentIds ?? null,
  })),
}

// 실제 DocumentView(src/components/notes/document-view.tsx)의 읽기 전용 부분을 그대로 옮긴
// 데모 전용 컴포넌트. 데모는 소유자가 없는 정적 데이터라 편집/삭제/Supabase 조회는 의도적으로
// 빼고, 대신 verilix의 특징적인 기능(모순 배지, 관련 문서, 원본 대화 보기, 지식 지도)은 그대로
// 보여준다.
export default function DemoDocumentView({
  lang,
  documentId,
  onSelectDocument,
  isSidebarCollapsed = false,
  onBack,
}: DemoDocumentViewProps) {
  const doc: DemoDocument | null = useMemo(
    () => DEMO_DOCUMENTS.find((d) => d.id === documentId) ?? null,
    [documentId]
  )

  return (
    <div
      className="flex-1 flex flex-col h-screen overflow-hidden font-sans"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <header
        className="h-14 pr-6 flex items-center gap-2 shrink-0"
        style={{ paddingLeft: isSidebarCollapsed ? '56px' : '24px', borderBottom: '1px solid var(--border)' }}
      >
        {onBack && (
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
        {doc && (
          <button
            type="button"
            onClick={() => onSelectDocument(null)}
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
      </header>

      <div className={!doc ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto px-8 py-8 select-text'}>
        {!doc ? (
          <KnowledgeMindmap lang={lang} onOpenDocument={(id) => onSelectDocument(id)} staticData={mindmapStaticData} />
        ) : (
          // key={doc.id}로 문서가 바뀔 때마다 완전히 새로 마운트되게 해서, showRaw/모순 확인 같은
          // 문서별 임시 UI 상태가 effect 없이 자연스럽게 초기화되도록 한다.
          <DemoDocumentDetail key={doc.id} lang={lang} doc={doc} onSelectDocument={onSelectDocument} />
        )}
      </div>
    </div>
  )
}

interface DemoDocumentDetailProps {
  lang: string
  doc: DemoDocument
  onSelectDocument: (id: string | null) => void
}

function DemoDocumentDetail({ lang, doc, onSelectDocument }: DemoDocumentDetailProps) {
  const [showRaw, setShowRaw] = useState(false)
  const [contradictionDismissed, setContradictionDismissed] = useState(false)

  const relatedDocs = useMemo(() => {
    if (!doc.relatedDocumentIds?.length) return []
    return doc.relatedDocumentIds
      .map((id) => DEMO_DOCUMENTS.find((d) => d.id === id))
      .filter((d): d is DemoDocument => Boolean(d))
      .map((d) => ({ id: d.id, title: d.title }))
  }, [doc.relatedDocumentIds])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {doc.contradiction && !contradictionDismissed && (
        <div
          className="p-2.5 flex items-start gap-2 rounded-md"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--destructive)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
              {lang === 'ko' ? '이 문서, 최근 대화와 어긋날 수 있어요' : 'This document may be out of date'}
            </p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {doc.contradiction}
            </p>
          </div>
          <button
            onClick={() => setContradictionDismissed(true)}
            className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium shrink-0 transition-colors"
            style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            {lang === 'ko' ? '확인함' : 'Dismiss'}
          </button>
        </div>
      )}

      <span
        className="inline-block text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full"
        style={{ backgroundColor: 'var(--sidebar)', color: 'var(--secondary)' }}
      >
        {doc.docType}
      </span>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
          {lang === 'ko' ? '요약' : 'Summary'}
        </h3>
        <MarkdownMessage content={doc.summary} lang={lang} />
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
          {lang === 'ko' ? '결론' : 'Conclusion'}
        </h3>
        <MarkdownMessage content={doc.keyConclusion} lang={lang} />
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
          {lang === 'ko' ? '배움 / 인사이트' : 'Learnings'}
        </h3>
        <MarkdownMessage content={doc.learnings} lang={lang} />
      </section>

      {doc.actionItems.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
            {lang === 'ko' ? '할 일' : 'Action Items'}
          </h3>
          <ul className="text-sm leading-relaxed pl-5 list-disc space-y-1">
            {doc.actionItems.map((item, i) => (
              <li key={i} style={{ color: 'var(--foreground)' }}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {doc.followUpQuestions.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
            {lang === 'ko' ? '후속 질문' : 'Follow-up Questions'}
          </h3>
          <ul className="text-sm leading-relaxed pl-5 list-disc space-y-1">
            {doc.followUpQuestions.map((q, i) => (
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
                  onClick={() => onSelectDocument(related.id)}
                  className="flex items-center gap-1.5 text-sm text-left hover:underline"
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

      {doc.tags.length > 0 && (
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
            {doc.rawConversation.map((m, i) => (
              <div key={i}>
                <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  {m.role}
                </p>
                <MarkdownMessage content={m.content} lang={lang} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
