import Anthropic from '@anthropic-ai/sdk'
import { MODELS } from './router'

interface DigestDocument {
  id: string
  title: string
  summary: string | null
  key_conclusion: string | null
  tags: string[] | null
  created_at: string
  tag_node_id: string | null
}

export type DigestTrend = 'new' | 'growing' | 'cooling' | 'dormant' | 'returning'

// 태그별 활동 추세 — LLM에게 추론시키지 않고, 이번 주 집계치와 지난 스냅샷(digest_snapshots)을
// 서버에서 직접 diff해 결정론적으로 계산한다. LLM은 이 값을 "설명"하는 문장만 쓴다.
export interface DigestTagStat {
  tag_node_id: string
  tag_name: string
  doc_count: number
  note_count: number
  estimated_level: string | null
  trend: DigestTrend
  previous_doc_count: number | null
}

export interface DigestContradiction {
  document_id: string
  document_title: string
  content: string
}

export function computeTrend(currentDocCount: number, previousDocCount: number | null): DigestTrend {
  if (previousDocCount === null || previousDocCount === 0) {
    return currentDocCount > 0 ? 'new' : 'dormant'
  }
  if (currentDocCount === 0) return 'dormant'
  if (currentDocCount > previousDocCount) return 'growing'
  if (currentDocCount < previousDocCount) return 'cooling'
  return 'returning'
}

const TREND_LABEL_KO: Record<DigestTrend, string> = {
  new: '새로 시작',
  growing: '심화 중',
  cooling: '둔화',
  dormant: '휴면',
  returning: '꾸준함',
}
const TREND_LABEL_EN: Record<DigestTrend, string> = {
  new: 'New',
  growing: 'Growing',
  cooling: 'Cooling',
  dormant: 'Dormant',
  returning: 'Steady',
}

const WRITE_WEEKLY_DIGEST_TOOL: Anthropic.Tool = {
  name: 'write_weekly_digest',
  description:
    '이번 주 새로 쌓인 지식 베이스 문서, 태그별 활동 추세(trend, 서버에서 이미 계산됨), 기존 누적 분석(topic_insights)을 보고 정해진 포맷으로 다이제스트 콘텐츠를 작성합니다.',
  input_schema: {
    type: 'object',
    properties: {
      overview: {
        type: 'string',
        description:
          '2~4문장. 이번 주 전반적으로 어떤 흐름/주제였는지 담백하게 요약. 문서를 하나하나 나열하지 말 것(목록은 이메일에 별도로 나옴). 과장된 칭찬/감정적 어투 금지.',
      },
      tagNotes: {
        type: 'array',
        description:
          '주어진 태그 목록과 정확히 같은 개수·순서로 작성. 각 태그의 trend(이미 계산되어 주어짐)와 기존 누적 분석을 그대로 받아들이고, 그걸 설명하는 문장만 쓸 것 — trend 자체를 새로 판단하거나 반박하지 말 것.',
        items: {
          type: 'object',
          properties: {
            tagName: { type: 'string', description: '주어진 태그 이름을 그대로 사용' },
            note: {
              type: 'string',
              description:
                '1~2문장. 주어진 trend·숙련도·누적 요약과 이번 주 새 문서를 연결지어 설명. trend가 new면 "새로 시작된 주제"로, cooling/dormant면 담백하게 사실만 언급(부정적 평가 금지).',
            },
          },
          required: ['tagName', 'note'],
        },
      },
    },
    required: ['overview', 'tagNotes'],
  },
}

// 문서 목록 자체는 가공 없이 그대로 이메일에 나열하고, AI는 그 위에 붙는 개요 문단 + 태그별 짧은 노트만 작성한다
// (비용 최소화 — Haiku 1회 호출, 문서 개수와 무관하게 고정 비용). 포맷은 tool_choice로 강제해 자유 서술을 막는다.
export async function generateDigestContent(
  anthropic: Anthropic,
  documents: DigestDocument[],
  tagStats: DigestTagStat[],
  languageLabel: string | null
): Promise<{ overview: string; tagNotes: Array<{ tagName: string; note: string }> }> {
  const docListing = documents
    .map((d) => `- [${formatDateOnly(d.created_at)}] ${d.title}: ${(d.summary ?? '').slice(0, 200)}`)
    .join('\n')

  const tagListing =
    tagStats.length > 0
      ? tagStats
          .map(
            (s) =>
              `- ${s.tag_name} | trend: ${s.trend}(지난 발송 문서 수 ${s.previous_doc_count ?? '기록 없음'} → 이번 주 ${s.doc_count}) | 숙련도: ${s.estimated_level ?? '미상'} | 누적 분석: ${s.note_count >= 10 ? '있음' : '아직 부족(참고용 관찰만 존재)'}`
          )
          .join('\n')
      : '(태그별 집계 없음)'

  const system = `다음은 한 유저의 지식 베이스에 이번 주 새로 쌓인 문서 목록과, 서버가 이미 계산해둔 태그별 활동 추세(trend)입니다.
write_weekly_digest 툴로 정해진 포맷에 맞춰 작성하세요.

[이번 주 새 문서 (생성일 포함)]
${docListing}

[태그별 활동 추세 (trend는 서버가 계산한 값 — 그대로 받아들일 것)]
${tagListing}

지침:
- overview는 문서 하나하나가 아니라 이번 주 전체 흐름을 짚을 것.
- tagNotes는 위 태그 목록과 정확히 같은 개수로, trend를 그대로 받아들여 설명하는 문장만 쓸 것(trend를 재판단하지 말 것).
- 문서 생성일이 서로 다르면(예: 주 초반 vs 주 후반 몰림) 자연스럽게 반영해도 좋으나 억지로 언급하지 말 것.${
    languageLabel ? `\n- ${languageLabel}로 작성하세요.` : ''
  }`

  const response = await anthropic.messages.create({
    model: MODELS.haiku,
    max_tokens: 700,
    system,
    messages: [{ role: 'user', content: '위 지침대로 다이제스트를 작성해주세요.' }],
    tools: [WRITE_WEEKLY_DIGEST_TOOL],
    tool_choice: { type: 'tool', name: 'write_weekly_digest' },
  })

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )
  const input = toolUse?.input as
    | { overview?: string; tagNotes?: Array<{ tagName: string; note: string }> }
    | undefined

  return {
    overview: input?.overview ?? '',
    tagNotes: input?.tagNotes ?? [],
  }
}

function formatDateOnly(iso: string): string {
  return iso.slice(0, 10)
}

export function renderDigestEmailHtml(params: {
  lang: 'ko' | 'en'
  overview: string
  tagStats: DigestTagStat[]
  tagNotes: Array<{ tagName: string; note: string }>
  contradictions: DigestContradiction[]
  documents: DigestDocument[]
  appUrl: string
}): string {
  const { lang, overview, tagStats, tagNotes, contradictions, documents, appUrl } = params
  const trendLabel = lang === 'ko' ? TREND_LABEL_KO : TREND_LABEL_EN
  const t =
    lang === 'ko'
      ? {
          title: '이번 주 지식 베이스 다이제스트',
          byCategory: '관심사 변화',
          contradictions: '확인이 필요한 모순',
          newDocs: '새로 쌓인 문서',
          footer: '지식 베이스 전체 보기',
        }
      : {
          title: 'Your Weekly Knowledge Digest',
          byCategory: 'Interest traction',
          contradictions: 'Contradictions to review',
          newDocs: 'New documents',
          footer: 'View full knowledge base',
        }

  const noteByTagName = new Map(tagNotes.map((n) => [n.tagName, n.note]))

  const rows = documents
    .map(
      (d) => `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #E5E2DA;">
            <a href="${appUrl}/${lang}/notes?doc=${d.id}" style="color:#1A3D2B;font-weight:600;font-size:15px;text-decoration:none;">${escapeHtml(d.title)}</a>
            <span style="color:#B8B5AC;font-size:11px;margin-left:8px;">${formatDateOnly(d.created_at)}</span>
            ${d.summary ? `<p style="margin:6px 0 0;color:#5A5A56;font-size:13px;line-height:1.5;">${escapeHtml(truncate(d.summary, 160))}</p>` : ''}
          </td>
        </tr>`
    )
    .join('')

  const tagRows = tagStats
    .map((s) => {
      const note = noteByTagName.get(s.tag_name) ?? ''
      return `
        <tr>
          <td style="padding:10px 0;">
            <span style="color:#1A3D2B;font-weight:600;font-size:13px;">${escapeHtml(s.tag_name)}</span>
            <span style="color:#8A8A84;font-size:11px;margin-left:8px;text-transform:uppercase;letter-spacing:0.03em;">${trendLabel[s.trend]}</span>
            ${note ? `<p style="margin:4px 0 0;color:#3A3A36;font-size:13px;line-height:1.5;">${escapeHtml(note)}</p>` : ''}
          </td>
        </tr>`
    })
    .join('')

  const contradictionRows = contradictions
    .map(
      (c) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E5E2DA;">
            <a href="${appUrl}/${lang}/notes?doc=${c.document_id}" style="color:#522B2D;font-weight:600;font-size:13px;text-decoration:none;">${escapeHtml(c.document_title)}</a>
            <p style="margin:4px 0 0;color:#3A3A36;font-size:13px;line-height:1.5;">${escapeHtml(truncate(c.content, 200))}</p>
          </td>
        </tr>`
    )
    .join('')

  return `<!doctype html>
<html>
  <body style="margin:0;background:#FAF9F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <tr><td>
        <h1 style="font-size:18px;color:#1A1A18;margin:0 0 16px;">${t.title}</h1>
        <p style="color:#3A3A36;font-size:14px;line-height:1.6;margin:0 0 24px;">${escapeHtml(overview)}</p>
        ${
          tagRows
            ? `<h2 style="font-size:13px;color:#8A8A84;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 4px;">${t.byCategory}</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">${tagRows}</table>`
            : ''
        }
        ${
          contradictionRows
            ? `<h2 style="font-size:13px;color:#522B2D;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 4px;">${t.contradictions}</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">${contradictionRows}</table>`
            : ''
        }
        <h2 style="font-size:13px;color:#8A8A84;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 4px;">${t.newDocs} (${documents.length})</h2>
        <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        <p style="margin:32px 0 0;">
          <a href="${appUrl}/${lang}/notes" style="color:#1A3D2B;font-size:13px;text-decoration:underline;">${t.footer}</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

function truncate(s: string, len: number): string {
  return s.length > len ? s.slice(0, len) + '…' : s
}
