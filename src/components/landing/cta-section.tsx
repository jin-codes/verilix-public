'use client'

import Link from 'next/link'
import { useCallback, useRef, useState, type PointerEvent } from 'react'
import { Reveal } from './reveal'

interface CtaDict {
  kicker: string
  heading: string
  subheading: string
  button: string
  note: string
}

export function CtaSection({ lang, dict }: { lang: string; dict: CtaDict }) {
  const ref = useRef<HTMLElement>(null)
  const [spot, setSpot] = useState({ x: 50, y: 50 })

  const handleMove = useCallback((e: PointerEvent<HTMLElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  return (
    <section
      ref={ref}
      id="cta"
      onPointerMove={handleMove}
      className="relative px-6 py-28 md:py-40 overflow-hidden"
      style={{ backgroundColor: 'var(--primary)' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(460px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.14), transparent 68%)`,
          transition: 'background 0.25s ease-out',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(circle at center, black, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 78%)',
        }}
      />

      <Reveal className="relative max-w-2xl mx-auto text-center">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: 'var(--primary-foreground)' }}
        >
          {dict.kicker}
        </span>
        <h2
          className="mt-5 font-semibold"
          style={{
            color: 'var(--primary-foreground)',
            fontSize: 'clamp(1.9rem, 4.4vw, 3rem)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {dict.heading}
        </h2>
        <p
          className="mt-4"
          style={{ color: 'var(--primary-foreground)', opacity: 0.82, fontSize: '16px', lineHeight: 1.6 }}
        >
          {dict.subheading}
        </p>
        <Link
          href={`/${lang}/login`}
          className="inline-flex items-center gap-2 mt-9 px-8 py-4 rounded-sm text-sm font-medium transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.98]"
          style={{ backgroundColor: 'var(--background)', color: 'var(--primary)' }}
        >
          {dict.button}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <p className="mt-4 text-xs" style={{ color: 'var(--primary-foreground)', opacity: 0.7 }}>
          {dict.note}
        </p>
      </Reveal>
    </section>
  )
}
