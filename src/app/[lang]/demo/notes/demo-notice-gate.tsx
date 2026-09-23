'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import LogoLockup from '@/components/layout/logo-lockup'

interface DemoNoticeGateProps {
  lang: string
  children: React.ReactNode
}

// 데모 화면 앞에 "가상 데모"임을 알리는 안내를 띄우고, 확인 버튼을 눌러야 입장시킨다.
// 보안 게이트가 아니라 오해 방지용 안내라 상태는 방문마다 초기화한다(새로고침하면 다시 안내).
export default function DemoNoticeGate({ lang, children }: DemoNoticeGateProps) {
  const isKo = lang === 'ko'
  const [entered, setEntered] = useState(false)

  if (entered) return <>{children}</>

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
      <div
        className="w-full max-w-sm p-8 rounded-lg"
        style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid rgba(0,0,0,0.07)' }}
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoLockup className="h-6 w-auto mb-4" />
          <div
            className="flex items-center justify-center w-9 h-9 rounded-full mb-3"
            style={{ backgroundColor: 'var(--sidebar)' }}
          >
            <Info className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            {isKo ? '이 화면은 가상 데모이며 실제 화면이 아닙니다.' : 'This is a fictional demo, not the real app.'}
          </p>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--neutral)' }}>
            {isKo
              ? '가상의 사용자 데이터로 구성된 지식 베이스 예시입니다. 표시되는 인물과 문서는 모두 실제가 아닙니다.'
              : 'A sample knowledge base built from a fictional persona. The person and documents shown are not real.'}
          </p>
        </div>

        <button
          type="button"
          autoFocus
          onClick={() => setEntered(true)}
          className="w-full py-2.5 text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 rounded-sm"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            border: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          {isKo ? '확인하고 입장' : 'Got it, enter demo'}
        </button>
      </div>
    </main>
  )
}
