import { hasLocale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import LoginButton from './LoginButton'
import EmailAuthForm from './EmailAuthForm'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function LoginPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-lg"
        style={{
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        {/* 로고 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            verilix
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--neutral)' }}>
            {lang === 'ko' ? '나만의 AI 지식 파트너' : 'Your AI Knowledge Partner'}
          </p>
        </div>

        {/* 이메일 로그인/회원가입 */}
        <EmailAuthForm lang={lang} />

        {/* 구분선 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--neutral)' }}>
            {lang === 'ko' ? '또는' : 'or'}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        {/* Google 로그인 버튼 */}
        <LoginButton lang={lang} />

        {/* 하단 안내 */}
        <p className="mt-6 text-xs text-center" style={{ color: 'var(--neutral)' }}>
          {lang === 'ko'
            ? '계속하면 이용약관 및 개인정보처리방침에 동의합니다.'
            : 'By continuing, you agree to our Terms and Privacy Policy.'}
        </p>
      </div>
    </main>
  )
}
