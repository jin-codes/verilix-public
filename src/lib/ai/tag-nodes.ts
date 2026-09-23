import type { SupabaseClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { MODELS } from './router'

// 유저의 최상위(depth=1) tag_node 이름 목록을 조회한다 — AI 분류 시 기존 어휘를 재사용시키기 위함.
export async function getTopTagNames(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('tag_nodes')
    .select('name')
    .eq('user_id', userId)
    .is('parent_id', null)
  return (data ?? []).map((row) => row.name as string)
}

// 유저의 tag_node 트리 전체(모든 depth)의 이름 목록을 조회한다 — documents.tags(자유 키워드)를
// 지을 때도 이 트리와 같은 어휘를 재사용시켜 두 태그 체계가 갈라지지 않도록 하기 위함.
export async function getAllTagNames(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data } = await supabase.from('tag_nodes').select('name').eq('user_id', userId)
  return [...new Set((data ?? []).map((row) => row.name as string))]
}

// 이미 정해진 태그(tags) 중에 최상위 카테고리 이름과 정확히(대소문자 무시) 겹치는 게 있으면
// 그대로 재사용한다 — AI 호출 없이 끝낼 수 있는 경우를 걸러내기 위한 공짜 사전 체크.
export function matchExistingTopTag(topTagNames: string[], tags: string[]): string | null {
  const lowerToOriginal = new Map(topTagNames.map((t) => [t.toLowerCase(), t]))
  for (const tag of tags) {
    const match = lowerToOriginal.get(tag.toLowerCase())
    if (match) return match
  }
  return null
}

// 이름으로 최상위(depth=1) tag_node를 대소문자 무시하고 찾는다 (없으면 만들지 않고 null).
export async function findRootTagNode(
  supabase: SupabaseClient,
  userId: string,
  name: string
): Promise<{ id: string; name: string } | null> {
  const { data } = await supabase
    .from('tag_nodes')
    .select('id, name')
    .eq('user_id', userId)
    .is('parent_id', null)
  const lower = name.trim().toLowerCase()
  const match = (data ?? []).find((r) => (r.name as string).toLowerCase() === lower)
  return match ? { id: match.id as string, name: match.name as string } : null
}

// 이름으로 최상위 tag_node를 찾거나 없으면 새로 만들고 id를 반환한다.
export async function findOrCreateTopTagNode(
  supabase: SupabaseClient,
  userId: string,
  name: string
): Promise<string> {
  const { data: existing } = await supabase
    .from('tag_nodes')
    .select('id')
    .eq('user_id', userId)
    .is('parent_id', null)
    .eq('name', name)
    .maybeSingle()
  if (existing) return existing.id as string

  const { data: created } = await supabase
    .from('tag_nodes')
    .insert({ user_id: userId, parent_id: null, name, depth: 1 })
    .select('id')
    .single()
  return created!.id as string
}

const CLASSIFY_TAG_TOOL: Anthropic.Tool = {
  name: 'classify_broad_tag',
  description: '문서 내용을 보고 가장 알맞은 대분류 카테고리 태그를 고르거나 새로 만듭니다.',
  input_schema: {
    type: 'object',
    properties: {
      tag: {
        type: 'string',
        description:
          '영어 snake_case 형태의 넓은 카테고리 이름 (예: math, cooking, career). 기존 목록 중 맞는 게 있으면 그대로 재사용하고, 없으면 새로 짧게 짓습니다.',
      },
    },
    required: ['tag'],
  },
}

// 대화 기반 TOPIC 태그가 없는 문서(MCP 저장, 태그 없는 수동 저장)에 AI가 대분류 태그를 붙인다.
// tag_nodes 트리와 같은 어휘(영어 snake_case, 넓은 카테고리)를 쓰도록 기존 목록을 프롬프트에 제공한다.
export async function classifyBroadTag(
  anthropic: Anthropic,
  existingTags: string[],
  doc: { title: string; summary: string }
): Promise<string> {
  const system = `아래 문서 내용을 보고 가장 알맞은 넓은 카테고리(대분류) 태그를 classify_broad_tag 툴로 고르세요.
- 태그는 영어 snake_case 단어/구절이며, 질문 하나하나가 아니라 그보다 한두 단계 위의 넓은 분야를 나타내야 합니다 (예: "피보나치 수열"이 아니라 "math").
- 아래 "기존 태그 목록"에 이미 맞는 카테고리가 있으면 반드시 그 이름을 그대로 재사용하세요 — 같은 분야에 새 이름을 짓지 마세요.
- 맞는 게 없을 때만 새 카테고리를 짧게 만드세요.

[기존 태그 목록]
${existingTags.length > 0 ? existingTags.join(', ') : '(아직 없음)'}`

  const response = await anthropic.messages.create({
    model: MODELS.haiku,
    max_tokens: 256,
    system,
    messages: [
      {
        role: 'user',
        content: `제목: ${doc.title}\n\n요약: ${doc.summary}`,
      },
    ],
    tools: [CLASSIFY_TAG_TOOL],
    tool_choice: { type: 'tool', name: 'classify_broad_tag' },
  })

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )
  const tag = (toolUse?.input as { tag?: string } | undefined)?.tag
  return tag?.trim() || 'general'
}

const RECONCILE_TAGS_TOOL: Anthropic.Tool = {
  name: 'reconcile_tags',
  description: '외부에서 제안된 태그들을 기존 태그 어휘와 맞춰 정리합니다.',
  input_schema: {
    type: 'object',
    properties: {
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: '정리된 최종 태그 목록 (2~5개). 기존 어휘 중 같은 의미의 태그가 있으면 그 이름으로 교체하고, 없으면 제안된 이름을 그대로 씁니다.',
      },
    },
    required: ['tags'],
  },
}

// MCP로 외부 AI가 제안한 태그(incomingTags)는 우리 tag_nodes 어휘를 모르므로, 기존 어휘와
// 대조해 같은 의미면 기존 이름으로 통일하고 아니면 그대로 둔다. tags(자유 키워드)와 tag_node
// 트리가 서로 다른 사전으로 갈라지지 않도록 하는 조정 단계.
export async function reconcileTags(
  anthropic: Anthropic,
  existingTags: string[],
  incomingTags: string[]
): Promise<string[]> {
  if (incomingTags.length === 0) return []
  if (existingTags.length === 0) return incomingTags

  const system = `아래 "제안된 태그"는 외부 AI가 자유롭게 지은 것입니다. "기존 태그 목록"과 대조해 reconcile_tags 툴로 정리하세요.
- 제안된 태그가 기존 목록의 어떤 태그와 같은 의미면, 기존 태그 이름으로 바꿔치기하세요 (표현이 달라도 의미가 같으면 재사용).
- 맞는 기존 태그가 없으면 제안된 태그를 그대로 두세요. 억지로 기존 것에 끼워맞추지 마세요.
- 개수는 원래 제안된 개수를 그대로 유지하세요.

[기존 태그 목록]
${existingTags.join(', ')}

[제안된 태그]
${incomingTags.join(', ')}`

  const response = await anthropic.messages.create({
    model: MODELS.haiku,
    max_tokens: 256,
    system,
    messages: [{ role: 'user', content: '위 제안된 태그를 정리해 reconcile_tags 툴로 기록하세요.' }],
    tools: [RECONCILE_TAGS_TOOL],
    tool_choice: { type: 'tool', name: 'reconcile_tags' },
  })

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )
  const tags = (toolUse?.input as { tags?: string[] } | undefined)?.tags
  return tags && tags.length > 0 ? tags : incomingTags
}
