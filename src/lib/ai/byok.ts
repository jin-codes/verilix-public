import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ByokProvider = 'openai' | 'anthropic' | 'google'
export const BYOK_PROVIDERS: ByokProvider[] = ['anthropic', 'openai', 'google']

const ALGORITHM = 'aes-256-gcm'

// API_KEY_ENCRYPTION_SECRET은 임의 길이 문자열을 받아 sha256으로 32바이트 AES 키로 정규화한다
// (원문 시크릿 자체를 키로 쓰지 않음 — 길이가 32바이트가 아니어도 안전하게 동작하게 하기 위함).
function getEncryptionKey(): Buffer {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET
  if (!secret) throw new Error('API_KEY_ENCRYPTION_SECRET is not set')
  return crypto.createHash('sha256').update(secret).digest()
}

// iv(12B) + authTag(16B) + ciphertext를 이어붙여 base64 하나로 저장한다.
export function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64')
}

export function decryptApiKey(encrypted: string): string {
  const key = getEncryptionKey()
  const raw = Buffer.from(encrypted, 'base64')
  const iv = raw.subarray(0, 12)
  const authTag = raw.subarray(12, 28)
  const ciphertext = raw.subarray(28)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

// 목록 화면에 원문 대신 보여줄 미리보기 (앞 4자 + 마스킹 + 뒤 4자).
export function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••'
  return `${key.slice(0, 4)}••••${key.slice(-4)}`
}

// 채팅 라우트 등에서 유저의 BYOK 키를 복호화해 가져올 때 쓰는 공용 헬퍼.
// 키가 없거나 복호화에 실패하면(암호화 시크릿 변경 등) null을 반환한다 — 호출부가 앱 기본 키로
// 조용히 폴백할 수 있게 하기 위함.
export async function getDecryptedApiKey(
  supabase: SupabaseClient,
  userId: string,
  provider: ByokProvider
): Promise<string | null> {
  const { data } = await supabase
    .from('user_api_keys')
    .select('encrypted_key')
    .eq('user_id', userId)
    .eq('provider', provider)
    .maybeSingle()
  if (!data) return null
  try {
    return decryptApiKey(data.encrypted_key)
  } catch {
    return null
  }
}

// 유저가 3사 키를 동시에 등록해둘 수 있으므로, 채팅에 실제로 쓸 프로바이더 하나는
// profiles.active_byok_provider로 명시적으로 선택하게 한다(설정 화면 참고). 호출부(chat route)가
// 이미 profiles 행을 조회해뒀을 것이므로 여기서 다시 조회하지 않고 그 값을 그대로 받는다.
// activeProvider가 없거나, 있어도 그 프로바이더의 키가 이미 삭제된 상태라면(설정 UI가 지우면서
// 이 필드도 같이 비워주지만, 그 사이의 레이스나 수동 DB 조작 등에 대비한 안전망) null을 반환해
// 앱 기본 경로로 조용히 폴백시킨다 — 채팅 자체를 막지 않는다.
export async function getActiveByokKey(
  supabase: SupabaseClient,
  userId: string,
  activeProvider: ByokProvider | null
): Promise<{ provider: ByokProvider; apiKey: string } | null> {
  if (!activeProvider) return null
  const apiKey = await getDecryptedApiKey(supabase, userId, activeProvider)
  if (!apiKey) return null
  return { provider: activeProvider, apiKey }
}
