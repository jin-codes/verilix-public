import { NextRequest, NextResponse } from 'next/server'

function getOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
  return new URL(req.url).origin
}

// RFC 8414 — /api/mcp/oauth/* 라우트(authorize/token/register)의 discovery 문서.
// 공개 클라이언트(PKCE)만 지원, client secret 발급 없음
export async function GET(req: NextRequest) {
  const origin = getOrigin(req)
  return NextResponse.json({
    issuer: origin,
    authorization_endpoint: `${origin}/api/mcp/oauth/authorize`,
    token_endpoint: `${origin}/api/mcp/oauth/token`,
    registration_endpoint: `${origin}/api/mcp/oauth/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: ['knowledge:read', 'knowledge:write'],
  })
}
