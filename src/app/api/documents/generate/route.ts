import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDocument } from '@/lib/ai/document-generator'
import { tryGenerateDocumentEmbedding } from '@/lib/ai/embeddings'
import { buildActivePath, type TreeMessage } from '@/lib/ai/message-tree'
import { classifyBroadTag, findOrCreateTopTagNode, getAllTagNames, getTopTagNames, matchExistingTopTag } from '@/lib/ai/tag-nodes'

export const runtime = 'nodejs'

const anthropic = new Anthropic()

interface GenerateDocumentBody {
  conversationId: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body: GenerateDocumentBody = await req.json()
  const { conversationId } = body
  if (!conversationId || conversationId === 'new') {
    return new Response('conversationId is required', { status: 400 })
  }

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, user_id, is_documented, root_message_id')
    .eq('id', conversationId)
    .single()

  if (!conversation || conversation.user_id !== user.id) {
    return new Response('Not found', { status: 404 })
  }

  if (conversation.is_documented) {
    return Response.json({ documentId: null, skipped: 'already_documented' })
  }

  const { data: allMessages, error: messagesError } = await supabase
    .from('messages')
    .select('id, role, content, linked_doc_ids, topic_path, parent_id, active_child_id, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (messagesError) {
    return new Response(messagesError.message, { status: 500 })
  }

  // 지금 화면에 보이는 브랜치만 스냅샷한다 — 질문 수정/답변 재생성으로 버려진 형제 메시지가
  // 수동 저장 문서에 섞여 들어가지 않도록.
  const activePath = buildActivePath((allMessages ?? []) as TreeMessage[], conversation.root_message_id ?? null)

  if (activePath.length < 2) {
    return Response.json({ documentId: null, skipped: 'too_short' })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('doc_language')
    .eq('id', user.id)
    .single()

  const languageLabel =
    profile?.doc_language === 'ko' ? '한국어' : profile?.doc_language === 'en' ? 'English' : null

  const typedMessages = activePath.map((m) => ({ role: m.role, content: m.content }))
  const relatedDocIds = new Set<string>()
  for (const m of activePath) {
    for (const linkedId of m.linked_doc_ids ?? []) relatedDocIds.add(linkedId)
  }

  // 대화 전체를 대상으로 하는 수동 저장은 여러 주제를 아우를 수 있으므로, 활성 브랜치에서
  // 가장 많이 나온 대분류(topic_path[0])를 채택한다 — 자동 문서화의 "세그먼트 내 최다 득표"와 같은 방식.
  const broadTagCounts = new Map<string, number>()
  for (const m of activePath) {
    const broadTag = m.topic_path?.[0]
    if (broadTag) broadTagCounts.set(broadTag, (broadTagCounts.get(broadTag) ?? 0) + 1)
  }
  let tagNodeId: string | null = null
  if (broadTagCounts.size > 0) {
    const topTag = [...broadTagCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
    const { data: rootNode } = await supabase
      .from('tag_nodes')
      .select('id')
      .eq('user_id', user.id)
      .is('parent_id', null)
      .eq('name', topTag)
      .maybeSingle()
    tagNodeId = rootNode?.id ?? null
  }

  let generated
  try {
    const existingTags = await getAllTagNames(supabase, user.id)
    generated = await generateDocument(anthropic, typedMessages, languageLabel, existingTags)
  } catch (err) {
    return new Response(err instanceof Error ? err.message : 'document generation failed', { status: 500 })
  }

  // 대화에 실제 TOPIC 태그가 하나도 없었던 경우(예: 짧은 대화)에만 대분류를 보완한다.
  if (!tagNodeId) {
    const topTags = await getTopTagNames(supabase, user.id)
    // generateDocument가 이미 만든 tags 중 기존 대분류와 겹치는 게 있으면 그걸 그대로 쓰고,
    // 없을 때만 AI를 한 번 더 불러 분류한다 — 같은 목적의 API 호출을 중복하지 않기 위함.
    const broadTag =
      matchExistingTopTag(topTags, generated.tags) ??
      (await classifyBroadTag(anthropic, topTags, { title: generated.title, summary: generated.summary }))
    tagNodeId = await findOrCreateTopTagNode(supabase, user.id, broadTag)
  }

  const embedding = await tryGenerateDocumentEmbedding(generated)

  const { data: document, error: insertError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      conversation_id: conversationId,
      title: generated.title,
      summary: generated.summary,
      key_conclusion: generated.key_conclusion,
      learnings: generated.learnings,
      action_items: generated.action_items,
      follow_up_questions: generated.follow_up_questions,
      tags: generated.tags,
      doc_type: generated.doc_type,
      doc_trigger: 'manual',
      tag_node_id: tagNodeId,
      related_document_ids: relatedDocIds.size > 0 ? [...relatedDocIds] : null,
      embedding,
      raw_conversation: { messages: typedMessages },
    })
    .select('id')
    .single()

  if (insertError || !document) {
    return new Response(insertError?.message ?? 'failed to save document', { status: 500 })
  }

  await supabase
    .from('conversations')
    .update({ is_documented: true, document_id: document.id })
    .eq('id', conversationId)

  return Response.json({ documentId: document.id })
}
