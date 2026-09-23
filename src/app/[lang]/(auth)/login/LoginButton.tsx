'use client'

import { createBrowserClient } from '@supabase/ssr'

export default function LoginButton({ lang }: { lang: string }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // 마지막으로 로그인했던 계정으로 자동 리다이렉트되지 않고 항상 계정 선택 화면부터 뜨도록 강제
        queryParams: { prompt: 'select_account' },
      },
    })
  }

  return (
    <button
      onClick={handleLogin}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80 cursor-pointer rounded-sm"
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
        border: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="var(--primary-foreground)"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="var(--primary-foreground)"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="var(--primary-foreground)"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="var(--primary-foreground)"/>
      </svg>
      {lang === 'ko' ? 'Google로 계속하기' : 'Continue with Google'}
    </button>
  )
}