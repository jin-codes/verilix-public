import { NextRequest, NextResponse } from 'next/server'
import { getMcpSupabaseClient } from '@/mcp/auth'
import { sha256Hex } from '@/lib/mcp-key'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyPkce,
} from '@/mcp/oauth'

const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000 // 1시간

async function parseBody(req: NextRequest): Promise<Record<string, string>> {
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return (await req.json().catch(() => ({}))) as Record<string, string>
  }
  const form = await req.formData()
  return Object.fromEntries(form.entries()) as Record<string, string>
}

function tokenError(error: string, description: string, status = 400) {
  return NextResponse.json({ error, error_description: description }, { status })
}

// authorization_code / refresh_token 두 grant_type을 모두 처리하는 단일 token 엔드포인트
export async function POST(req: NextRequest) {
  const body = await parseBody(req)
  const supabase = getMcpSupabaseClient()

  if (body.grant_type === 'authorization_code') {
    const { code, redirect_uri: redirectUri, client_id: clientId, code_verifier: codeVerifier } = body
    if (!code || !redirectUri || !clientId || !codeVerifier) {
      return tokenError('invalid_request', 'code, redirect_uri, client_id, code_verifier는 필수입니다.')
    }

    const codeHash = await sha256Hex(code)
    const { data: codeRow } = await supabase
      .from('mcp_oauth_codes')
      .select('*')
      .eq('code_hash', codeHash)
      .single()

    if (!codeRow || codeRow.used_at) {
      return tokenError('invalid_grant', '유효하지 않거나 이미 사용된 code입니다.')
    }
    if (new Date(codeRow.expires_at).getTime() < Date.now()) {
      return tokenError('invalid_grant', 'code가 만료되었습니다.')
    }
    if (codeRow.client_id !== clientId || codeRow.redirect_uri !== redirectUri) {
      return tokenError('invalid_grant', 'client_id 또는 redirect_uri가 일치하지 않습니다.')
    }
    const pkceOk = await verifyPkce(codeVerifier, codeRow.code_challenge)
    if (!pkceOk) {
      return tokenError('invalid_grant', 'code_verifier가 code_challenge와 일치하지 않습니다.')
    }

    // 조회와 사용 처리가 분리돼 있으면 동시에 들어온 두 요청이 같은 code로 각각 토큰을 받을 수 있다.
    // used_at이 null인 행만 갱신하는 조건부 update로 한 요청만 code를 "선점"하게 한다.
    const { data: claimed } = await supabase
      .from('mcp_oauth_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', codeRow.id)
      .is('used_at', null)
      .select('id')
    if (!claimed || claimed.length === 0) {
      return tokenError('invalid_grant', '유효하지 않거나 이미 사용된 code입니다.')
    }

    return issueTokenResponse({
      clientId,
      userId: codeRow.user_id,
      scope: codeRow.scope,
    })
  }

  if (body.grant_type === 'refresh_token') {
    const { refresh_token: refreshToken, client_id: clientId } = body
    if (!refreshToken || !clientId) {
      return tokenError('invalid_request', 'refresh_token, client_id는 필수입니다.')
    }

    const refreshHash = await sha256Hex(refreshToken)
    const { data: tokenRow } = await supabase
      .from('mcp_oauth_tokens')
      .select('*')
      .eq('refresh_token_hash', refreshHash)
      .single()

    if (!tokenRow || tokenRow.revoked_at || tokenRow.client_id !== clientId) {
      return tokenError('invalid_grant', '유효하지 않은 refresh_token입니다.')
    }

    // refresh token도 한 번만 쓸 수 있게 조건부 update로 선점한다(회전 시 이중 발급 방지)
    const { data: rotated } = await supabase
      .from('mcp_oauth_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', tokenRow.id)
      .is('revoked_at', null)
      .select('id')
    if (!rotated || rotated.length === 0) {
      return tokenError('invalid_grant', '유효하지 않은 refresh_token입니다.')
    }

    return issueTokenResponse({
      clientId,
      userId: tokenRow.user_id,
      scope: tokenRow.scope,
    })
  }

  return tokenError('unsupported_grant_type', 'authorization_code, refresh_token만 지원합니다.')
}

async function issueTokenResponse(params: {
  clientId: string
  userId: string
  scope: string | null
}) {
  const accessToken = generateAccessToken()
  const refreshToken = generateRefreshToken()
  const [accessTokenHash, refreshTokenHash] = await Promise.all([
    sha256Hex(accessToken),
    sha256Hex(refreshToken),
  ])

  const supabase = getMcpSupabaseClient()
  const { error } = await supabase.from('mcp_oauth_tokens').insert({
    access_token_hash: accessTokenHash,
    refresh_token_hash: refreshTokenHash,
    client_id: params.clientId,
    user_id: params.userId,
    scope: params.scope,
    expires_at: new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString(),
  })

  if (error) {
    return tokenError('server_error', '토큰 발급 중 오류가 발생했습니다.', 500)
  }

  return NextResponse.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
    refresh_token: refreshToken,
    scope: params.scope ?? undefined,
  })
}
