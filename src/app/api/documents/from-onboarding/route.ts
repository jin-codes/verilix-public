import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tryGenerateDocumentEmbedding } from '@/lib/ai/embeddings'
import { classifyBroadTag, findOrCreateTopTagNode, getTopTagNames } from '@/lib/ai/tag-nodes'

export const runtime = 'nodejs'

const anthropic = new Anthropic()

interface FromOnboardingBody {
  context: string
  docLanguage: 'ko' | 'en'
}

// 온보딩에서 입력한 배경지식을 유저의 첫 문서로 저장한다. 대화 기반 TOPIC 태그가 없으므로
// classifyBroadTag로 대분류를 보완하는 것은 MCP save_document/짧은 대화 수동 저장과 동일한 패턴.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body: FromOnboardingBody = await req.json()
  const context = body.context?.trim()
  if (!context) {
    return new Response('context is required', { status: 400 })
  }
  const isKo = body.docLanguage === 'ko'
  const title = isKo ? '배경 지식' : 'Background Context'

  let tagNodeId: string | null = null
  let broadTag = 'general'
  try {
    const topTags = await getTopTagNames(supabase, user.id)
    broadTag = await classifyBroadTag(anthropic, topTags, { title, summary: context })
    tagNodeId = await findOrCreateTopTagNode(supabase, user.id, broadTag)
  } catch {
    // 분류 실패는 조용히 무시 — tag_node_id 없이도 문서 저장 자체는 막지 않는다.
  }

  const embedding = await tryGenerateDocumentEmbedding({
    title,
    summary: context,
    key_conclusion: null,
    learnings: null,
  })

  const { data: document, error: insertError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      title,
      summary: context,
      doc_type: 'general',
      doc_trigger: 'manual',
      tag_node_id: tagNodeId,
      tags: [broadTag],
      embedding,
    })
    .select('id')
    .single()

  if (insertError || !document) {
    return new Response(insertError?.message ?? 'failed to save document', { status: 500 })
  }

  return Response.json({ documentId: document.id })
}
