'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const OFFSETS: Record<'up' | 'left' | 'right', (distance: number) => CSSProperties> = {
  up: (d) => ({ transform: `translateY(${d}px)` }),
  left: (d) => ({ transform: `translateX(${-d}px)` }),
  right: (d) => ({ transform: `translateX(${d}px)` }),
}

export function Reveal({
  children,
  className = '',
  delayMs = 0,
  y = 24,
  direction = 'up',
  style,
}: {
  children: ReactNode
  className?: string
  delayMs?: number
  y?: number
  direction?: 'up' | 'left' | 'right'
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0px, 0px)' : OFFSETS[direction](y).transform,
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
