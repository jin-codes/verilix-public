'use client'

import { useEffect, useRef, useState } from 'react'
import { Reveal } from './reveal'

interface Step {
  number: string
  title: string
  description: string
}

export function LoopSection({
  heading,
  subheading,
  steps,
}: {
  heading: string
  subheading: string
  steps: Step[]
}) {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  // Fractional step index under the viewport's center line (0 .. steps.length - 1),
  // so the highlighted step and the orbit always match what is actually centered.
  const [pos, setPos] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const mid = window.innerHeight / 2
      const centers = stepRefs.current.map((el) => {
        if (!el) return 0
        const r = el.getBoundingClientRect()
        return r.top + r.height / 2
      })
      let next = 0
      if (mid >= centers[centers.length - 1]) next = centers.length - 1
      else if (mid > centers[0]) {
        for (let i = 0; i < centers.length - 1; i++) {
          if (mid <= centers[i + 1]) {
            next = i + (mid - centers[i]) / (centers[i + 1] - centers[i])
            break
          }
        }
      }
      setPos(next)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const active = Math.round(pos)
  // The orbit dot sits exactly on a station whenever a step is centered.
  const p = pos / steps.length

  return (
    <section
      id="loop"
      className="relative px-6 py-16 md:py-32"
      style={{ backgroundColor: 'var(--muted)' }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal className="mb-8 md:mb-24 max-w-2xl">
          <h2
            className="font-semibold"
            style={{
              color: 'var(--foreground)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            {heading}
          </h2>
          <p
            className="mt-4"
            style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}
          >
            {subheading}
          </p>
        </Reveal>

        <div className="grid md:grid-cols-[1fr_1fr] gap-x-12">
          <div className="flex flex-col">
            {steps.map((step, i) => (
              <div
                key={step.number}
                ref={(el) => {
                  stepRefs.current[i] = el
                }}
                className="flex items-center py-5 md:py-0 md:min-h-[48vh] border-t first:border-t-0 md:border-t-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="md:opacity-[var(--step-o)] md:[transform:var(--step-t)]"
                  style={{
                    ['--step-o' as string]: active === i ? 1 : 0.4,
                    ['--step-t' as string]: active === i ? 'translateX(0)' : 'translateX(-8px)',
                    transition: 'opacity 0.45s ease, transform 0.45s ease',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono"
                      style={{
                        border: `1px solid ${active >= i ? 'var(--primary)' : 'var(--border-strong)'}`,
                        color: active >= i ? 'var(--primary)' : 'var(--muted-foreground)',
                        backgroundColor:
                          active === i ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
                        transition: 'all 0.4s ease',
                      }}
                    >
                      {step.number}
                    </span>
                    <h3 className="font-semibold" style={{ color: 'var(--foreground)', fontSize: '24px' }}>
                      {step.title}
                    </h3>
                  </div>
                  <p
                    className="mt-2 md:mt-3 max-w-sm pl-10"
                    style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.65 }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block sticky top-0 h-screen">
            <div className="h-full flex items-center justify-center">
              <OrbitVisual
                progress={p}
                active={active}
                total={steps.length}
                label={steps[active]?.title ?? ''}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function OrbitVisual({
  progress,
  active,
  total,
  label,
}: {
  progress: number
  active: number
  total: number
  label: string
}) {
  const size = 300
  const c = size / 2
  const radius = 108
  const circ = 2 * Math.PI * radius

  const stations = Array.from({ length: total }, (_, i) => {
    const ang = (-90 + (360 / total) * i) * (Math.PI / 180)
    return { x: c + radius * Math.cos(ang), y: c + radius * Math.sin(ang) }
  })

  const exact = progress * total
  const nearStation = Math.abs(exact - Math.round(exact))
  const travelAng = (-90 + 360 * progress) * (Math.PI / 180)
  const travel = { x: c + radius * Math.cos(travelAng), y: c + radius * Math.sin(travelAng) }

  return (
    <div
      className="relative rounded-lg flex items-center justify-center"
      style={{
        width: size + 72,
        height: size + 72,
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={radius} fill="none" stroke="var(--border)" strokeWidth={1.5} />
        <circle
          cx={c}
          cy={c}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: 'stroke-dashoffset 0.12s linear' }}
        />
        {stations.map((s, i) => (
          <g key={i}>
            <circle
              cx={s.x}
              cy={s.y}
              r={active === i ? 9 : 5}
              fill={i <= active ? 'var(--primary)' : 'var(--border-strong)'}
              style={{ transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}
            />
            {active === i && (
              <circle
                cx={s.x}
                cy={s.y}
                r={16}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={1.5}
                opacity={0.4}
              />
            )}
          </g>
        ))}
        <circle
          cx={travel.x}
          cy={travel.y}
          r={5.5}
          fill="var(--primary-foreground)"
          stroke="var(--primary)"
          strokeWidth={2.5}
          opacity={Math.min(1, nearStation * 8)}
          style={{ transition: 'cx 0.12s linear, cy 0.12s linear' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center px-8">
        <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
          {`0${active + 1} / 0${total}`}
        </span>
        <span
          className="mt-2 font-semibold max-w-[190px]"
          style={{ color: 'var(--foreground)', fontSize: '17px' }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
