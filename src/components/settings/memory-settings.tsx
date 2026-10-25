'use client'

import React, { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog'

interface InsightRow {
  id: string
  summary: string | null
  estimated_level: 'beginner' | 'intermediate' | 'advanced' | null
  updated_at: string
  tag_nodes: { name: string } | null
}

interface NoteRow {
  id: string
  content: string
  created_at: string
  tag_nodes: { name: string } | null
}

const LEVEL_LABELS = {
  beginner: { ko: '입문', en: 'Beginner' },
  intermediate: { ko: '중급', en: 'Intermediate' },
  advanced: { ko: '고급', en: 'Advanced' },
} as const

// toLocaleString은 서버/클라이언트 타임존이 달라 하이드레이션 불일치를 만들 수 있어 ISO를 직접 자른다.
function formatDate(iso: string): string {
  return iso.slice(0, 10)
}

export default function MemorySettings({ lang }: { lang: string }) {
  const isKo = lang === 'ko'
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [insights, setInsights] = useState<InsightRow[]>([])
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [pendingDelete, setPendingDelete] = useState<{ kind: 'insight' | 'note'; id: string } | null>(null)
  const [deleteError, setDeleteError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    Promise.all([
      supabase
        .from('topic_insights')
        .select('id, summary, estimated_level, updated_at, tag_nodes(name)')
        .order('updated_at', { ascending: false }),
      supabase
        .from('assistant_notes')
        .select('id, content, created_at, tag_nodes(name)')
        .order('created_at', { ascending: false })
        .limit(100),
    ]).then(([insightRes, noteRes]) => {
      if (cancelled) return
      if (insightRes.error || noteRes.error) {
        console.error('Failed to load memory', insightRes.error ?? noteRes.error)
        setState('error')
        return
      }
      setInsights((insightRes.data ?? []) as unknown as InsightRow[])
      setNotes((noteRes.data ?? []) as unknown as NoteRow[])
      setState('ready')
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    const { kind, id } = pendingDelete
    setPendingDelete(null)
    const supabase = createClient()
    // RLS가 막은 삭제는 에러 없이 0행이므로 select로 실제 삭제 여부를 확인한다.
    const { data, error } = await supabase
      .from(kind === 'insight' ? 'topic_insights' : 'assistant_notes')
      .delete()
      .eq('id', id)
      .select('id')
    if (error || !data || data.length === 0) {
      console.error('Failed to delete memory item', error)
      setDeleteError(true)
      setTimeout(() => setDeleteError(false), 2500)
      return
    }
    if (kind === 'insight') setInsights((prev) => prev.filter((i) => i.id !== id))
    else setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const deleteButton = (kind: 'insight' | 'note', id: string) => (
    <button
      type="button"
      onClick={() => setPendingDelete({ kind, id })}
      aria-label={isKo ? '삭제' : 'Delete'}
      title={isKo ? '삭제' : 'Delete'}
      className="shrink-0 p-1 rounded-sm cursor-pointer transition-colors duration-150"
      style={{ color: 'var(--neutral)' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--destructive)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--neutral)')}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )

  const visibleInsights = insights.filter((i) => i.summary || i.estimated_level)

  return (
    <section>
      <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {isKo ? 'verilix가 기억하는 것' : 'What verilix remembers'}
      </h2>
      <p className="text-xs leading-relaxed mb-5" style={{ color: 'var(--neutral)' }}>
        {isKo
          ? '연결된 AI가 대화 중 남긴 관심사·숙련도 메모와, 이를 모아 만든 주제별 분석입니다. 같은 계정의 이후 대화를 개인화하는 데에만 쓰이며 외부에 공유되지 않습니다. 개발자에게 보내는 서비스 피드백은 여기에 표시되지 않습니다. 항목은 삭제할 수 있으며, 메모를 지워도 이미 만들어진 주제별 분석은 그대로 남으므로 필요하면 분석도 함께 지우세요.'
          : 'Notes about your interests and proficiency that your connected AI left during conversations, and the per-topic analysis built from them. They are used only to personalize future conversations on this account and are never shared. Service feedback sent to the developers is not shown here. You can delete any item; deleting a note does not remove an analysis already built from it, so delete the analysis too if needed.'}
      </p>

      {state === 'loading' && (
        <p className="text-xs" style={{ color: 'var(--neutral)' }}>
          {isKo ? '불러오는 중...' : 'Loading...'}
        </p>
      )}
      {state === 'error' && (
        <p className="text-xs" style={{ color: 'var(--destructive)' }}>
          {isKo ? '불러오지 못했습니다. 잠시 후 다시 시도하세요.' : 'Failed to load. Please try again later.'}
        </p>
      )}

      {deleteError && (
        <p className="text-xs mb-3" style={{ color: 'var(--destructive)' }}>
          {isKo ? '삭제하지 못했습니다. 잠시 후 다시 시도하세요.' : 'Could not delete. Please try again later.'}
        </p>
      )}

      {state === 'ready' && (
        <>
          <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            {isKo ? '주제별 분석' : 'Per-topic analysis'}
          </h3>
          {visibleInsights.length === 0 ? (
            <p className="text-xs mb-6" style={{ color: 'var(--neutral)' }}>
              {isKo ? '아직 쌓인 분석이 없습니다.' : 'No analysis yet.'}
            </p>
          ) : (
            <ul className="space-y-2 mb-6">
              {visibleInsights.map((insight) => (
                <li
                  key={insight.id}
                  className="p-3 rounded-md"
                  style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {insight.tag_nodes?.name ?? (isKo ? '미분류' : 'Uncategorized')}
                      {insight.estimated_level && (
                        <span className="ml-2 text-xs font-normal" style={{ color: 'var(--secondary)' }}>
                          {LEVEL_LABELS[insight.estimated_level][isKo ? 'ko' : 'en']}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <span className="text-xs" style={{ color: 'var(--neutral)' }}>
                        {formatDate(insight.updated_at)}
                      </span>
                      {deleteButton('insight', insight.id)}
                    </span>
                  </div>
                  {insight.summary && (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                      {insight.summary}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            {isKo ? '최근 메모' : 'Recent notes'}
          </h3>
          {notes.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--neutral)' }}>
              {isKo ? '아직 남겨진 메모가 없습니다.' : 'No notes yet.'}
            </p>
          ) : (
            <ul className="space-y-2">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="p-3 rounded-md"
                  style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--secondary)' }}>
                      {note.tag_nodes?.name ?? (isKo ? '미분류' : 'Uncategorized')}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <span className="text-xs" style={{ color: 'var(--neutral)' }}>
                        {formatDate(note.created_at)}
                      </span>
                      {deleteButton('note', note.id)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                    {note.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ConfirmDeleteDialog
        lang={lang}
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        itemLabel={pendingDelete?.kind === 'insight' ? (isKo ? '분석' : 'analysis') : isKo ? '메모' : 'note'}
      />
    </section>
  )
}
