import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { hasLocale } from '../../../../../dictionaries'
import { requireAdmin } from '@/lib/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildActivePath, type TreeMessage } from '@/lib/ai/message-tree'
import MarkdownMessage from '@/components/shared/markdown-message'

interface Props {
  params: Promise<{ lang: string; userId: string; conversationId: string }>
}

export default async function AdminConversationDetailPage({ params }: Props) {
  const { lang, userId, conversationId } = await params
  if (!hasLocale(lang)) notFound()

  await requireAdmin(lang)
  const isKo = lang === 'ko'

  const admin = createAdminClient()
  const [{ data: conversation }, { data: profile }, { data: messages }] = await Promise.all([
    admin
      .from('conversations')
      .select('id, user_id, title, model, model_mode, knowledge_mode, root_message_id, created_at')
      .eq('id', conversationId)
      .single(),
    admin.from('profiles').select('email').eq('id', userId).single(),
    admin
      .from('messages')
      .select('id, role, content, parent_id, active_child_id, topic_path, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true }),
  ])

  if (!conversation || conversation.user_id !== userId) notFound()

  const all = (messages ?? []) as unknown as TreeMessage[]
  // 지금 유저 화면에 실제로 보이는 활성 브랜치. 버려진 형제 버전은 이 대화 상세에서 다루지 않는다.
  const activePath = conversation.root_message_id ? buildActivePath(all, conversation.root_message_id) : all

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <header
        className="h-14 px-8 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--sidebar)' }}
      >
        <div className="flex flex-col justify-center">
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {conversation.title ?? (isKo ? '(제목 없음)' : '(untitled)')}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {profile?.email} · {conversation.model_mode} · {conversation.knowledge_mode}
          </span>
        </div>
        <Link
          href={`/${lang}/admin/users/${userId}`}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-sm cursor-pointer transition-colors duration-150 shrink-0"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isKo ? '유저로' : 'Back to user'}
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-5">
        {activePath.length === 0 && (
          <p className="text-sm text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
            {isKo ? '메시지가 없습니다.' : 'No messages.'}
          </p>
        )}
        {activePath.map((m) => (
          <div
            key={m.id}
            className="rounded-md p-4"
            style={{
              backgroundColor: m.role === 'user' ? 'var(--surface-raised)' : 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                {m.role}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {m.created_at.replace('T', ' ').slice(0, 16)} UTC
              </span>
            </div>
            <MarkdownMessage content={m.content} lang={lang} />
            {m.topic_path && m.topic_path.length > 0 && (
              <p className="text-[11px] mt-2" style={{ color: 'var(--muted-foreground)' }}>
                {m.topic_path.join(' > ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
