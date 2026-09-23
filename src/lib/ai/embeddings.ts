import { GoogleGenAI } from '@google/genai'

// Gemini 임베딩. 이전에는 로컬 오픈소스 모델(Xenova/multilingual-e5-small)을 썼으나 API 기반으로
// 교체 — 콜드 스타트/Vercel 함수 파일시스템 제약이 사라지는 대신 GEMINI_API_KEY가 필요하다.
const MODEL = 'gemini-embedding-001'
// gemini-embedding-001은 Matryoshka 표현 학습(MRL)으로 최대 3072차원 중 원하는 길이로 잘라 쓸 수
// 있다. 이전 로컬 모델과 마찬가지로 768로 맞춤 — documents.embedding/match_documents도 vector(768).
const OUTPUT_DIMENSIONALITY = 768

let client: GoogleGenAI | null = null
function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set')
    client = new GoogleGenAI({ apiKey })
  }
  return client
}

// outputDimensionality로 3072보다 짧게 자르면 그 결과가 더 이상 단위 벡터가 아니므로, 코사인
// 유사도(pgvector `<=>`)가 의도대로 동작하도록 여기서 다시 정규화해야 한다 (Gemini 문서 권장 사항).
function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0))
  return norm === 0 ? vec : vec.map((v) => v / norm)
}

async function embed(
  text: string,
  taskType: 'RETRIEVAL_QUERY' | 'RETRIEVAL_DOCUMENT'
): Promise<number[]> {
  const ai = getClient()
  const response = await ai.models.embedContent({
    model: MODEL,
    contents: text,
    config: { taskType, outputDimensionality: OUTPUT_DIMENSIONALITY },
  })
  const values = response.embeddings?.[0]?.values
  if (!values) throw new Error('Gemini embedding response missing values')
  return normalize(values)
}

// task_type으로 질의/문서를 구분 — 이전 e5의 "query: "/"passage: " 텍스트 프리픽스 관례를
// Gemini API의 네이티브 파라미터로 대체한 것.
export function embedQuery(text: string): Promise<number[]> {
  return embed(text, 'RETRIEVAL_QUERY')
}

export function embedPassage(text: string): Promise<number[]> {
  return embed(text, 'RETRIEVAL_DOCUMENT')
}

// 문서 생성 흐름에서 쓰는 안전 래퍼 — 임베딩 실패가 문서 저장 자체를 막지 않도록 null로 흡수한다.
export async function tryGenerateDocumentEmbedding(doc: {
  title: string
  summary: string
  key_conclusion: string | null
  learnings: string | null
}): Promise<number[] | null> {
  try {
    const text = [doc.title, doc.summary, doc.key_conclusion, doc.learnings].filter(Boolean).join('\n')
    return await embedPassage(text)
  } catch (err) {
    console.error('[embeddings] tryGenerateDocumentEmbedding failed:', err)
    return null
  }
}
