'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { useReducedMotion } from './use-reduced-motion'

interface HeroDict {
  eyebrow: string
  titleLines: string[]
  subtitle: string
  cta: string
  ctaSecondary: string
  freeNote: string
  scrollHint: string
}

/** Deterministic PRNG so the node field is identical every render. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const VIEW = 1000
const NODE_COUNT = 30
const LINK_DIST = 260

interface Node {
  bx: number
  by: number
  phase: number
  freq: number
  amp: number
  r: number
}

export function HeroSection({ lang, dict }: { lang: string; dict: HeroDict }) {
  const sectionRef = useRef<HTMLElement>(null)
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([])
  const linkRefs = useRef<(SVGLineElement | null)[]>([])
  const pointer = useRef({ x: VIEW / 2, y: VIEW / 2, energy: 0 })
  const tiltRef = useRef({ x: 0, y: 0 })
  const parallax = useRef({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const reduced = useReducedMotion()

  const { nodes, links } = useMemo(() => {
    const rand = mulberry32(9161)
    const ns: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      bx: rand() * VIEW,
      by: rand() * VIEW,
      phase: rand() * Math.PI * 2,
      freq: 0.15 + rand() * 0.4,
      amp: 8 + rand() * 26,
      r: 1.6 + rand() * 3.4,
    }))
    const ls: [number, number][] = []
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const d = Math.hypot(ns[i].bx - ns[j].bx, ns[i].by - ns[j].by)
        if (d < LINK_DIST) ls.push([i, j])
      }
    }
    return { nodes: ns, links: ls }
  }, [])

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const rect = sectionRef.current?.getBoundingClientRect()
      if (!rect) return
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * VIEW
      pointer.current.y = ((e.clientY - rect.top) / rect.height) * VIEW
      pointer.current.energy = 1
      const nx = (e.clientX - rect.left) / rect.width - 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5
      tiltRef.current = { x: nx, y: ny }
      if (!reduced) setTilt({ x: nx, y: ny })
    },
    [reduced]
  )

  const handlePointerLeave = useCallback(() => {
    tiltRef.current = { x: 0, y: 0 }
    setTilt({ x: 0, y: 0 })
  }, [])

  // Constellation loop — writes SVG geometry directly to avoid re-rendering
  // 30 nodes + ~40 links every frame. Reads pointer/tilt from refs so it is
  // set up once, not torn down on every mouse move.
  useEffect(() => {
    const positions = nodes.map((n) => ({ x: n.bx, y: n.by }))

    const paint = () => {
      nodes.forEach((_, i) => {
        const el = nodeRefs.current[i]
        if (el) {
          el.setAttribute('cx', String(positions[i].x))
          el.setAttribute('cy', String(positions[i].y))
        }
      })
      links.forEach(([a, b], i) => {
        const el = linkRefs.current[i]
        if (!el) return
        const pa = positions[a]
        const pb = positions[b]
        const d = Math.hypot(pa.x - pb.x, pa.y - pb.y)
        el.setAttribute('x1', String(pa.x))
        el.setAttribute('y1', String(pa.y))
        el.setAttribute('x2', String(pb.x))
        el.setAttribute('y2', String(pb.y))
        el.setAttribute('stroke-opacity', String(Math.max(0, 0.5 - d / LINK_DIST) * 0.7))
      })
    }

    if (reduced) {
      paint()
      return
    }

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = (now - start) / 1000
      const p = pointer.current
      p.energy *= 0.94
      parallax.current.x += (tiltRef.current.x * -26 - parallax.current.x) * 0.06
      parallax.current.y += (tiltRef.current.y * -26 - parallax.current.y) * 0.06

      nodes.forEach((n, i) => {
        let x = n.bx + Math.sin(t * n.freq + n.phase) * n.amp + parallax.current.x
        let y = n.by + Math.cos(t * n.freq * 0.9 + n.phase) * n.amp + parallax.current.y
        const dx = x - p.x
        const dy = y - p.y
        const dist = Math.hypot(dx, dy)
        const reach = 220
        if (dist < reach) {
          const force = (1 - dist / reach) * 46 * (0.35 + p.energy)
          x += (dx / (dist || 1)) * force
          y += (dy / (dist || 1)) * force
        }
        positions[i].x += (x - positions[i].x) * 0.16
        positions[i].y += (y - positions[i].y) * 0.16
      })

      paint()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [nodes, links, reduced])

  useEffect(() => {
    let rafId: number | null = null
    const update = () => {
      rafId = null
      setScrollY(window.scrollY)
    }
    const onScroll = () => {
      if (rafId != null) return
      rafId = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [])

  const exit = Math.min(1, scrollY / 620)

  return (
    <section
      ref={sectionRef}
      id="hero"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-6"
      style={{
        backgroundImage:
          'radial-gradient(color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px)',
        backgroundSize: '26px 26px',
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(420px circle at ${50 + tilt.x * 60}% ${44 + tilt.y * 60}%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%)`,
          transition: 'background 0.3s ease-out',
        }}
      />

      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.9 - exit * 0.6 }}
      >
        {links.map((_, i) => (
          <line
            key={i}
            ref={(el) => {
              linkRefs.current[i] = el
            }}
            stroke="var(--primary)"
            strokeWidth={1}
          />
        ))}
        {nodes.map((n, i) => (
          <circle
            key={i}
            ref={(el) => {
              nodeRefs.current[i] = el
            }}
            r={n.r}
            fill={i % 4 === 0 ? 'var(--primary)' : 'var(--border-strong)'}
            opacity={i % 4 === 0 ? 0.9 : 0.6}
          />
        ))}
      </svg>

      <div
        className="relative flex flex-col items-center text-center"
        style={{
          opacity: 1 - exit * 0.95,
          transform: `translateY(${exit * -48}px) translate(${tilt.x * -8}px, ${tilt.y * -8}px)`,
          transition: 'transform 0.4s ease-out',
        }}
      >
        <p
          className="text-[11px] tracking-[0.28em] uppercase mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          {dict.eyebrow}
        </p>
        <h1
          className="font-semibold max-w-[18ch]"
          style={{
            color: 'var(--foreground)',
            fontSize: 'clamp(2.6rem, 6.4vw, 4.6rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
          }}
        >
          {dict.titleLines.map((line, i) => (
            <span
              key={i}
              className="block"
              style={{
                opacity: 1 - exit,
                transform: `translateY(${exit * (i + 1) * 10}px)`,
              }}
            >
              {line}
            </span>
          ))}
        </h1>
        <p
          className="mt-7 max-w-[46ch]"
          style={{ color: 'var(--text-secondary)', fontSize: '17px', lineHeight: 1.65 }}
        >
          {dict.subtitle}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={`/${lang}/login`}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-sm text-sm font-medium transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.98]"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {dict.cta}
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
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium"
            style={{ border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            {dict.ctaSecondary}
          </span>
        </div>
        <p className="mt-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {dict.freeNote}
        </p>
      </div>

      <div
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'var(--muted-foreground)', opacity: 1 - exit * 1.6 }}
      >
        <span className="text-[11px] tracking-wide uppercase">{dict.scrollHint}</span>
        <svg className="animate-bounce" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 6l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  )
}
