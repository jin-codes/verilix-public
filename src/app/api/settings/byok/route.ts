import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptApiKey, maskApiKey, BYOK_PROVIDERS, type ByokProvider } from '@/lib/ai/byok'

export const runtime = 'nodejs'

// 클라이언트가 원문 키 자체를 암호화할 수단이 없으므로(암호화 시크릿은 서버에만 있음), 원문을
// HTTPS로 서버에 보내 여기서 암호화 후 저장한다 — mcp_api_keys(브라우저에서 직접 해시 후 insert)와
// 달리 이 값은 나중에 실제 호출에 다시 써야 해 되돌릴 수 있는 암호화가 필요하기 때문.
const MAX_KEY_LENGTH = 300

function isValidProvider(value: unknown): value is ByokProvider {
  return typeof value === 'string' && (BYOK_PROVIDERS as string[]).includes(value)
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const [{ data: keys, error: keysError }, { data: profile }] = await Promise.all([
    supabase.from('user_api_keys').select('provider, key_preview, updated_at').eq('user_id', user.id),
    supabase.from('profiles').select('active_byok_provider').eq('id', user.id).maybeSingle(),
  ])

  if (keysError) return new Response(keysError.message, { status: 500 })

  return Response.json({ keys: keys ?? [], activeProvider: profile?.active_byok_provider ?? null })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const provider = body?.provider
  const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : ''

  if (!isValidProvider(provider)) {
    return new Response('invalid provider', { status: 400 })
  }
  if (!apiKey || apiKey.length > MAX_KEY_LENGTH) {
    return new Response('invalid apiKey', { status: 400 })
  }

  const encryptedKey = encryptApiKey(apiKey)
  const keyPreview = maskApiKey(apiKey)

  const { error } = await supabase.from('user_api_keys').upsert(
    {
      user_id: user.id,
      provider,
      encrypted_key: encryptedKey,
      key_preview: keyPreview,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,provider' }
  )

  if (error) return new Response(error.message, { status: 500 })

  // 아직 활성 프로바이더가 하나도 없으면(첫 키 등록) 이 키를 자동으로 활성화한다 — 대부분의
  // 유저는 키를 하나만 등록해두고 쓰므로, 매번 "활성화" 버튼을 따로 누르게 하지 않기 위함.
  // 이미 다른 프로바이더가 활성 상태면 건드리지 않고 유저가 명시적으로 전환하게 둔다.
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_byok_provider')
    .eq('id', user.id)
    .maybeSingle()
  let activeProvider = profile?.active_byok_provider ?? null
  if (!activeProvider) {
    await supabase.from('profiles').update({ active_byok_provider: provider }).eq('id', user.id)
    activeProvider = provider
  }

  return Response.json({ provider, keyPreview, activeProvider })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const provider = body?.provider
  if (!isValidProvider(provider)) {
    return new Response('invalid provider', { status: 400 })
  }

  const { error } = await supabase
    .from('user_api_keys')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', provider)

  if (error) return new Response(error.message, { status: 500 })

  // 지금 삭제한 키가 활성 프로바이더였다면 참조가 끊긴 채 남아있지 않도록 함께 비운다 —
  // 그대로 두면 채팅 라우트가 이미 삭제된 키를 찾다 조용히 앱 기본 경로로 폴백하긴 하지만,
  // 설정 화면에 "활성"이라고 표시된 프로바이더에 키가 없는 상태로 보이는 건 혼란스럽다.
  await supabase
    .from('profiles')
    .update({ active_byok_provider: null })
    .eq('id', user.id)
    .eq('active_byok_provider', provider)

  return new Response(null, { status: 204 })
}

// 여러 프로바이더 키를 동시에 등록해둔 유저가 채팅에 쓸 프로바이더를 명시적으로 전환할 때 사용.
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const provider = body?.provider

  // null이면 BYOK 자체를 끄고 앱 기본 경로(크레딧 시스템)로 돌아간다.
  if (provider !== null && !isValidProvider(provider)) {
    return new Response('invalid provider', { status: 400 })
  }

  if (provider !== null) {
    const { data: existingKey } = await supabase
      .from('user_api_keys')
      .select('provider')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .maybeSingle()
    if (!existingKey) return new Response('no key registered for this provider', { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ active_byok_provider: provider })
    .eq('id', user.id)

  if (error) return new Response(error.message, { status: 500 })

  return Response.json({ activeProvider: provider })
}
