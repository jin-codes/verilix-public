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

  // soft delete와 무관하게(웹 로그인 세션과 별개 인증 경로라 auth.users 상태를 안 봄) 살아있는
  // MCP API 키는 계속 유효하므로, 탈퇴 시 명시적으로 revoke해서 이 계정으로 더 이상 MCP 툴을
  // 호출할 수 없게 한다.
  await admin
    .from('mcp_api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('revoked_at', null)

  // shouldSoftDelete=true로 auth.users row 자체는 남겨둔다 (GoTrue가 email/phone만 스크럽하고
  // deleted_at을 세팅 — 로그인은 막히지만 row는 삭제되지 않음). profiles.id가 이 row를
  // on delete cascade로 참조하고 conversations/documents/topic_insights 등도 다시 profiles.id를
  // cascade로 참조하므로, row를 실제로 지우면(shouldSoftDelete 없이 deleteUser) 이 데이터가
  // 전부 함께 삭제된다 — 계정을 탈퇴해도 대화 기록·문서·topic_insights는 보존해야 하므로
  // 반드시 soft delete를 써야 한다.
  const { error } = await admin.auth.admin.deleteUser(user.id, true)

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
