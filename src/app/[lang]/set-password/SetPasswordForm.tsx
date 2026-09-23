'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordForm({ lang }: { lang: string }) {
  const router = useRouter()
  const isKo = lang === 'ko'
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(isKo ? '비밀번호가 일치하지 않습니다.' : 'Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { has_password: true },
    })

    if (updateError) {
      const message = updateError.message.toLowerCase().includes('at least')
        ? isKo
          ? '비밀번호는 최소 6자 이상이어야 합니다.'
          : 'Password must be at least 6 characters.'
        : updateError.message
      setError(message)
      setIsSubmitting(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: profile } = await supabase
      .from('profiles')
      .select('type_a_updated_at')
      .eq('id', user!.id)
      .single()

    router.push(`/${lang}/${profile?.type_a_updated_at ? 'mcp' : 'onboarding'}`)
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 rounded-lg"
        style={{
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            {isKo ? '비밀번호 설정' : 'Set a Password'}
          </h1>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
            {isKo
              ? '이메일 인증이 완료됐어요. 다음부터 로그인할 때 사용할 비밀번호를 설정해주세요.'
              : "Your email is verified. Set a password to use for logging in next time."}
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder={isKo ? '비밀번호 (6자 이상)' : 'Password (6+ characters)'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 text-sm outline-none rounded-sm"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder={isKo ? '비밀번호 확인' : 'Confirm password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2.5 text-sm outline-none rounded-sm"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
          {error && (
            <p className="text-xs" style={{ color: 'var(--destructive)' }}>
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 rounded-sm"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? (isKo ? '저장 중...' : 'Saving...') : isKo ? '설정하고 시작하기' : 'Set Password & Continue'}
        </button>
      </form>
    </main>
  )
}
