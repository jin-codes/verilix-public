'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, X, KeyRound, LogIn } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { Reveal } from './reveal'
import { SpotlightCard } from './spotlight-card'
import { useScrollScrub } from './use-scroll-scrub'
import { useReducedMotion } from './use-reduced-motion'

const MCP_SERVER_URL = 'https://verilix.vercel.app/api/mcp'

interface ConnectDict {
  badge: string
  heading: string
  subheading: string
  serverLabel: string
  serverHint: string
  methods: { title: string; description: string }[]
  terminalLabel: string
  calls: { tool: string; detail: string }[]
  copy: string
  copied: string
}

const METHOD_ICONS = [LogIn, KeyRound]

export function ConnectSection({ dict }: { dict: ConnectDict }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const { ref, progress } = useScrollScrub<HTMLElement>()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (status === 'idle') return
    const t = setTimeout(() => setStatus('idle'), 1600)
    return () => clearTimeout(t)
  }, [status])

  const handleCopy = async () => {
    const ok = await copyToClipboard(MCP_SERVER_URL)
    setStatus(ok ? 'copied' : 'error')
  }

  const p = reduced ? 1 : Math.min(1, Math.max(0, (progress - 0.2) / 0.5))
  const visibleCalls = reduced ? dict.calls.length : Math.round(p * dict.calls.length + 0.35)

  return (
    <section ref={ref} id="connect" className="relative px-6 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <Reveal className="mb-14 md:mb-16 max-w-2xl">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
            style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            {dict.badge}
          </span>
          <h2
            className="mt-4 font-semibold"
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

        <div className="grid md:grid-cols-2 gap-5">
          <Reveal direction="left">
            <SpotlightCard
              className="h-full rounded-lg p-6"
              style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {dict.serverLabel}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {dict.serverHint}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code
                  className="flex-1 text-[13px] px-3 py-2 overflow-x-auto whitespace-nowrap rounded-sm font-mono"
                  style={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  {MCP_SERVER_URL}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-medium cursor-pointer transition-opacity hover:opacity-85"
                  style={{
                    backgroundColor: status === 'error' ? 'var(--destructive)' : 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  {status === 'copied' ? (
                    <Check size={13} />
                  ) : status === 'error' ? (
                    <X size={13} />
                  ) : (
                    <Copy size={13} />
                  )}
                  {status === 'copied' ? dict.copied : dict.copy}
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                {dict.methods.map((m, i) => {
                  const Icon = METHOD_ICONS[i % METHOD_ICONS.length]
                  return (
                    <div
                      key={m.title}
                      className="flex items-start gap-3 p-3 rounded-md"
                      style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                    >
                      <Icon size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                          {m.title}
                        </p>
                        <p
                          className="mt-0.5 text-xs"
                          style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}
                        >
                          {m.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal direction="right">
            <div
              className="h-full rounded-lg overflow-hidden"
              style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)' }}
            >
              <div
                className="flex items-center gap-1.5 px-5 py-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />
                <span
                  className="ml-2 text-[11px] uppercase tracking-wider font-mono"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {dict.terminalLabel}
                </span>
              </div>
              <div className="px-5 py-5 flex flex-col gap-3.5 font-mono text-[13px]">
                {dict.calls.map((call, i) => {
                  const shown = i < visibleCalls
                  return (
                    <div
                      key={call.tool}
                      style={{
                        opacity: shown ? 1 : 0.22,
                        transform: shown ? 'translateY(0)' : 'translateY(6px)',
                        transition: 'opacity 0.4s ease, transform 0.4s ease',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ color: 'var(--primary)' }}>→</span>
                        <span style={{ color: 'var(--foreground)' }}>{call.tool}</span>
                      </div>
                      <p
                        className="mt-1 pl-5 text-xs"
                        style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                      >
                        {call.detail}
                      </p>
                    </div>
                  )
                })}
                <div
                  className="pl-0 flex items-center gap-2"
                  style={{ opacity: visibleCalls >= dict.calls.length ? 1 : 0.22 }}
                >
                  <span style={{ color: 'var(--primary)' }}>→</span>
                  <span
                    className="inline-block w-2 h-4"
                    style={{ backgroundColor: 'var(--primary)', animation: 'landing-caret 1.1s step-end infinite' }}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
