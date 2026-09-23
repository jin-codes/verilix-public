import { NextRequest, NextResponse } from 'next/server'

function getOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
  return new URL(req.url).origin
}

// RFC 9728 — withMcpAuth가 401 응답의 WWW-Authenticate에 이 문서 경로를 넣어줌.
// OAuth 클라이언트가 /api/mcp를 최초 호출했다가 401을 받으면 이 문서로 authorization server를 찾아감
export async function GET(req: NextRequest) {
  const origin = getOrigin(req)
  return NextResponse.json({
    resource: `${origin}/api/mcp`,
    authorization_servers: [origin],
  })
}
