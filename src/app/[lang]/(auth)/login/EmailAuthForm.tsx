'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'signup'
type LoginMethod = 'link' | 'password'

function mapAuthError(message: string, isKo: boolean): string {
  if (message.includes('Invalid login credentials')) {
    return isKo ? '이메일 또는 비밀번호가 올바르지 않습니다.' : 'Invalid email or password.'
  }
  if (message.includes('Email not confirmed')) {
    return isKo
      ? '이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.'
      : 'Please confirm your email before logging in.'
  }
  if (message.toLowerCase().includes('rate limit')) {
    return isKo
      ? '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.'
      : 'Too many requests. Please try again in a moment.'
  }
  return message
}

export default function EmailAuthForm({ lang }: { lang: string }) {
  const router = useRouter()
  const isKo = lang === 'ko'
  const [mode, setMode] = useState<Mode>('login')
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('link')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const resetMessages = () => {
    setError(null)
    setNotice(null)
  }

  const redirectAfterAuth = async (userId: string) => {
    const supabase = createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('type_a_updated_at')
      .eq('id', userId)
      .single()

    router.push(`/${lang}/${profile?.type_a_updated_at ? 'mcp' : 'onboarding'}`)
  }

  const sendMagicLink = async (shouldCreateUser: boolean) => {
    setIsSubmitting(true)
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser,
      },
    })

    // "가입된 계정이 없음"을 노출하지 않기 위해, 로그인 링크 요청이 해당 사유로 실패해도
    // 성공했을 때와 같은 안내 문구를 보여준다 (계정 존재 여부 추측 방지).
    if (otpError && !otpError.message.includes('Signups not allowed for otp')) {
      setError(mapAuthError(otpError.message, isKo))
      setIsSubmitting(false)
      return
    }

    setNotice(
      shouldCreateUser
        ? isKo
          ? '입력하신 이메일로 인증 링크를 보냈습니다. 링크를 클릭하면 비밀번호를 설정하고 시작할 수 있어요.'
          : "We've sent a verification link to your email. Click it to set a password and get started."
        : isKo
          ? '로그인 링크를 이메일로 보냈습니다. 메일함을 확인해주세요.'
          : "We've sent a login link to your email. Please check your inbox."
    )
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()

    if (mode === 'signup') {
      await sendMagicLink(true)
      return
    }

    if (loginMethod === 'link') {
      await sendMagicLink(false)
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(mapAuthError(signInError.message, isKo))
      setIsSubmitting(false)
      return
    }

    await redirectAfterAuth(data.user.id)
  }

  const inputStyle = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
  }

  return (
    <div className="mb-6">
      <div className="flex mb-4 rounded-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={() => {
            setMode('login')
            resetMessages()
          }}
          className="flex-1 py-2 text-sm font-medium cursor-pointer transition-colors"
          style={{
            backgroundColor: mode === 'login' ? 'var(--primary)' : 'transparent',
            color: mode === 'login' ? 'var(--primary-foreground)' : 'var(--neutral)',
          }}
        >
          {isKo ? '로그인' : 'Log In'}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            resetMessages()
          }}
          className="flex-1 py-2 text-sm font-medium cursor-pointer transition-colors"
          style={{
            backgroundColor: mode === 'signup' ? 'var(--primary)' : 'transparent',
            color: mode === 'signup' ? 'var(--primary-foreground)' : 'var(--neutral)',
          }}
        >
          {isKo ? '회원가입' : 'Sign Up'}
        </button>
      </div>

      {mode === 'login' && (
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('link')
              resetMessages()
            }}
            className="text-xs font-medium cursor-pointer pb-1"
            style={{
              color: loginMethod === 'link' ? 'var(--foreground)' : 'var(--neutral)',
              borderBottom: loginMethod === 'link' ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            {isKo ? '이메일 링크로 로그인' : 'Log in with email link'}
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password')
              resetMessages()
            }}
            className="text-xs font-medium cursor-pointer pb-1"
            style={{
              color: loginMethod === 'password' ? 'var(--foreground)' : 'var(--neutral)',
              borderBottom: loginMethod === 'password' ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            {isKo ? '비밀번호로 로그인' : 'Log in with password'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder={isKo ? '이메일' : 'Email'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2.5 text-sm outline-none rounded-sm"
          style={inputStyle}
        />
        {mode === 'login' && loginMethod === 'password' && (
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder={isKo ? '비밀번호' : 'Password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 text-sm outline-none rounded-sm"
            style={inputStyle}
          />
        )}

        {error && (
          <p className="text-xs" style={{ color: 'var(--destructive)' }}>
            {error}
          </p>
        )}
        {notice && (
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 rounded-sm"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            border: '1px solid rgba(0,0,0,0.07)',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting
            ? isKo
              ? '처리 중...'
              : 'Processing...'
            : mode === 'signup'
              ? isKo
                ? '인증 링크 받기'
                : 'Get Verification Link'
              : loginMethod === 'link'
                ? isKo
                  ? '로그인 링크 받기'
                  : 'Send Login Link'
                : isKo
                  ? '로그인'
                  : 'Log In'}
        </button>
      </form>
    </div>
  )
}
