import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tryGenerateDocumentEmbedding } from '@/lib/ai/embeddings'
import { DOC_SNAPSHOT_COLUMNS, snapshotDocumentVersion, type DocSnapshotRow } from '@/mcp/tools/_document-versioning'

export const runtime = 'nodejs'

const DOC_TYPES = ['general', 'meeting', 'spec', 'report', 'idea', 'research'] as const
type DocType = (typeof DOC_TYPES)[number]

interface EditDocumentBody {
  documentId: string
  title?: string
  summary?: string
  keyConclusion?: string
  learnings?: string
  actionItems?: string[]
  followUpQuestions?: string[]
  tags?: string[]
  docType?: DocType
  message?: string
}

// 웹 문서 뷰의 편집(연필) 기능. MCP edit_document의 웹 등가물 — git처럼 갱신 전 상태를
// document_versions에 스냅샷(+선택적 커밋 메시지)으로 남기고 documents.version을 올린다.
// 카테고리(tag_node_id)/폴더 재분류와 AI 태그 정리는 MCP edit_document 전용으로 남겨둔다
// (웹엔 카테고리 선택 UI가 없고, 사람이 직접 입력한 태그를 AI가 다시 쓰는 건 예측 불가능하므로).
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body: EditDocumentBody = await req.json()
  const { documentId } = body
  if (!documentId) {
    return new Response('documentId is required', { status: 400 })
  }

  const cleanStr = (v: unknown) => (typeof v === 'string' ? v : undefined)
  const cleanArr = (v: unknown) =>
    Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : undefined

  const title = cleanStr(body.title)
  const summary = cleanStr(body.summary)
  const keyConclusion = cleanStr(body.keyConclusion)
  const learnings = cleanStr(body.learnings)
  const actionItems = cleanArr(body.actionItems)
  const followUpQuestions = cleanArr(body.followUpQuestions)
  const tags = cleanArr(body.tags)
  const docType = body.docType && DOC_TYPES.includes(body.docType) ? body.docType : undefined
  const message = cleanStr(body.message)?.trim() || null

  const hasAnyField =
    title !== undefined ||
    summary !== undefined ||
    keyConclusion !== undefined ||
    learnings !== undefined ||
    actionItems !== undefined ||
    followUpQuestions !== undefined ||
    tags !== undefined ||
    docType !== undefined

  if (!hasAnyField) {
    return new Response('Nothing to update', { status: 400 })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('documents')
    .select(DOC_SNAPSHOT_COLUMNS)
    .eq('id', documentId)
    .maybeSingle<DocSnapshotRow>()

  if (fetchError) {
    return new Response(fetchError.message, { status: 500 })
  }
  if (!existing || existing.user_id !== user.id) {
    return new Response('Not found', { status: 404 })
  }

  const currentVersion = existing.version ?? 1

  // 갱신 전 현재 상태를 스냅샷으로 남긴다 — 이력 조회/롤백(MCP document_history/restore_document)용.
  await snapshotDocumentVersion(supabase, user.id, existing, message)

  const merged = {
    title: title ?? existing.title ?? 'Untitled',
    summary: summary ?? existing.summary ?? '',
    key_conclusion: keyConclusion ?? existing.key_conclusion ?? null,
    learnings: learnings ?? existing.learnings ?? null,
  }

  // 본문 필드(title/summary/key_conclusion/learnings)가 하나라도 바뀌면 임베딩을 다시 생성한다.
  // 실패는 null로 흡수해 기존 임베딩을 유지한다.
  const contentChanged =
    title !== undefined || summary !== undefined || keyConclusion !== undefined || learnings !== undefined
  const newEmbedding = contentChanged ? await tryGenerateDocumentEmbedding(merged) : null

  const updatePayload: Record<string, unknown> = {
    version: currentVersion + 1,
    updated_at: new Date().toISOString(),
  }
  if (title !== undefined) updatePayload.title = merged.title
  if (summary !== undefined) updatePayload.summary = merged.summary
  if (keyConclusion !== undefined) updatePayload.key_conclusion = keyConclusion
  if (learnings !== undefined) updatePayload.learnings = learnings
  if (actionItems !== undefined) updatePayload.action_items = actionItems
  if (followUpQuestions !== undefined) updatePayload.follow_up_questions = followUpQuestions
  if (tags !== undefined) updatePayload.tags = tags
  if (docType !== undefined) updatePayload.doc_type = docType
  if (newEmbedding) updatePayload.embedding = newEmbedding

  const { data: updated, error: updateError } = await supabase
    .from('documents')
    .update(updatePayload)
    .eq('id', existing.id)
    .eq('user_id', user.id)
    .select(
      'id, title, summary, key_conclusion, learnings, action_items, follow_up_questions, tags, doc_type, related_document_ids, raw_conversation, updated_at'
    )
    .single()

  if (updateError || !updated) {
    return new Response(updateError?.message ?? 'update failed', { status: 500 })
  }

  return Response.json({ document: updated, version: currentVersion + 1 })
}
