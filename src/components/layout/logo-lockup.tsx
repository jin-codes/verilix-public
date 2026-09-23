import React from 'react'

interface LogoLockupProps {
  className?: string
}

/**
 * verilix 가로 로크업 (노드 마크 + "verilix" 워드마크).
 * 잉크 색은 currentColor를 타서 라이트/다크 자동 전환되고, 중앙 점만 버건디 액센트(--tertiary).
 * 바깥 노드 원의 채움은 배경과 같은 --sidebar 라 선만 보인다.
 */
export default function LogoLockup({ className }: LogoLockupProps) {
  return (
    <svg
      viewBox="8 4 296 92"
      className={className}
      role="img"
      aria-label="verilix"
      style={{ color: 'var(--foreground)', display: 'block' }}
    >
      <line x1="49" y1="51" x2="45" y2="19" stroke="currentColor" strokeWidth="5" />
      <line x1="49" y1="51" x2="83" y2="58" stroke="currentColor" strokeWidth="5" />
      <line x1="49" y1="51" x2="27" y2="80" stroke="currentColor" strokeWidth="5" />
      <circle cx="45" cy="19" r="7.5" fill="var(--sidebar)" stroke="currentColor" strokeWidth="5" />
      <circle cx="83" cy="58" r="11" fill="var(--sidebar)" stroke="currentColor" strokeWidth="5" />
      <circle cx="27" cy="80" r="9" fill="var(--sidebar)" stroke="currentColor" strokeWidth="5" />
      <circle cx="49" cy="51" r="17" fill="var(--tertiary)" />
      <text
        x="122"
        y="66"
        fontFamily="var(--font-inter), Helvetica Neue, Helvetica, Arial, sans-serif"
        fontSize="58"
        fontWeight="600"
        letterSpacing="-0.6"
        fill="currentColor"
      >
        verilix
      </text>
    </svg>
  )
}
