import type { ByokProvider } from './byok'

export type ModelMode = 'auto' | 'deep'

export const MODELS = {
  haiku: 'claude-haiku-4-5',
  sonnet: 'claude-sonnet-5',
  opus: 'claude-opus-5',
} as const

const DEPTH_KEYWORDS = ['깊이', '자세히', '중요한']

function hasDepthSignal(latestUserMessage: string): boolean {
  const isLong = latestUserMessage.length >= 200
  const hasDepthKeyword = DEPTH_KEYWORDS.some((keyword) => latestUserMessage.includes(keyword))
  return isLong || hasDepthKeyword
}

/**
 * 앱 기본 키(BYOK 미사용) 경로 전용 — Opus는 호출하지 않는다. deep 모드는 항상 Sonnet, auto
 * 모드는 길이(200자 이상)나 깊이 관련 키워드가 있으면 Sonnet, 아니면 Haiku로 근사한다
 * (CLAUDE.md 비용 최적화 원칙 1). BYOK 경로(유저 본인 키)는 아래 selectModelForProvider가
 * 별도로 처리하며, 이 함수의 "Opus 금지" 제약을 받지 않는다 — 비용을 유저가 직접 부담하므로.
 */
export function selectModel(modelMode: ModelMode, latestUserMessage: string): string {
  if (modelMode === 'deep') return MODELS.sonnet
  return hasDepthSignal(latestUserMessage) ? MODELS.sonnet : MODELS.haiku
}

// BYOK(유저 본인 키) 경로의 프로바이더별 3단 모델 계층. auto는 하위/중위 중 고르고, deep은
// 중위/상위 중 고른다(구글은 상위 계층이 따로 없어 deep이 항상 중위 하나로 고정) — 위
// hasDepthSignal과 동일한 신호(길이/키워드)로 "한 단계 위" 모델을 고를지 판단한다.
const BYOK_MODEL_TIERS: Record<
  ByokProvider,
  { auto: { low: string; mid: string }; deep: { mid: string; high: string } | { fixed: string } }
> = {
  anthropic: {
    auto: { low: MODELS.haiku, mid: MODELS.sonnet },
    deep: { mid: MODELS.sonnet, high: MODELS.opus },
  },
  openai: {
    auto: { low: 'gpt-5.6-luna', mid: 'gpt-5.6-terra' },
    deep: { mid: 'gpt-5.6-terra', high: 'gpt-5.6-sol' },
  },
  google: {
    auto: { low: 'gemini-3.6-flash', mid: 'gemini-3.1-pro-preview' },
    deep: { fixed: 'gemini-3.1-pro-preview' },
  },
}

export function selectModelForProvider(
  provider: ByokProvider,
  modelMode: ModelMode,
  latestUserMessage: string
): string {
  const tiers = BYOK_MODEL_TIERS[provider]
  const upgrade = hasDepthSignal(latestUserMessage)

  if (modelMode === 'deep') {
    return 'fixed' in tiers.deep ? tiers.deep.fixed : upgrade ? tiers.deep.high : tiers.deep.mid
  }
  return upgrade ? tiers.auto.mid : tiers.auto.low
}
