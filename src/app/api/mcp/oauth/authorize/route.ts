import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMcpSupabaseClient } from '@/mcp/auth'
import { sha256Hex } from '@/lib/mcp-key'
import { getOAuthClient, generateAuthorizationCode } from '@/mcp/oauth'

const CODE_TTL_MS = 10 * 60 * 1000
const ALLOWED_SCOPES = ['knowledge:read', 'knowledge:write']

// 동의 화면/에러 화면은 다른 사이트의 iframe 안에 끼워 넣어 클릭을 가로채는(clickjacking) 용도로
// 쓰일 수 있으므로 프레임 삽입을 전부 막는다.
const HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Content-Security-Policy': "frame-ancestors 'none'",
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store',
}

// client_name 등은 DCR로 누구나 임의 값을 등록할 수 있는 신뢰할 수 없는 문자열이므로
// HTML에 넣을 땐 반드시 이스케이프한다.
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function page(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
  body{font-family:system-ui,sans-serif;background:#faf9f6;color:#1a1a18;margin:0;padding:2rem 1rem}
  .card{max-width:30rem;margin:0 auto;background:#fff;border:1px solid #e4e1d8;border-radius:14px;padding:1.75rem}
  h2{margin:0 0 .75rem;font-size:1.25rem}
  p{line-height:1.55;color:#4a4a46}
  .box{background:#f3f1ea;border-radius:8px;padding:.75rem 1rem;margin:1rem 0;font-size:.9rem;word-break:break-all}
  .box b{display:block;font-size:.75rem;color:#6b6b66;font-weight:600;margin-bottom:.15rem}
  ul{padding-left:1.1rem;color:#4a4a46;line-height:1.6}
  .row{display:flex;gap:.6rem;margin-top:1.25rem}
  button{flex:1;padding:.7rem 1rem;border-radius:10px;border:1px solid #d5d2c8;background:#fff;font-size:.95rem;cursor:pointer}
  button.primary{background:#1a3d2b;border-color:#1a3d2b;color:#fff}
  .warn{color:#522b2d;font-size:.85rem}
</style></head><body><div class="card">${body}</div></body></html>`,
    { status, headers: HTML_HEADERS }
  )
}

function errorPage(message: string) {
  return page('verilix 연결 실패', `<h2>verilix 연결에 실패했습니다</h2><p>${esc(message)}</p>`, 400)
}

interface AuthorizeParams {
  responseType: string | null
  clientId: string | null
  redirectUri: string | null
  state: string | null
  codeChallenge: string | null
  codeChallengeMethod: string
  scope: string
}

function normalizeScope(raw: string | null): string {
  const requested = (raw ?? '').split(/\s+/).filter(Boolean)
  const granted = requested.filter((s) => ALLOWED_SCOPES.includes(s))
  return (granted.length ? granted : ALLOWED_SCOPES).join(' ')
}

function readParams(get: (key: string) => string | null): AuthorizeParams {
  return {
    responseType: get('response_type'),
    clientId: get('client_id'),
    redirectUri: get('redirect_uri'),
    state: get('state'),
    codeChallenge: get('code_challenge'),
    codeChallengeMethod: get('code_challenge_method') ?? 'S256',
    scope: normalizeScope(get('scope')),
  }
}

// GET/POST 공통 검증. 통과하면 등록된 클라이언트 정보를, 아니면 에러 응답을 돌려준다.
async function validate(p: AuthorizeParams) {
  if (p.responseType !== 'code') {
    return { error: errorPage('response_type은 code만 지원합니다.') }
  }
  if (!p.clientId || !p.redirectUri || !p.codeChallenge) {
    return { error: errorPage('client_id, redirect_uri, code_challenge는 필수입니다.') }
  }
  if (p.codeChallengeMethod !== 'S256') {
    return { error: errorPage('code_challenge_method은 S256만 지원합니다.') }
  }
  const client = await getOAuthClient(p.clientId)
  if (!client || !client.redirect_uris.includes(p.redirectUri)) {
    return { error: errorPage('등록되지 않은 client_id 또는 redirect_uri입니다.') }
  }
  return { client }
}

// OAuth authorization_code + PKCE의 /authorize 엔드포인트.
// GET은 동의 화면만 보여준다 — 사용자가 "허용"을 눌러 POST가 성공해야만 code가 발급된다.
// (DCR이 공개돼 있어 누구나 자기 redirect_uri로 클라이언트를 등록할 수 있으므로, 로그인된 브라우저에서
// 링크만 열어도 자동으로 code가 나가던 예전 방식은 토큰 탈취에 악용될 수 있었다.)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params = readParams((k) => searchParams.get(k))

  const checked = await validate(params)
  if (checked.error) return checked.error
  const client = checked.client!

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/ko/login', getRequestOrigin(req))
    return page(
      'verilix 로그인 필요',
      `<h2>verilix 로그인이 필요합니다</h2>
       <p>이 브라우저에서 <a href="${esc(loginUrl.toString())}" target="_blank" rel="noopener">verilix.vercel.app에 먼저 로그인</a>한 뒤,
       다시 연결을 시도해주세요.</p>`,
      401
    )
  }

  let redirectHost = params.redirectUri!
  try {
    redirectHost = new URL(params.redirectUri!).host || params.redirectUri!
  } catch {
    /* 표시용이라 파싱 실패는 원문 그대로 보여준다 */
  }

  const hidden = (name: string, value: string | null) =>
    value === null ? '' : `<input type="hidden" name="${name}" value="${esc(value)}">`

  return page(
    'verilix 연결 허용',
    `<h2>이 앱이 verilix에 접근하려고 합니다</h2>
     <div class="box"><b>앱 이름 (앱이 직접 밝힌 이름이며 검증되지 않았습니다)</b>${esc(client.client_name ?? '이름 없는 앱')}</div>
     <div class="box"><b>승인 후 이동할 주소</b>${esc(redirectHost)}</div>
     <p>허용하면 이 앱이 내 계정(<b>${esc(user.email ?? '')}</b>)의 지식 베이스에서 다음을 할 수 있습니다:</p>
     <ul>
       <li>문서 검색·조회</li>
       <li>문서 저장·수정·삭제·정리(카테고리·폴더·링크)</li>
     </ul>
     <p class="warn">직접 연결하려던 앱이 아니라면 “거부”를 누르세요. 연결은 언제든 verilix의 MCP 화면에서 해제할 수 있습니다.</p>
     <form method="POST" action="/api/mcp/oauth/authorize">
       ${hidden('response_type', params.responseType)}
       ${hidden('client_id', params.clientId)}
       ${hidden('redirect_uri', params.redirectUri)}
       ${hidden('state', params.state)}
       ${hidden('code_challenge', params.codeChallenge)}
       ${hidden('code_challenge_method', params.codeChallengeMethod)}
       ${hidden('scope', params.scope)}
       <div class="row">
         <button type="submit" name="decision" value="deny">거부</button>
         <button type="submit" name="decision" value="approve" class="primary">허용</button>
       </div>
     </form>`
  )
}

// 동의 화면의 폼 제출. 같은 origin에서 온 요청만 받고(CSRF), 로그인 세션을 다시 확인한 뒤 code를 발급한다.
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (!origin || origin !== getRequestOrigin(req)) {
    return errorPage('허용되지 않은 요청입니다.')
  }

  const form = await req.formData()
  const params = readParams((k) => {
    const v = form.get(k)
    return typeof v === 'string' ? v : null
  })
  const decision = form.get('decision')

  const checked = await validate(params)
  if (checked.error) return checked.error

  const redirect = new URL(params.redirectUri!)

  if (decision !== 'approve') {
    redirect.searchParams.set('error', 'access_denied')
    if (params.state) redirect.searchParams.set('state', params.state)
    return NextResponse.redirect(redirect.toString(), 303)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return errorPage('로그인 세션이 만료되었습니다. 다시 로그인한 뒤 연결을 시도해주세요.')
  }

  const code = generateAuthorizationCode()
  const codeHash = await sha256Hex(code)
  const serviceClient = getMcpSupabaseClient()

  const { error } = await serviceClient.from('mcp_oauth_codes').insert({
    code_hash: codeHash,
    client_id: params.clientId,
    user_id: user.id,
    redirect_uri: params.redirectUri,
    code_challenge: params.codeChallenge,
    code_challenge_method: params.codeChallengeMethod,
    scope: params.scope,
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  })

  if (error) {
    return errorPage('인증 코드 발급 중 오류가 발생했습니다.')
  }

  redirect.searchParams.set('code', code)
  if (params.state) redirect.searchParams.set('state', params.state)

  // 303: POST 결과를 GET 리다이렉트로 넘긴다
  return NextResponse.redirect(redirect.toString(), 303)
}

function getRequestOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
  return new URL(req.url).origin
}
