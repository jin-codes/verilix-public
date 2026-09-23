import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, MessageSquare, FileText, Brain, StickyNote } from 'lucide-react'
import { hasLocale } from '../../../dictionaries'
import { requireAdmin } from '@/lib/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

interface Props {
  params: Promise<{ lang: string; userId: string }>
}

const LEVEL_LABEL: Record<string, { ko: string; en: string }> = {
  beginner: { ko: '초급', en: 'Beginner' },
  intermediate: { ko: '중급', en: 'Intermediate' },
  advanced: { ko: '고급', en: 'Advanced' },
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { lang, userId } = await params
  if (!hasLocale(lang)) notFound()

  await requireAdmin(lang)
  const isKo = lang === 'ko'

  const admin = createAdminClient()
  const [{ data: profile }, { data: conversations }, { data: documents }, { data: insights }, { data: notes }] =
    await Promise.all([
      admin
        .from('profiles')
        .select('id, email, display_name, plan, is_admin, created_at, current_goal')
        .eq('id', userId)
        .single(),
      admin
        .from('conversations')
        .select('id, title, model, model_mode, knowledge_mode, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }),
      admin
        .from('documents')
        .select('id, title, doc_type, tags, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }),
      // 히든 채널 LEVEL/NOTE(임계치 도달분)가 태그별로 합성된 결과. 태그 이름은 tag_nodes와 조인해 사람이 읽을 수 있게 붙인다.
      admin
        .from('topic_insights')
        .select('id, tag_node_id, summary, estimated_level, source_note_count, updated_at, tag_nodes(name)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }),
      // NOTE 히든 태그가 매 턴 남긴 원본 관찰 기록. consumed=false면 아직 topic_insights로 합성되기 전(임계치 미달) 상태.
      admin
        .from('assistant_notes')
        .select('id, content, conversation_id, consumed, created_at, tag_nodes(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ])

  if (!profile) notFound()

  type TagNodeRef = { name: string } | { name: string }[] | null
  const tagName = (ref: TagNodeRef): string | null => (Array.isArray(ref) ? (ref[0]?.name ?? null) : (ref?.name ?? null))

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <header
        className="h-14 px-8 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--sidebar)' }}
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {profile.email}
            {profile.is_admin && <ShieldCheck className="w-3.5 h-3.5 inline-block ml-1.5" style={{ color: 'var(--destructive)' }} />}
          </span>
        </div>
        <Link
          href={`/${lang}/admin`}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-sm cursor-pointer transition-colors duration-150"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isKo ? '대시보드로' : 'Back to dashboard'}
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: isKo ? '플랜' : 'Plan', value: profile.plan ?? 'free' },
            { label: isKo ? '가입일' : 'Joined', value: profile.created_at.slice(0, 10) },
            { label: isKo ? '대화 수' : 'Conversations', value: String(conversations?.length ?? 0) },
            { label: isKo ? '문서 수' : 'Documents', value: String(documents?.length ?? 0) },
          ].map((card) => (
            <div key={card.label} className="rounded-md p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                {card.label}
              </p>
              <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {profile.current_goal && (
          <div className="rounded-md p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
              {isKo ? '현재 목표 (GOAL, 히든 채널)' : 'Current Goal (GOAL, hidden channel)'}
            </p>
            <p className="text-sm" style={{ color: 'var(--foreground)' }}>
              {profile.current_goal}
            </p>
          </div>
        )}

        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
            <MessageSquare className="w-3.5 h-3.5" />
            {isKo ? '대화' : 'Conversations'}
          </p>
          <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--sidebar)' }}>
                  {[isKo ? '제목' : 'Title', isKo ? '모델' : 'Model', isKo ? '최근 업데이트' : 'Updated'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--neutral)', borderBottom: '1px solid var(--border)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(conversations ?? []).map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/${lang}/admin/users/${userId}/conversations/${c.id}`}
                        className="cursor-pointer hover:underline"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {c.title ?? (isKo ? '(제목 없음)' : '(untitled)')}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>
                      {c.model_mode}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {c.updated_at.replace('T', ' ').slice(0, 16)} UTC
                    </td>
                  </tr>
                ))}
                {(conversations ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                      {isKo ? '대화가 없습니다.' : 'No conversations.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
            <FileText className="w-3.5 h-3.5" />
            {isKo ? '문서' : 'Documents'}
          </p>
          <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--sidebar)' }}>
                  {[isKo ? '제목' : 'Title', isKo ? '유형' : 'Type', isKo ? '최근 업데이트' : 'Updated'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--neutral)', borderBottom: '1px solid var(--border)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(documents ?? []).map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/${lang}/admin/users/${userId}/documents/${d.id}`}
                        className="cursor-pointer hover:underline"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {d.title ?? (isKo ? '(제목 없음)' : '(untitled)')}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>
                      {d.doc_type}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {d.updated_at.replace('T', ' ').slice(0, 16)} UTC
                    </td>
                  </tr>
                ))}
                {(documents ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                      {isKo ? '문서가 없습니다.' : 'No documents.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
            <Brain className="w-3.5 h-3.5" />
            {isKo ? '태그별 분석 (topic_insights)' : 'Topic Insights'}
          </p>
          <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--sidebar)' }}>
                  {[
                    isKo ? '태그' : 'Tag',
                    isKo ? '숙련도' : 'Level',
                    isKo ? '요약' : 'Summary',
                    isKo ? '반영된 노트 수' : 'Notes',
                    isKo ? '최근 갱신' : 'Updated',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--neutral)', borderBottom: '1px solid var(--border)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(insights ?? []).map((row) => {
                  const level = row.estimated_level ? LEVEL_LABEL[row.estimated_level] : null
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                        {tagName(row.tag_nodes) ?? (isKo ? '(태그 없음)' : '(no tag)')}
                      </td>
                      <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                        {level ? (isKo ? level.ko : level.en) : '—'}
                      </td>
                      <td className="px-4 py-2.5 align-top max-w-md" style={{ color: 'var(--foreground)' }}>
                        {row.summary ?? (isKo ? '(아직 합성 전)' : '(not yet synthesized)')}
                      </td>
                      <td className="px-4 py-2.5 align-top" style={{ color: 'var(--text-secondary)' }}>
                        {row.source_note_count}
                      </td>
                      <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                        {row.updated_at.replace('T', ' ').slice(0, 16)} UTC
                      </td>
                    </tr>
                  )
                })}
                {(insights ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                      {isKo ? '태그별 분석이 없습니다.' : 'No topic insights.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
            <StickyNote className="w-3.5 h-3.5" />
            {isKo ? '관찰 기록 (NOTE, 히든 채널)' : 'Observation Notes (NOTE, hidden channel)'}
          </p>
          <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--sidebar)' }}>
                  {[
                    isKo ? '태그' : 'Tag',
                    isKo ? '내용' : 'Content',
                    isKo ? '대화' : 'Conversation',
                    isKo ? '합성 여부' : 'Consumed',
                    isKo ? '남긴 시각' : 'Time',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--neutral)', borderBottom: '1px solid var(--border)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(notes ?? []).map((note) => (
                  <tr key={note.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                      {tagName(note.tag_nodes) ?? (isKo ? '(태그 없음)' : '(no tag)')}
                    </td>
                    <td className="px-4 py-2.5 align-top max-w-md" style={{ color: 'var(--foreground)' }}>
                      {note.content}
                    </td>
                    <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {note.conversation_id ? (
                        <Link
                          href={`/${lang}/admin/users/${userId}/conversations/${note.conversation_id}`}
                          className="cursor-pointer hover:underline"
                        >
                          {isKo ? '보기' : 'View'}
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--muted-foreground)' }}>{isKo ? 'MCP' : 'MCP'}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 align-top whitespace-nowrap">
                      {note.consumed ? (
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {isKo ? '반영됨' : 'Consumed'}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {isKo ? '대기 중' : 'Pending'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 align-top whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {note.created_at.replace('T', ' ').slice(0, 16)} UTC
                    </td>
                  </tr>
                ))}
                {(notes ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                      {isKo ? '관찰 기록이 없습니다.' : 'No observation notes.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
