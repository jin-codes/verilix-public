'use client'

import { Reveal } from './reveal'
import { useScrollScrub } from './use-scroll-scrub'
import { useReducedMotion } from './use-reduced-motion'

interface DistillDict {
  heading: string
  subheading: string
  transcriptLabel: string
  transcript: { role: string; text: string }[]
  docLabel: string
  docTitle: string
  fields: { heading: string; body: string }[]
  categoryLabel: string
  category: string
  tagsLabel: string
  tags: string[]
}

const band = (p: number, from: number, width = 0.09) =>
  Math.min(1, Math.max(0, (p - from) / width))

export function DistillSection({ dict }: { dict: DistillDict }) {
  const { ref, progress } = useScrollScrub<HTMLElement>()
  const reduced = useReducedMotion()

  // Finish the reveal while the panel is still pinned (the section is 260vh
  // but the sticky content unpins once its bottom clears the viewport).
  const raw = Math.min(1, Math.max(0, (progress - 0.08) / 0.6))
  const p = reduced ? 1 : raw

  const fieldStart = 0.34
  const fieldEnd = 0.84
  const fieldStep = dict.fields.length > 1 ? (fieldEnd - fieldStart) / (dict.fields.length - 1) : 0

  return (
    <section ref={ref} id="distill" className="relative px-6 md:min-h-[260vh]">
      <div className="md:sticky md:top-0 md:min-h-screen flex flex-col justify-center py-16 md:py-20">
        <div className="max-w-6xl mx-auto w-full">
          <Reveal className="mb-10 md:mb-14 max-w-2xl">
            <h2
              className="font-semibold"
              style={{
                color: 'var(--foreground)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                letterSpacing: '-0.02em',
              }}
            >
              {dict.heading}
            </h2>
            <p
              className="mt-4"
              style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}
            >
              {dict.subheading}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-[1fr_auto_1fr] items-stretch gap-5 md:gap-0">
            {/* transcript */}
            <div
              className="rounded-lg p-5 md:p-6"
              style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)' }}
            >
              <span
                className="text-[11px] uppercase tracking-wider font-mono"
                style={{ color: 'var(--text-secondary)' }}
              >
                {dict.transcriptLabel}
              </span>
              <div className="mt-4 flex flex-col gap-2.5">
                {dict.transcript.map((m, i) => {
                  const consumed = band(p, 0.04 + i * 0.07, 0.12)
                  const isYou = i % 2 === 0
                  return (
                    <div
                      key={i}
                      className={`max-w-[92%] rounded-sm px-3.5 py-2 text-[13px] ${
                        isYou ? 'self-end' : 'self-start'
                      }`}
                      style={{
                        backgroundColor: isYou ? 'var(--primary)' : 'var(--background)',
                        color: isYou ? 'var(--primary-foreground)' : 'var(--foreground)',
                        border: isYou ? 'none' : '1px solid var(--border)',
                        lineHeight: 1.5,
                        opacity: 1 - consumed * 0.68,
                        filter: `blur(${consumed * 1.4}px) saturate(${1 - consumed * 0.6})`,
                        transform: `translateX(${(isYou ? 1 : -1) * consumed * 10}px)`,
                        transition: 'opacity 0.2s linear, filter 0.2s linear, transform 0.2s linear',
                      }}
                    >
                      {m.text}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* distillation beam */}
            <div className="hidden md:flex flex-col items-center justify-center px-6 w-[64px]">
              <div
                className="relative w-[3px] rounded-full overflow-hidden"
                style={{ height: '62%', backgroundColor: 'var(--border)' }}
              >
                <div
                  className="absolute left-0 top-0 w-full"
                  style={{
                    height: `${p * 100}%`,
                    background:
                      'linear-gradient(to bottom, color-mix(in srgb, var(--primary) 30%, transparent), var(--primary))',
                    transition: 'height 0.12s linear',
                  }}
                />
              </div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                className="mt-2 rotate-90"
                style={{ color: 'var(--primary)', opacity: 0.35 + p * 0.65 }}
              >
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* structured document */}
            <div
              className="rounded-lg p-5 md:p-6"
              style={{
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] uppercase tracking-wider font-mono"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {dict.docLabel}
                </span>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-mono"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                    color: 'var(--primary)',
                    opacity: band(p, 0.9, 0.08),
                    transition: 'opacity 0.15s linear',
                  }}
                >
                  {dict.categoryLabel}: {dict.category}
                </span>
              </div>

              <h3
                className="mt-3 font-semibold"
                style={{
                  color: 'var(--foreground)',
                  fontSize: '19px',
                  opacity: band(p, 0.2),
                  transform: `translateY(${(1 - band(p, 0.2)) * 8}px)`,
                  transition: 'opacity 0.15s linear, transform 0.15s linear',
                }}
              >
                {dict.docTitle}
              </h3>

              <div className="mt-4 flex flex-col gap-3.5">
                {dict.fields.map((f, i) => {
                  const t = band(p, fieldStart + i * fieldStep)
                  return (
                    <div
                      key={i}
                      style={{
                        opacity: t,
                        transform: `translateY(${(1 - t) * 10}px)`,
                        transition: 'opacity 0.15s linear, transform 0.15s linear',
                      }}
                    >
                      <p
                        className="text-[11px] font-medium uppercase tracking-wide"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {f.heading}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--foreground)', lineHeight: 1.55 }}>
                        {f.body}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div
                className="mt-4 flex flex-wrap items-center gap-2"
                style={{ opacity: band(p, 0.86, 0.1), transition: 'opacity 0.15s linear' }}
              >
                <span
                  className="text-[11px] font-medium uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {dict.tagsLabel}
                </span>
                {dict.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-xs"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--text-secondary)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
