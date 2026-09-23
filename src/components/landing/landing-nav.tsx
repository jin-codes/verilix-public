'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LandingThemeToggle } from './landing-theme-toggle'

export function LandingNav({
  lang,
  loginLabel,
  signupLabel,
}: {
  lang: string
  loginLabel: string
  signupLabel: string
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const otherLang = lang === 'ko' ? 'en' : 'ko'

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6"
      style={{
        backgroundColor: scrolled ? 'var(--background)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
        <span className="text-base font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
          verilix
        </span>
        <nav className="flex items-center gap-3">
          <Link
            href={`/${otherLang}`}
            className="text-xs uppercase tracking-wide transition-opacity hover:opacity-70 px-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {otherLang}
          </Link>
          <LandingThemeToggle lang={lang} />
          <Link
            href={`/${lang}/login`}
            className="text-sm font-medium transition-opacity hover:opacity-70 px-1"
            style={{ color: 'var(--foreground)' }}
          >
            {loginLabel}
          </Link>
          <Link
            href={`/${lang}/login`}
            className="px-4 py-1.5 rounded-sm text-sm font-medium transition-opacity hover:opacity-85"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {signupLabel}
          </Link>
        </nav>
      </div>
    </header>
  )
}
