import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const isEmailIdentity = data.user.app_metadata?.provider === 'email'
      const hasPassword = data.user.user_metadata?.has_password === true

      if (isEmailIdentity && !hasPassword) {
        return NextResponse.redirect(`${origin}/ko/set-password`)
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('type_a_updated_at')
        .eq('id', data.user.id)
        .single()

      const destination = profile?.type_a_updated_at ? 'mcp' : 'onboarding'
      return NextResponse.redirect(`${origin}/ko/${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/ko/login`)
}
