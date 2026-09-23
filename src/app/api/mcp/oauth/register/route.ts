import { NextRequest, NextResponse } from 'next/server'
import { getMcpSupabaseClient } from '@/mcp/auth'
import { generateClientId } from '@/mcp/oauth'

const MAX_REDIRECT_URIS = 10
const FORBIDDEN_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:', 'blob:', 'about:']

// https, 로컬 개발용 http(localhost/127.0.0.1), 데스크톱 앱용 커스텀 스킴(예: claude://)만 허용한다.
// javascript:/data: 같은 스킴이나 fragment가 붙은 URI는 리다이렉트 대상으로 쓸 수 없다(RFC 6749 §3.1.2).
function isValidRedirectUri(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2000) return false
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (FORBIDDEN_SCHEMES.includes(url.protocol) || url.hash) return false
  if (url.protocol === 'http:') return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  return true
}

// Dynamic Client Registration (RFC 7591) — 공개 클라이언트 전용(PKCE, client secret 없음).
// ChatGPT/Claude 같은 커넥터가 authorize 플로우 시작 전에 자동으로 호출함
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const redirectUris = body?.redirect_uris

  if (!Array.isArray(redirectUris) || redirectUris.length === 0 || redirectUris.length > MAX_REDIRECT_URIS) {
    return NextResponse.json(
      { error: 'invalid_client_metadata', error_description: 'redirect_uris is required' },
      { status: 400 }
    )
  }
  if (!redirectUris.every(isValidRedirectUri)) {
    return NextResponse.json(
      { error: 'invalid_redirect_uri', error_description: 'redirect_uris contains an unsupported or malformed URI' },
      { status: 400 }
    )
  }
  const clientName =
    typeof body?.client_name === 'string' ? body.client_name.trim().slice(0, 100) || null : null

  const clientId = generateClientId()
  const supabase = getMcpSupabaseClient()

  const { error } = await supabase.from('mcp_oauth_clients').insert({
    client_id: clientId,
    redirect_uris: redirectUris,
    client_name: clientName,
  })

  if (error) {
    return NextResponse.json(
      { error: 'server_error', error_description: 'failed to register client' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    client_id: clientId,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    redirect_uris: redirectUris,
    client_name: clientName ?? undefined,
    token_endpoint_auth_method: 'none',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
  })
}
