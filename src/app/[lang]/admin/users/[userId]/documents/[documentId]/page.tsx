import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import { hasLocale } from '../../../../../dictionaries'
import { requireAdmin } from '@/lib/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import MarkdownMessage from '@/components/shared/markdown-message'

interface RawConversation {
  messages?: { role: string; content: string }[]
  text?: string
}

interface Props {
  params: Promise<{ lang: string; userId: string; documentId: string }>
}

function Field({ label, content, lang }: { label: string; content: string | null; lang: string }) {
  if (!content) return null
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
        {label}
      </p>
      <MarkdownMessage content={content} lang={lang} />
    </section>
  )
}

export default async function AdminDocumentDetailPage({ params }: Props) {
  const { lang, userId, documentId } = await params
  if (!hasLocale(lang)) notFound()

  await requireAdmin(lang)
  const isKo = lang === 'ko'

  const admin = createAdminClient()
  const [{ data: doc }, { data: profile }] = await Promise.all([
    admin
      .from('documents')
      .select(
        'id, user_id, title, summary, key_conclusion, learnings, tags, doc_type, doc_trigger, raw_conversation, created_at, updated_at'
      )
      .eq('id', documentId)
      .single(),
    admin.from('profiles').select('email').eq('id', userId).single(),
  ])

  if (!doc || doc.user_id !== userId) notFound()

  const raw = doc.raw_conversation as RawConversation | null

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <header
        className="h-14 px-8 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--sidebar)' }}
      >
        <div className="flex flex-col justify-center">
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {doc.title ?? (isKo ? '(제목 없음)' : '(untitled)')}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {profile?.email} · {doc.doc_type} · {doc.doc_trigger}
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

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {doc.tags.map((tag: string) => (
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

        <Field label={isKo ? '요약' : 'Summary'} content={doc.summary} lang={lang} />
        <Field label={isKo ? '결론' : 'Key Conclusion'} content={doc.key_conclusion} lang={lang} />
        <Field label={isKo ? '배움' : 'Learnings'} content={doc.learnings} lang={lang} />

        {raw && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
              {isKo ? '원본 대화' : 'Raw Conversation'}
            </p>
            <div className="rounded-md p-3 space-y-3" style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
              {raw.messages && raw.messages.length > 0 ? (
                raw.messages.map((m, i) => (
                  <div key={i}>
                    <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>
                      {m.role}
                    </p>
                    <MarkdownMessage content={m.content} lang={lang} />
                  </div>
                ))
              ) : raw.text ? (
                <MarkdownMessage content={raw.text} lang={lang} />
              ) : (
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {isKo ? '표시할 원본이 없습니다.' : 'No raw content available.'}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
