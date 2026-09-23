import type { SupabaseClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { MODELS } from './router'

// 같은 tag로 미소비 NOTE가 이만큼 쌓이면 topic_insights를 (재)생성한다.
export const TOPIC_INSIGHT_THRESHOLD = 10

export async function synthesizeTopicInsight(
  anthropic: Anthropic,
  tag: string,
  existingSummary: string | null,
  noteContents: string[],
  languageLabel: string | null
): Promise<string> {
  const system = `당신은 어떤 유저에 대해 AI가 여러 대화에서 관찰하며 남긴 짧은 관찰 기록들을 받아,
"${tag}"라는 주제에 대한 유저의 성향·관심도·이해 수준 등을 심층적으로 정리하는 분석가입니다.
- 유저 본인은 이 분석을 보지 않습니다. 앞으로의 대화에서 AI가 참고할 배경지식으로만 쓰입니다.
- 기존 분석이 있으면 그것과 새 관찰 기록을 종합해 하나의 갱신된 분석으로 다시 작성하세요.
- 추측을 사실처럼 단정하지 말고, 관찰에 기반한 만큼만 서술하세요.
- 감정적 어투 없이 객관적으로, 하지만 피상적이지 않게 작성하세요.${languageLabel ? `\n- ${languageLabel}로 작성하세요.` : ''}
- 분석 본문만 출력하세요. 설명이나 머리말은 쓰지 마세요.`

  const response = await anthropic.messages.create({
    model: MODELS.sonnet,
    max_tokens: 1024,
    system,
    messages: [
      {
        role: 'user',
        content: `기존 분석:\n${existingSummary || '(없음)'}\n\n새 관찰 기록:\n${noteContents.map((n) => `- ${n}`).join('\n')}`,
      },
    ],
  })

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
}

/**
 * NOTE(웹 채팅)와 MCP save_document의 `note` 파라미터가 공유하는 저장 경로.
 * assistant_notes에 적재하고, 같은 tag_node_id로 미소비 노트가 임계치를 넘으면
 * topic_insights를 합성·upsert하고 소비 처리까지 한 번에 수행한다.
 */
export async function recordAssistantNotes(
  supabase: SupabaseClient,
  anthropic: Anthropic,
  params: {
    userId: string
    conversationId: string | null
    tagNodeId: string | null
    tagLabel: string
    contents: string[]
    languageLabel: string | null
  }
): Promise<void> {
  const { userId, conversationId, tagNodeId, tagLabel, contents, languageLabel } = params
  if (contents.length === 0) return

  await supabase.from('assistant_notes').insert(
    contents.map((content) => ({
      user_id: userId,
      conversation_id: conversationId,
      tag_node_id: tagNodeId,
      content,
    }))
  )

  if (!tagNodeId) return

  const { data: unconsumedNotes } = await supabase
    .from('assistant_notes')
    .select('id, content')
    .eq('user_id', userId)
    .eq('tag_node_id', tagNodeId)
    .eq('consumed', false)

  if (!unconsumedNotes || unconsumedNotes.length < TOPIC_INSIGHT_THRESHOLD) return

  const { data: existingInsight } = await supabase
    .from('topic_insights')
    .select('summary, source_note_count')
    .eq('user_id', userId)
    .eq('tag_node_id', tagNodeId)
    .maybeSingle()

  const summary = await synthesizeTopicInsight(
    anthropic,
    tagLabel,
    existingInsight?.summary ?? null,
    unconsumedNotes.map((n) => n.content),
    languageLabel
  )

  await supabase.from('topic_insights').upsert(
    {
      user_id: userId,
      tag_node_id: tagNodeId,
      summary,
      source_note_count: (existingInsight?.source_note_count ?? 0) + unconsumedNotes.length,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,tag_node_id' }
  )

  await supabase
    .from('assistant_notes')
    .update({ consumed: true })
    .in(
      'id',
      unconsumedNotes.map((n) => n.id)
    )
}
