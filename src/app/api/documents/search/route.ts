import { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { embedQuery } from '@/lib/ai/embeddings'

const LIST_COLUMNS = 'id, title, updated_at, doc_type, tag_node_id'
const SEMANTIC_MATCH_COUNT = 20
// 정규화된 코사인 유사도는 관련 없는 질의도 항상 top-N을 반환하므로, "그나마 가장 가까운" 수준의
// 노이즈를 문턱값으로 거른다. Gemini(gemini-embedding-001, 768차원 절단)로 실측 보정한 값 —
// 무관 쌍 ~0.49~0.52, 연관 쌍 ~0.63~0.79로 e5보다 훨씬 잘 갈라져서(이전 e5는 무관 ~0.77~0.80,
// 연관 ~0.84~0.89로 마진이 좁았음) 이 둘 사이인 0.6으로 설정.
const SIMILARITY_THRESHOLD = 0.6
const TEXT_SEARCH_LIMIT = 20

interface DocumentSummary {
  id: string
  title: string | null
  updated_at: string
  doc_type: string | null
  tag_node_id: string | null
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const query = req.nextUrl.searchParams.get('q')?.trim()
  if (!query) {
    return Response.json({ documents: [] })
  }

  let documents: DocumentSummary[] = []

  // 1차: 의미 기반(pgvector) 검색.
  try {
    const embedding = await embedQuery(query)
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_user_id: user.id,
      boost_tag_node_id: null,
      match_count: SEMANTIC_MATCH_COUNT,
    })
    if (error) throw error

    const relevant = ((data ?? []) as { id: string; similarity: number }[]).filter(
      (d) => d.similarity >= SIMILARITY_THRESHOLD
    )

    if (relevant.length > 0) {
      const ids = relevant.map((d) => d.id)
      const { data: rows } = await supabase.from('documents').select(LIST_COLUMNS).in('id', ids)
      const rank = new Map(ids.map((id, i) => [id, i]))
      documents = ((rows ?? []) as DocumentSummary[]).sort(
        (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0)
      )
    }
  } catch (err) {
    console.error('[documents/search] semantic search failed, falling back to text search:', err)
  }

  // 2차(폴백): 임베딩이 실패했거나 유사도 문턱을 넘는 결과가 없으면, 문서 본문의 단어로 찾는다.
  if (documents.length === 0) {
    documents = await textSearch(supabase, user.id, query)
  }

  return Response.json({ documents })
}

/**
 * 문서 안에 실제로 등장하는 단어로 찾는 전문 검색(폴백). tags(보조 키워드)뿐 아니라
 * 제목/요약/결론/배움/원본 대화 본문까지 대상으로 하며, 여러 단어를 넣으면 모두 포함하는
 * 문서를 우선한다. 상세 로직은 `search_documents_text` SQL 함수 참고.
 */
async function textSearch(
  supabase: SupabaseClient,
  userId: string,
  query: string
): Promise<DocumentSummary[]> {
  const { data, error } = await supabase.rpc('search_documents_text', {
    search_query: query,
    match_user_id: userId,
    match_count: TEXT_SEARCH_LIMIT,
  })
  if (error) {
    console.error('[documents/search] text search failed:', error)
    return []
  }
  return ((data ?? []) as (DocumentSummary & { rank: number })[]).map((row) => ({
    id: row.id,
    title: row.title,
    updated_at: row.updated_at,
    doc_type: row.doc_type,
    tag_node_id: row.tag_node_id,
  }))
}
