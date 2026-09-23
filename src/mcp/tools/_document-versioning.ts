import type { SupabaseClient } from '@supabase/supabase-js'

// edit / delete / restore가 공유하는 문서 스냅샷 유틸. git처럼 원본 데이터를 지우지 않고
// document_versions에 이전 상태를 남겨 조회·롤백할 수 있게 한다. message는 커밋 메시지 격.

export const DOC_SNAPSHOT_COLUMNS =
  'id, user_id, title, summary, key_conclusion, learnings, action_items, follow_up_questions, tags, doc_type, tag_node_id, folder_id, raw_conversation, related_document_ids, version, is_archived'

export interface DocSnapshotRow {
  id: string
  user_id: string
  title: string | null
  summary: string | null
  key_conclusion: string | null
  learnings: string | null
  action_items: unknown
  follow_up_questions: unknown
  tags: string[] | null
  doc_type: string | null
  tag_node_id: string | null
  folder_id: string | null
  raw_conversation: unknown
  related_document_ids: string[] | null
  version: number | null
  is_archived: boolean | null
}

export interface DocSnapshot {
  title: string | null
  summary: string | null
  key_conclusion: string | null
  learnings: string | null
  action_items: unknown
  follow_up_questions: unknown
  tags: string[] | null
  doc_type: string | null
  tag_node_id: string | null
  folder_id: string | null
  raw_conversation: unknown
  related_document_ids: string[] | null
  is_archived: boolean
}

export function buildSnapshot(doc: DocSnapshotRow): DocSnapshot {
  return {
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
    related_document_ids: doc.related_document_ids,
    is_archived: doc.is_archived ?? false,
  }
}

// 현재 문서 상태를 document_versions에 한 줄로 남긴다.
export async function snapshotDocumentVersion(
  supabase: SupabaseClient,
  userId: string,
  doc: DocSnapshotRow,
  message: string | null
): Promise<void> {
  await supabase.from('document_versions').insert({
    document_id: doc.id,
    user_id: userId,
    version: doc.version ?? 1,
    snapshot: buildSnapshot(doc),
    message: message ?? null,
  })
}

// 스냅샷 jsonb를 documents update 페이로드로 되돌린다(embedding은 별도로 재생성).
export function snapshotToUpdate(snap: Partial<DocSnapshot>): Record<string, unknown> {
  return {
    title: snap.title ?? null,
    summary: snap.summary ?? null,
    key_conclusion: snap.key_conclusion ?? null,
    learnings: snap.learnings ?? null,
    action_items: snap.action_items ?? [],
    follow_up_questions: snap.follow_up_questions ?? [],
    tags: snap.tags ?? [],
    doc_type: snap.doc_type ?? 'general',
    tag_node_id: snap.tag_node_id ?? null,
    folder_id: snap.folder_id ?? null,
    raw_conversation: snap.raw_conversation ?? null,
    related_document_ids: snap.related_document_ids ?? null,
  }
}
