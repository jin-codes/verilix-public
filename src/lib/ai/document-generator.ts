import Anthropic from '@anthropic-ai/sdk'
import { MODELS } from './router'

interface DocumentMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GeneratedDocument {
  title: string
  summary: string
  key_conclusion: string | null
  learnings: string | null
  action_items: string[]
  follow_up_questions: string[]
  tags: string[]
  doc_type: 'general' | 'meeting' | 'spec' | 'report' | 'idea' | 'research'
}

const RECORD_DOCUMENT_TOOL: Anthropic.Tool = {
  name: 'record_document',
  description: '대화 내용을 분석해 구조화된 지식 문서로 기록합니다.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: '문서 제목' },
      summary: { type: 'string', description: '대화 요약 (마크다운)' },
      key_conclusion: { type: 'string', description: '핵심 결론 (마크다운, 없으면 빈 문자열)' },
      learnings: { type: 'string', description: '이 대화에서 얻은 배움/인사이트 (마크다운, 없으면 빈 문자열)' },
      action_items: { type: 'array', items: { type: 'string' }, description: '할 일 목록 (없으면 빈 배열)' },
      follow_up_questions: {
        type: 'array',
        items: { type: 'string' },
        description: '후속 질문 목록 (없으면 빈 배열)',
      },
      tags: { type: 'array', items: { type: 'string' }, description: '분류 태그 (2~5개)' },
      doc_type: {
        type: 'string',
        enum: ['general', 'meeting', 'spec', 'report', 'idea', 'research'],
        description: '문서 카테고리',
      },
    },
    required: ['title', 'summary', 'doc_type'],
  },
}

// TODO(batch-launch): 출시 시점에 MODELS.sonnet + Anthropic Batch API로 교체 예정.
export async function generateDocument(
  anthropic: Anthropic,
  messages: DocumentMessage[],
  languageLabel: string | null,
  existingTags: string[] = []
): Promise<GeneratedDocument> {
  const transcript = messages
    .map((m) => `${m.role === 'user' ? '유저' : 'AI'}: ${m.content}`)
    .join('\n\n')

  const system = `다음은 유저와 AI 간의 대화입니다. 이 대화를 분석해 record_document 툴로 구조화된 문서를 기록하세요.
- 대화의 핵심 내용을 객관적으로 정리하세요. 감정적 어투는 피하세요.
- 할 일이나 후속 질문이 실제로 없으면 빈 배열을 넣으세요, 억지로 만들어내지 마세요.
- 태그는 대화 주제를 나타내는 짧은 키워드로 2~5개 작성하세요. 아래 [기존 태그 목록]에 이 문서와 맞는 게 있으면 최대한 그대로 재사용하고, 없을 때만 새로 만드세요 — 같은 주제에 표현만 다른 태그를 계속 새로 짓지 마세요.
- summary, key_conclusion, learnings 필드는 마크다운 문법(제목 \`##\`, 목록 \`-\`, 강조 \`**\`, 코드블록 등)을 활용해 체계적으로 구조화하세요. 단, title/tags/doc_type에는 마크다운을 쓰지 마세요.
- 수식이 필요하면 반드시 인라인은 \`$...$\`, 블록은 \`$$...$$\` 문법만 쓰세요. \`\\(...\\)\`, \`\\[...\\]\` 등 다른 delimiter는 쓰지 마세요.
- \`aligned\`, \`matrix\`, \`cases\`처럼 여러 줄에 걸치는 블록 수식은 여는 \`$$\`와 닫는 \`$$\`를 반드시 그 줄에 단독으로 쓰세요 (코드블록 펜스처럼). \`$$\\begin{aligned}\`처럼 같은 줄에 이어 쓰면 렌더링이 깨집니다.${
    languageLabel ? `\n- title, summary 등 모든 텍스트 필드를 ${languageLabel}로 작성하세요.` : ''
  }

[기존 태그 목록]
${existingTags.length > 0 ? existingTags.join(', ') : '(아직 없음)'}`

  const response = await anthropic.messages.create({
    model: MODELS.haiku,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: transcript }],
    tools: [RECORD_DOCUMENT_TOOL],
    tool_choice: { type: 'tool', name: 'record_document' },
  })

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )
  if (!toolUse) {
    throw new Error('document generation did not return a tool_use block')
  }

  const input = toolUse.input as Partial<GeneratedDocument>

  return {
    title: input.title ?? 'Untitled',
    summary: input.summary ?? '',
    key_conclusion: input.key_conclusion || null,
    learnings: input.learnings || null,
    action_items: input.action_items ?? [],
    follow_up_questions: input.follow_up_questions ?? [],
    tags: input.tags ?? [],
    doc_type: input.doc_type ?? 'general',
  }
}

export interface ExistingDocumentForMerge {
  title: string
  summary: string | null
  key_conclusion: string | null
  learnings: string | null
  action_items: string[] | null
  follow_up_questions: string[] | null
  tags: string[] | null
  doc_type: string | null
}

// STALE 히든 태그용: 새 문서를 만드는 대신, 기존 문서에 새 세그먼트 내용을 합쳐 갱신된 버전을 만든다.
// generateDocument와 같은 tool을 재사용하되, "기존 문서 + 새 대화"를 함께 입력으로 준다.
export async function mergeDocument(
  anthropic: Anthropic,
  existingDoc: ExistingDocumentForMerge,
  newMessages: DocumentMessage[],
  languageLabel: string | null,
  existingTags: string[] = []
): Promise<GeneratedDocument> {
  const existingSnapshot = `# ${existingDoc.title}

## 요약
${existingDoc.summary ?? ''}

## 핵심 결론
${existingDoc.key_conclusion ?? ''}

## 배움/인사이트
${existingDoc.learnings ?? ''}

## 할 일
${(existingDoc.action_items ?? []).join('\n')}

## 후속 질문
${(existingDoc.follow_up_questions ?? []).join('\n')}

## 태그
${(existingDoc.tags ?? []).join(', ')}`

  const transcript = newMessages.map((m) => `${m.role === 'user' ? '유저' : 'AI'}: ${m.content}`).join('\n\n')

  const system = `기존에 저장된 지식 문서를 최신 대화 내용으로 갱신합니다. 아래는 기존 문서와, 그 이후 이어진 새 대화입니다.
새 대화가 기존 문서와 같은 주제를 더 진행하거나 보강하는 내용이라고 판단되어 새 문서로 쪼개지 않고 이 문서에 합치기로 결정되었습니다.
기존 문서의 내용을 버리지 말고, 새 대화에서 나온 내용을 자연스럽게 통합해 record_document 툴로 갱신된 전체 문서를 다시 기록하세요.
- 기존 내용과 새 내용이 모순되면 더 최근(새 대화)의 내용을 우선하세요.
- 이미 다룬 내용을 중복해서 나열하지 말고 하나로 통합하세요.
- 할 일이나 후속 질문이 실제로 없으면 빈 배열을 넣으세요, 억지로 만들어내지 마세요.
- 태그는 대화 주제를 나타내는 짧은 키워드로 2~5개 작성하세요. 아래 [기존 태그 목록]에 이 문서와 맞는 게 있으면 최대한 그대로 재사용하고, 없을 때만 새로 만드세요.
- summary, key_conclusion, learnings 필드는 마크다운 문법(제목 \`##\`, 목록 \`-\`, 강조 \`**\`, 코드블록 등)을 활용해 체계적으로 구조화하세요. 단, title/tags/doc_type에는 마크다운을 쓰지 마세요.
- 수식이 필요하면 반드시 인라인은 \`$...$\`, 블록은 \`$$...$$\` 문법만 쓰세요. \`\\(...\\)\`, \`\\[...\\]\` 등 다른 delimiter는 쓰지 마세요.
- \`aligned\`, \`matrix\`, \`cases\`처럼 여러 줄에 걸치는 블록 수식은 여는 \`$$\`와 닫는 \`$$\`를 반드시 그 줄에 단독으로 쓰세요.${
    languageLabel ? `\n- title, summary 등 모든 텍스트 필드를 ${languageLabel}로 작성하세요.` : ''
  }

[기존 문서]
${existingSnapshot}

[새 대화]
${transcript}

[기존 태그 목록]
${existingTags.length > 0 ? existingTags.join(', ') : '(아직 없음)'}`

  const response = await anthropic.messages.create({
    model: MODELS.haiku,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: '위 기존 문서와 새 대화를 합쳐 record_document 툴로 갱신된 문서를 기록하세요.' }],
    tools: [RECORD_DOCUMENT_TOOL],
    tool_choice: { type: 'tool', name: 'record_document' },
  })

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )
  if (!toolUse) {
    throw new Error('document merge did not return a tool_use block')
  }

  const input = toolUse.input as Partial<GeneratedDocument>

  return {
    title: input.title ?? existingDoc.title,
    summary: input.summary ?? existingDoc.summary ?? '',
    key_conclusion: input.key_conclusion || existingDoc.key_conclusion || null,
    learnings: input.learnings || existingDoc.learnings || null,
    action_items: input.action_items ?? existingDoc.action_items ?? [],
    follow_up_questions: input.follow_up_questions ?? existingDoc.follow_up_questions ?? [],
    tags: input.tags ?? existingDoc.tags ?? [],
    doc_type: (input.doc_type as GeneratedDocument['doc_type']) ?? (existingDoc.doc_type as GeneratedDocument['doc_type']) ?? 'general',
  }
}
