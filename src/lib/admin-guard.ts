import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// /admin 하위 라우트 전체가 공유하는 관리자 게이트.
// 관리자가 아니면 이 라우트가 존재한다는 것 자체를 알 필요가 없으므로 조용히 돌려보낸다(404 대신 /mcp 리다이렉트).
export async function requireAdmin(lang: string): Promise<void> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin !== true) {
    redirect(`/${lang}/mcp`)
  }
}
