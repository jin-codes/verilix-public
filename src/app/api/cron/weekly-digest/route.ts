import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeTrend, generateDigestContent, renderDigestEmailHtml, type DigestTagStat, type DigestContradiction } from '@/lib/ai/weekly-digest'
import { sendDigestEmail } from '@/lib/email/gmail'

const APP_URL = 'https://verilix.vercel.app'
const FALLBACK_WINDOW_DAYS = 7

// Vercel Cron이 매주 호출하는 엔드포인트. 유저별로 마지막 발송 시각(profiles.last_digest_sent_at) 이후
// 새로 쌓인 documents가 있으면 다이제스트 메일을 보내고 그 시각을 갱신한다.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  // CRON_SECRET이 없으면 열어두지 않고 막는다(fail closed) — 누구나 호출해 실제 메일을 발송시키는 걸 방지
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, ui_language, last_digest_sent_at, digest_enabled')
    .eq('digest_enabled', true)

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }

  const results: Array<{ userId: string; status: 'sent' | 'skipped' | 'error'; detail?: string }> = []

  for (const profile of profiles ?? []) {
    try {
      if (!profile.email) {
        results.push({ userId: profile.id, status: 'skipped', detail: 'no email' })
        continue
      }

      const since =
        profile.last_digest_sent_at ??
        new Date(Date.now() - FALLBACK_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('id, title, summary, key_conclusion, tags, created_at, tag_node_id')
        .eq('user_id', profile.id)
        .eq('is_archived', false)
        .gt('created_at', since)
        .order('created_at', { ascending: false })

      if (docsError) throw new Error(docsError.message)

      if (!documents || documents.length === 0) {
        results.push({ userId: profile.id, status: 'skipped', detail: 'no new documents' })
        continue
      }

      const lang: 'ko' | 'en' = profile.ui_language === 'en' ? 'en' : 'ko'
      const languageLabel = lang === 'ko' ? '한국어' : 'English'

      // 태그별 이번 주 문서 수 집계
      const docCountByTag = new Map<string, number>()
      for (const d of documents) {
        if (!d.tag_node_id) continue
        docCountByTag.set(d.tag_node_id, (docCountByTag.get(d.tag_node_id) ?? 0) + 1)
      }
      const tagNodeIds = [...docCountByTag.keys()]

      let tagStats: DigestTagStat[] = []
      if (tagNodeIds.length > 0) {
        const [{ data: nodes }, { data: insights }, { data: prevSnapshots }] = await Promise.all([
          supabase.from('tag_nodes').select('id, name').in('id', tagNodeIds),
          supabase
            .from('topic_insights')
            .select('tag_node_id, estimated_level, source_note_count')
            .eq('user_id', profile.id)
            .in('tag_node_id', tagNodeIds),
          // 지난 발송(digest_snapshots)에서 이 태그들의 가장 최근 문서 수를 diff 기준점으로 사용
          supabase
            .from('digest_snapshots')
            .select('tag_node_id, doc_count, sent_at')
            .eq('user_id', profile.id)
            .in('tag_node_id', tagNodeIds)
            .order('sent_at', { ascending: false }),
        ])

        const nameById = new Map((nodes ?? []).map((n) => [n.id, n.name]))
        const insightByTagNode = new Map((insights ?? []).map((i) => [i.tag_node_id, i]))
        // 태그당 가장 최근 스냅샷 1개만 남김 (내림차순 정렬돼 있으므로 처음 만난 값이 최신)
        const latestPrevByTag = new Map<string, number>()
        for (const s of prevSnapshots ?? []) {
          if (!latestPrevByTag.has(s.tag_node_id)) latestPrevByTag.set(s.tag_node_id, s.doc_count)
        }

        tagStats = tagNodeIds.map((id) => {
          const docCount = docCountByTag.get(id) ?? 0
          const previousDocCount = latestPrevByTag.get(id) ?? null
          const insight = insightByTagNode.get(id)
          return {
            tag_node_id: id,
            tag_name: nameById.get(id) ?? id,
            doc_count: docCount,
            note_count: insight?.source_note_count ?? 0,
            estimated_level: insight?.estimated_level ?? null,
            trend: computeTrend(docCount, previousDocCount),
            previous_doc_count: previousDocCount,
          }
        })
      }

      // 미해결 모순 — LLM 판단 없이 그대로 조회
      const { data: contradictionRows } = await supabase
        .from('document_contradictions')
        .select('document_id, content, documents(title)')
        .eq('user_id', profile.id)
        .eq('resolved', false)
        .gt('created_at', since)
        .order('created_at', { ascending: false })

      const contradictions: DigestContradiction[] = (contradictionRows ?? []).map((c) => {
        const doc = c.documents as unknown as { title: string } | { title: string }[] | null
        const title = Array.isArray(doc) ? doc[0]?.title : doc?.title
        return {
          document_id: c.document_id,
          document_title: title ?? '',
          content: c.content,
        }
      })

      const { overview, tagNotes } = await generateDigestContent(anthropic, documents, tagStats, languageLabel)
      const html = renderDigestEmailHtml({ lang, overview, tagStats, tagNotes, contradictions, documents, appUrl: APP_URL })
      const subject =
        lang === 'ko' ? `이번 주 새 문서 ${documents.length}개 — verilix` : `${documents.length} new documents this week — verilix`

      await sendDigestEmail({ to: profile.email, subject, html })

      const sentAt = new Date().toISOString()
      await supabase.from('profiles').update({ last_digest_sent_at: sentAt }).eq('id', profile.id)

      if (tagStats.length > 0) {
        await supabase.from('digest_snapshots').insert(
          tagStats.map((s) => ({
            user_id: profile.id,
            tag_node_id: s.tag_node_id,
            doc_count: s.doc_count,
            note_count: s.note_count,
            estimated_level: s.estimated_level,
            sent_at: sentAt,
          }))
        )
      }

      results.push({ userId: profile.id, status: 'sent' })
    } catch (err) {
      results.push({ userId: profile.id, status: 'error', detail: err instanceof Error ? err.message : String(err) })
    }
  }

  return NextResponse.json({ results })
}
