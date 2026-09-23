'use client'

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'

/**
 * Card with a cursor-following radial highlight and a faint lift on hover.
 * The highlight position is written to CSS custom properties so pointer moves
 * never trigger a React re-render.
 */
export function SpotlightCard({
  children,
  className = '',
  style,
  tint = 'var(--primary)',
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  tint?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef<number | null>(null)

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty('--spot-x', `${x}px`)
      el.style.setProperty('--spot-y', `${y}px`)
      el.style.setProperty('--spot-opacity', '1')
    })
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--spot-opacity', '0')
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`group relative overflow-hidden ${className}`}
      style={{
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.35s ease',
        ['--spot-opacity' as string]: '0',
        ...style,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(260px circle at var(--spot-x, 50%) var(--spot-y, 0%), color-mix(in srgb, ' +
            tint +
            ' 16%, transparent), transparent 68%)',
          opacity: 'var(--spot-opacity)',
          transition: 'opacity 0.3s ease',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
