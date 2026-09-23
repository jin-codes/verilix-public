import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpSupabaseClient } from '../auth'
import { embedQuery } from '@/lib/ai/embeddings'

// 웹 /notes 검색바(/api/documents/search)와 동일하게 보정한 값. Gemini(gemini-embedding-001,
// 768차원 절단) 기준 무관 쌍 ~0.49~0.52 / 연관 쌍 ~0.63~0.79 사이인 0.6.
const SIMILARITY_THRESHOLD = 0.6

interface DocumentRow {
  id: string
  title: string | null
  summary: string | null
  key_conclusion: string | null
  tags: string[] | null
  doc_type: string | null
  updated_at: string
  tag_node_id: string | null
}

interface TopicInsightRow {
  tag_node_id: string
  summary: string | null
  estimated_level: string | null
  tag_nodes: { name: string } | null
}

export function registerSearchKnowledgeTool(server: McpServer) {
  server.registerTool(
    'search_knowledge',
    {
      title: 'Search Knowledge Base',
      description:
        "Search the user's verilix knowledge base — documents distilled from their past conversations. Runs two searches and merges them: (1) meaning-based similarity over document embeddings, and (2) word-based full-text search over titles, summaries, conclusions, learnings, tags, and the original conversation text. For the word-based search, a space-separated query is split into individual words and every document containing ANY of those words is returned (documents matching more of the words rank higher). Returns matching titles, summaries, conclusions, and tags.",
      inputSchema: {
        query: z
          .string()
          .describe(
            'What to look for. Matched both semantically (by meaning) and by literal words: separate multiple words with spaces to pull in every document that contains any of them.'
          ),
        limit: z.number().int().min(1).max(20).optional().describe('Max number of documents to return (default 5)'),
      },
    },
    async ({ query, limit }, extra) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined
      const apiKeyId = extra.authInfo?.extra?.apiKeyId as string | undefined
      if (!userId) {
        return {
          content: [{ type: 'text', text: 'Unauthorized: missing API key context.' }],
          isError: true,
        }
      }

      const supabase = getMcpSupabaseClient()
      const max = limit ?? 5

      // 두 검색을 항상 함께 돌린다. 임베딩 값이 있든 없든, 의미 기반과 단어 기반 결과를 합친다.
      const [semanticIds, textResult] = await Promise.all([
        semanticSearch(supabase, userId, query, max),
        supabase.rpc('search_documents_text', {
          search_query: query,
          match_user_id: userId,
          match_count: max,
        }),
      ])

      if (textResult.error && semanticIds.length === 0) {
        return {
          content: [{ type: 'text', text: `Search failed: ${textResult.error.message}` }],
          isError: true,
        }
      }

      await supabase.from('mcp_usage_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId ?? null,
        tool: 'search_knowledge',
      })

      // 의미 기반 결과를 먼저 두고, 단어 기반에서만 걸린 문서를 뒤에 이어붙인 뒤 limit로 자른다.
      const textIds = ((textResult.data ?? []) as { id: string }[]).map((r) => r.id)
      const ids: string[] = []
      for (const id of [...semanticIds, ...textIds]) {
        if (!ids.includes(id)) ids.push(id)
      }
      const finalIds = ids.slice(0, max)

      if (finalIds.length === 0) {
        return { content: [{ type: 'text', text: 'No matching documents found.' }] }
      }

      const { data: rows } = await supabase
        .from('documents')
        .select('id, title, summary, key_conclusion, tags, doc_type, updated_at, tag_node_id')
        .in('id', finalIds)

      const order = new Map(finalIds.map((id, i) => [id, i]))
      const matches = ((rows ?? []) as DocumentRow[]).sort(
        (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
      )

      const text = matches
        .map((doc) => {
          const lines = [`# ${doc.title ?? 'Untitled'}`, `Date: ${doc.updated_at.slice(0, 10)}`]
          if (doc.summary) lines.push(doc.summary)
          if (doc.key_conclusion) lines.push(`Conclusion: ${doc.key_conclusion}`)
          if (doc.tags?.length) lines.push(`Tags: ${doc.tags.join(', ')}`)
          return lines.join('\n')
        })
        .join('\n\n---\n\n')

      const background = await buildBackgroundSection(supabase, userId, matches)

      return { content: [{ type: 'text', text: background ? `${text}\n\n${background}` : text }] }
    }
  )
}

/**
 * 의미 기반(pgvector) 검색. 질의를 임베딩해 match_documents로 코사인 유사도 상위 문서를 구하고,
 * 문턱값을 넘는 문서 id만 순서대로 반환한다. 임베딩 호출 실패(GEMINI_API_KEY 부재 등)나
 * RPC 오류는 빈 배열로 흡수해 단어 기반 검색만으로 계속 동작하게 한다.
 */
async function semanticSearch(
  supabase: SupabaseClient,
  userId: string,
  query: string,
  matchCount: number
): Promise<string[]> {
  try {
    const embedding = await embedQuery(query)
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_user_id: userId,
      boost_tag_node_id: null,
      match_count: matchCount,
    })
    if (error) throw error
    return ((data ?? []) as { id: string; similarity: number }[])
      .filter((d) => d.similarity >= SIMILARITY_THRESHOLD)
      .map((d) => d.id)
  } catch (err) {
    console.error('[search_knowledge] semantic search failed, using text search only:', err)
    return []
  }
}

/**
 * 매칭된 문서들의 broad tag_node에 해당하는 topic_insights(누적 요약 + 숙련도)를 조회해
 * 응답 끝에 붙이는 배경 컨텍스트 섹션을 만든다. verilix가 여러 세션에서 관찰해 축적한
 * 유저 성향 분석으로, 외부 AI가 답변 깊이/난이도를 조절하는 데 쓰라는 용도.
 * 웹 채팅이 사라진 뒤 "다음 대화 컨텍스트 주입" 루프를 MCP 검색 경로로 되살리는 부분.
 */
async function buildBackgroundSection(
  supabase: SupabaseClient,
  userId: string,
  matches: DocumentRow[]
): Promise<string | null> {
  const tagNodeIds = [...new Set(matches.map((d) => d.tag_node_id).filter((id): id is string => !!id))]
  if (tagNodeIds.length === 0) return null

  const { data } = await supabase
    .from('topic_insights')
    .select('tag_node_id, summary, estimated_level, tag_nodes(name)')
    .eq('user_id', userId)
    .in('tag_node_id', tagNodeIds)

  const insights = ((data ?? []) as unknown as TopicInsightRow[]).filter(
    (row) => row.summary || row.estimated_level
  )
  if (insights.length === 0) return null

  const blocks = insights.map((row) => {
    const name = row.tag_nodes?.name ?? 'general'
    const header = row.estimated_level ? `## ${name} (proficiency: ${row.estimated_level})` : `## ${name}`
    return row.summary ? `${header}\n${row.summary}` : header
  })

  return [
    "[Background on this user — verilix's accumulated analysis of their tendencies and proficiency on these topics, distilled across past sessions. Use it to calibrate the depth and framing of your response. Do not recite it back to the user unprompted.]",
    ...blocks,
  ].join('\n\n')
}
