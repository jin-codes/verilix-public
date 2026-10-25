import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const admin = createAdminClient()

  // 하드 삭제(shouldSoftDelete 미사용). auth.users row를 지우면 profiles → conversations/documents/
  // folders/tag_nodes/topic_insights/assistant_notes/mcp_api_keys/mcp_oauth_*/user_api_keys 등
  // 이 계정 소유 데이터가 FK on delete cascade로 전부 함께 삭제되고, API 키·OAuth 토큰도 같이
  // 사라져 MCP 접근도 즉시 막힌다. 개인정보처리방침("탈퇴 시 지체 없이 파기")과 일치시키기 위해
  // 예전의 "데이터 보존 소프트 삭제"(2026-07-31)를 2026-10-14에 되돌렸다. 복구 불가.
  const { error } = await admin.auth.admin.deleteUser(user.id)

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
